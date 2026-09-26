import {
  User, UserRole, Player, Tournament, Match, PracticeSession,
  IGLNote, DashboardSummary, DailyEvaluation, WeeklyEvaluation, PlayerProgressDetail
} from '../types';

const API_BASE_URL = 'https://teamsarkar-server-1.onrender.com';

// Cache keys
const CACHE_KEYS = {
  PLAYERS: 'sarkar_cache_players_v2',
  MATCHES: 'sarkar_cache_matches_v2',
  DASHBOARD: 'sarkar_cache_dashboard_v2',
  TOURNAMENTS: 'sarkar_cache_tournaments_v2',
  AUTH_TOKEN: 'sarkar_token',
  AUTH_ROLE: 'sarkar_role',
  AUTH_USER_ID: 'sarkar_user_id',
};

// Automatic Migration for legacy storage
function runStorageMigration() {
  if (typeof window === 'undefined') return;

  const currentUserId = localStorage.getItem(CACHE_KEYS.AUTH_USER_ID);
  if (currentUserId && (currentUserId.toUpperCase() === 'ASHISH800' || currentUserId.toLowerCase() === 'ashishji')) {
    localStorage.setItem(CACHE_KEYS.AUTH_USER_ID, 'ASHISH');
  }

  // Clear legacy mock database keys if any
  ['sarkar_db_players', 'sarkar_db_matches', 'sarkar_db_tournaments', 'sarkar_db_users'].forEach(k => {
    try { localStorage.removeItem(k); } catch {}
  });
}

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

class ApiClient {
  private token: string | null = null;
  private role: UserRole = 'PLAYER';
  private userId: string = '';

  constructor() {
    runStorageMigration();
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(CACHE_KEYS.AUTH_TOKEN);
      this.role = (localStorage.getItem(CACHE_KEYS.AUTH_ROLE) as UserRole) || 'PLAYER';
      this.userId = localStorage.getItem(CACHE_KEYS.AUTH_USER_ID) || '';
    }
  }

  setAuth(token: string, role: UserRole, userId: string = '') {
    this.token = token || null;
    this.role = role;
    this.userId = userId;
    if (token) {
      localStorage.setItem(CACHE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(CACHE_KEYS.AUTH_ROLE, role);
      localStorage.setItem(CACHE_KEYS.AUTH_USER_ID, userId);
    } else {
      localStorage.removeItem(CACHE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(CACHE_KEYS.AUTH_ROLE);
      localStorage.removeItem(CACHE_KEYS.AUTH_USER_ID);
    }
  }

  getRole(): UserRole {
    return this.role;
  }

  getUserId(): string {
    return this.userId;
  }

  getToken(): string | null {
    return this.token;
  }

  saveLocal<T>(dataType: string, data: T) {
    setCache(`@teamSarkar_${(this.userId || 'player').toLowerCase()}_${dataType}`, data);
  }

  getLocal<T>(dataType: string): T | null {
    return getCache<T>(`@teamSarkar_${(this.userId || 'player').toLowerCase()}_${dataType}`);
  }

  async syncToCloud<T>(_dataType: string, _data: T): Promise<void> {
    return Promise.resolve();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['X-User-Id'] = this.userId;
    }
    headers['X-User-Role'] = this.role;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData && errData.detail) errorMessage = errData.detail;
      } catch {}
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // ----------------- AUTHENTICATION -----------------
  async loginWithCredentials(identifier: string, password: string): Promise<{ access_token: string; user: any }> {
    const res = await this.request<{ access_token: string; user: any }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setAuth(res.access_token, res.user.role, res.user.userId || res.user.id);
    return res;
  }

  async registerUser(data: { userId: string; name?: string; email?: string; password: string; teamRole?: string }): Promise<{ access_token: string; user: any }> {
    const res = await this.request<{ access_token: string; user: any }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setAuth(res.access_token, res.user.role, res.user.userId || res.user.id);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // ----------------- MATCHES -----------------
  async getMatches(params?: { type?: string; map?: string; month?: string; date?: string; limit?: number }): Promise<Match[]> {
    const searchParams = new URLSearchParams();
    if (params?.type && params.type !== 'All') searchParams.append('type_filter', params.type);
    if (params?.map) searchParams.append('map_filter', params.map);
    if (params?.date && params.date !== 'All') searchParams.append('date_filter', params.date);
    else if (params?.month) searchParams.append('month_filter', params.month);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const q = searchParams.toString() ? `?${searchParams.toString()}` : '';

    try {
      const data = await this.request<Match[]>(`/api/matches${q}`);
      setCache(CACHE_KEYS.MATCHES, data);
      return data;
    } catch (err) {
      const cached = getCache<Match[]>(CACHE_KEYS.MATCHES);
      if (cached) return cached;
      throw err;
    }
  }

  async createMatch(data: any): Promise<Match> {
    const res = await this.request<Match>('/api/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Invalidate matches cache
    try { localStorage.removeItem(CACHE_KEYS.MATCHES); } catch {}
    return res;
  }

  async deleteMatch(id: number): Promise<{ message: string }> {
    const res = await this.request<{ message: string }>(`/api/matches/${id}`, {
      method: 'DELETE',
    });
    try { localStorage.removeItem(CACHE_KEYS.MATCHES); } catch {}
    return res;
  }

  // ----------------- PLAYERS -----------------
  async getPlayers(status?: 'Active' | 'Inactive'): Promise<Player[]> {
    const query = status ? `?status_filter=${status}` : '';
    try {
      const data = await this.request<Player[]>(`/api/players${query}`);
      setCache(CACHE_KEYS.PLAYERS, data);
      return data;
    } catch (err) {
      const cached = getCache<Player[]>(CACHE_KEYS.PLAYERS);
      if (cached) return cached;
      throw err;
    }
  }

  async getPlayerDetail(id: number): Promise<PlayerProgressDetail> {
    return this.request<PlayerProgressDetail>(`/api/players/${id}`);
  }

  async createPlayer(data: any): Promise<Player> {
    const res = await this.request<Player>('/api/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    try { localStorage.removeItem(CACHE_KEYS.PLAYERS); } catch {}
    return res;
  }

  async updatePlayerRole(playerId: number, newRole: string, reason?: string): Promise<any> {
    const res = await this.request(`/api/players/${playerId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ team_role: newRole, reason }),
    });
    try { localStorage.removeItem(CACHE_KEYS.PLAYERS); } catch {}
    return res;
  }

  // ----------------- TOURNAMENTS & PRACTICE -----------------
  async getTournaments(): Promise<Tournament[]> {
    try {
      const data = await this.request<Tournament[]>('/api/tournaments');
      setCache(CACHE_KEYS.TOURNAMENTS, data);
      return data;
    } catch (err) {
      const cached = getCache<Tournament[]>(CACHE_KEYS.TOURNAMENTS);
      if (cached) return cached;
      throw err;
    }
  }

  async createTournament(data: any): Promise<Tournament> {
    return this.request<Tournament>('/api/tournaments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPracticeSessions(): Promise<PracticeSession[]> {
    return this.request<PracticeSession[]>('/api/practice');
  }

  async createPracticeSession(data: any): Promise<PracticeSession> {
    return this.request<PracticeSession>('/api/practice', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ----------------- NOTES -----------------
  async getNotes(): Promise<IGLNote[]> {
    return this.request<IGLNote[]>('/api/notes');
  }

  async createNote(data: any): Promise<IGLNote> {
    return this.request<IGLNote>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ----------------- DASHBOARD & ANALYTICS -----------------
  async getDashboardSummary(period: string = 'Today', dateFilter?: string): Promise<DashboardSummary> {
    const q = dateFilter && dateFilter !== 'All' ? `&date_filter=${encodeURIComponent(dateFilter)}` : '';
    try {
      const data = await this.request<DashboardSummary>(`/api/analytics/dashboard?period=${period}${q}`);
      setCache(CACHE_KEYS.DASHBOARD, data);
      return data;
    } catch (err) {
      const cached = getCache<DashboardSummary>(CACHE_KEYS.DASHBOARD);
      if (cached) return cached;
      throw err;
    }
  }

  async getDailyEvaluation(date: string = '26 Sept 2026'): Promise<DailyEvaluation> {
    return this.request<DailyEvaluation>(`/api/analytics/daily?date=${encodeURIComponent(date)}`);
  }

  async getWeeklyEvaluation(): Promise<WeeklyEvaluation> {
    return this.request<WeeklyEvaluation>('/api/analytics/weekly');
  }
}

export const api = new ApiClient();
