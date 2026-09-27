import {
  User, UserRole, Player, Tournament, Match, PracticeSession,
  IGLNote, DashboardSummary, DailyEvaluation, WeeklyEvaluation, PlayerProgressDetail
} from '../types';
import { getTodayDateString } from '../utils/dateUtils';

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

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T) {
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
      this.userId = localStorage.getItem(CACHE_KEYS.AUTH_USER_ID) || 'ASHISH';
      this.role = (localStorage.getItem(CACHE_KEYS.AUTH_ROLE) as UserRole) || 'IGL';
      this.token = localStorage.getItem(CACHE_KEYS.AUTH_TOKEN) || this.userId;
    }
  }

  setAuth(token: string, role: UserRole, userId: string = '') {
    const finalUserId = userId || token || 'ASHISH';
    const finalToken = token || finalUserId;
    this.token = finalToken;
    this.role = role;
    this.userId = finalUserId;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEYS.AUTH_TOKEN, finalToken);
      localStorage.setItem(CACHE_KEYS.AUTH_ROLE, role);
      localStorage.setItem(CACHE_KEYS.AUTH_USER_ID, finalUserId);
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

  // Instant Synchronous Cache Accessors for Zero-Wait Rendering
  getCachedMatches(): Match[] {
    return getCache<Match[]>(CACHE_KEYS.MATCHES) || [];
  }

  getCachedPlayers(): Player[] {
    return getCache<Player[]>(CACHE_KEYS.PLAYERS) || [];
  }

  getCachedTournaments(): Tournament[] {
    return getCache<Tournament[]>(CACHE_KEYS.TOURNAMENTS) || [];
  }

  getCachedDashboard(): DashboardSummary | null {
    return getCache<DashboardSummary>(CACHE_KEYS.DASHBOARD);
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

    const effectiveToken = this.token || (this.userId ? this.userId : (this.role === 'IGL' ? 'ASHISH' : ''));
    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
    }
    const effectiveUserId = this.userId || (this.role === 'IGL' ? 'ASHISH' : '');
    if (effectiveUserId) {
      headers['X-User-Id'] = effectiveUserId;
    }
    headers['X-User-Role'] = this.role || 'IGL';

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

    const cached = this.getCachedMatches();

    const fetchPromise = this.request<Match[]>(`/api/matches${q}`)
      .then((data) => {
        setCache(CACHE_KEYS.MATCHES, data);
        return data;
      })
      .catch((err) => {
        if (cached.length > 0) return cached;
        throw err;
      });

    // If cache exists and no deep filter, return immediately for instant UI
    if (cached.length > 0 && !params?.map && !params?.type) {
      // Trigger background update silently
      fetchPromise.catch(() => {});
      return cached;
    }

    return fetchPromise;
  }

  async createMatch(data: any): Promise<Match> {
    // Optimistic instant match creation
    const optimisticMatch: Match = {
      id: Date.now(),
      team_id: data.team_id || 1,
      tournament_id: data.tournament_id,
      practice_session_id: data.practice_session_id,
      map: data.map,
      type: data.type || 'Tournament',
      date: data.date,
      time: data.time || '10:00 PM',
      placement: data.placement,
      team_kills: data.team_kills,
      team_damage: data.team_damage || (data.team_kills * 300),
      notes: data.notes || '',
      player_stats: data.player_stats || [],
    };

    const currentMatches = this.getCachedMatches();
    setCache(CACHE_KEYS.MATCHES, [optimisticMatch, ...currentMatches]);

    try {
      const res = await this.request<Match>('/api/matches', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Replace optimistic entry with server response
      const updated = this.getCachedMatches().map(m => m.id === optimisticMatch.id ? res : m);
      setCache(CACHE_KEYS.MATCHES, updated);
      return res;
    } catch {
      return optimisticMatch;
    }
  }

  async deleteMatch(id: number): Promise<{ message: string }> {
    const updated = this.getCachedMatches().filter(m => m.id !== id);
    setCache(CACHE_KEYS.MATCHES, updated);
    return this.request<{ message: string }>(`/api/matches/${id}`, {
      method: 'DELETE',
    });
  }

  // ----------------- PLAYERS -----------------
  async getPlayers(status?: 'Active' | 'Inactive'): Promise<Player[]> {
    const query = status ? `?status_filter=${status}` : '';
    const cached = this.getCachedPlayers();

    const fetchPromise = this.request<Player[]>(`/api/players${query}`)
      .then((data) => {
        setCache(CACHE_KEYS.PLAYERS, data);
        return data;
      })
      .catch((err) => {
        if (cached.length > 0) return cached;
        throw err;
      });

    if (cached.length > 0 && !status) {
      fetchPromise.catch(() => {});
      return cached;
    }

    return fetchPromise;
  }

  async getPlayerDetail(id: number): Promise<PlayerProgressDetail> {
    return this.request<PlayerProgressDetail>(`/api/players/${id}`);
  }

  async createPlayer(data: any): Promise<Player> {
    const optimisticPlayer: Player = {
      id: Date.now(),
      player_name: data.player_name,
      ign: data.ign,
      team_role: data.team_role,
      status: 'Active',
      avatar_url: data.avatar_url,
      joined_at: data.joined_at,
      matches_count: 0,
      total_kills: 0,
      total_damage: data.total_damage || 0,
      total_assists: data.total_assists || 0,
      total_deaths: data.total_deaths || 0,
      kd: 0,
      avg_damage: 0,
      survival_rate: 65,
      trend: 'stable',
      role_history: [],
    };
    const current = this.getCachedPlayers();
    setCache(CACHE_KEYS.PLAYERS, [...current, optimisticPlayer]);

    try {
      const res = await this.request<Player>('/api/players', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const updated = this.getCachedPlayers().map(p => p.id === optimisticPlayer.id ? res : p);
      setCache(CACHE_KEYS.PLAYERS, updated);
      return res;
    } catch {
      return optimisticPlayer;
    }
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
    const cached = this.getCachedTournaments();
    const fetchPromise = this.request<Tournament[]>('/api/tournaments')
      .then((data) => {
        setCache(CACHE_KEYS.TOURNAMENTS, data);
        return data;
      })
      .catch((err) => {
        if (cached.length > 0) return cached;
        throw err;
      });

    if (cached.length > 0) {
      fetchPromise.catch(() => {});
      return cached;
    }

    return fetchPromise;
  }

  async createTournament(data: any): Promise<Tournament> {
    const optimisticTourn: Tournament = {
      id: Date.now(),
      name: data.name,
      date: data.date,
      status: data.status || 'Upcoming',
      notes: data.notes || '',
      matches_count: 0,
      avg_placement: 0,
      total_kills: 0,
      avg_kills: 0,
      total_damage: 0,
      avg_damage: 0,
      booyah_count: 0,
      matches: [],
    };
    const current = this.getCachedTournaments();
    setCache(CACHE_KEYS.TOURNAMENTS, [optimisticTourn, ...current]);

    try {
      const res = await this.request<Tournament>('/api/tournaments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const updated = this.getCachedTournaments().map(t => t.id === optimisticTourn.id ? res : t);
      setCache(CACHE_KEYS.TOURNAMENTS, updated);
      return res;
    } catch {
      return optimisticTourn;
    }
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
    const cached = this.getCachedDashboard();

    const fetchPromise = this.request<DashboardSummary>(`/api/analytics/dashboard?period=${period}${q}`)
      .then((data) => {
        setCache(CACHE_KEYS.DASHBOARD, data);
        return data;
      })
      .catch((err) => {
        if (cached) return cached;
        throw err;
      });

    if (cached && !dateFilter) {
      fetchPromise.catch(() => {});
      return cached;
    }

    return fetchPromise;
  }

  async getDailyEvaluation(date: string = getTodayDateString()): Promise<DailyEvaluation> {
    return this.request<DailyEvaluation>(`/api/analytics/daily?date=${encodeURIComponent(date)}`);
  }

  async getWeeklyEvaluation(): Promise<WeeklyEvaluation> {
    return this.request<WeeklyEvaluation>('/api/analytics/weekly');
  }
}

export const api = new ApiClient();
