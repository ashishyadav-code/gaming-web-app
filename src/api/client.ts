import {
  User, UserRole, Player, Tournament, Match, PracticeSession,
  IGLNote, DashboardSummary, DailyEvaluation, WeeklyEvaluation, PlayerProgressDetail
} from '../types';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173' ? '' : 'https://teamsarkar-server.onrender.com';

class ApiClient {
  private token: string | null = localStorage.getItem('sarkar_token') || 'ASHISH';
  private role: UserRole = (localStorage.getItem('sarkar_role') as UserRole) || 'IGL';
  private userId: string = localStorage.getItem('sarkar_user_id') || 'ASHISH';

  setAuth(token: string, role: UserRole, userId: string = 'ASHISH800') {
    this.token = token;
    this.role = role;
    this.userId = userId;
    localStorage.setItem('sarkar_token', token);
    localStorage.setItem('sarkar_role', role);
    localStorage.setItem('sarkar_user_id', userId);
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

  // 2-Layer Local Storage Helper (@teamSarkar_{userId}_{dataType})
  saveLocal<T>(dataType: string, data: T) {
    try {
      const key = `@teamSarkar_${this.userId.toLowerCase()}_${dataType}`;
      localStorage.setItem(key, JSON.stringify(data));
      // Trigger cloud sync in background
      this.syncToCloud(dataType, data).catch(() => {});
    } catch (e) {
      console.warn('Local storage write error:', e);
    }
  }

  getLocal<T>(dataType: string): T | null {
    try {
      const key = `@teamSarkar_${this.userId.toLowerCase()}_${dataType}`;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async syncToCloud<T>(dataType: string, data: T) {
    try {
      await fetch(`${API_BASE_URL}/api/user/${this.userId.toLowerCase()}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType, data })
      });
    } catch (e) {
      // Offline fallback: data remains in layer 1
    }
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
        if (errData && errData.detail) {
          errorMessage = errData.detail;
        }
      } catch {
        // default fallback
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Real Auth with MongoDB Atlas
  async loginWithCredentials(identifier: string, password: string): Promise<{ access_token: string; user: any }> {
    const res = await this.request<{ access_token: string; user: any }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setAuth(res.access_token, res.user.role, res.user.userId || res.user.id);
    this.saveLocal('profile', res.user);
    return res;
  }

  async registerUser(data: { userId: string; name?: string; email?: string; password: string; teamRole?: string }): Promise<{ access_token: string; user: any }> {
    const res = await this.request<{ access_token: string; user: any }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setAuth(res.access_token, res.user.role, res.user.userId || res.user.id);
    this.saveLocal('profile', res.user);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Matches (No Damage, with Kalahari & Date Filters)
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
      this.saveLocal('matches', data);
      return data;
    } catch (err) {
      // Layer 1 Offline Fallback
      const cached = this.getLocal<Match[]>('matches');
      if (cached) return cached;
      throw err;
    }
  }

  async createMatch(data: any): Promise<Match> {
    return this.request<Match>('/api/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMatch(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/matches/${id}`, {
      method: 'DELETE',
    });
  }

  // Players
  async getPlayers(status?: 'Active' | 'Inactive'): Promise<Player[]> {
    const query = status ? `?status_filter=${status}` : '';
    try {
      const data = await this.request<Player[]>(`/api/players${query}`);
      this.saveLocal('players', data);
      return data;
    } catch (err) {
      const cached = this.getLocal<Player[]>('players');
      if (cached) return cached;
      throw err;
    }
  }

  async getPlayerDetail(id: number): Promise<PlayerProgressDetail> {
    return this.request<PlayerProgressDetail>(`/api/players/${id}`);
  }

  async createPlayer(data: any): Promise<Player> {
    return this.request<Player>('/api/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlayerRole(playerId: number, newRole: string, reason?: string): Promise<any> {
    return this.request(`/api/players/${playerId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ team_role: newRole, reason }),
    });
  }

  // Tournaments & Practice
  async getTournaments(): Promise<Tournament[]> {
    return this.request<Tournament[]>('/api/tournaments');
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

  // Notes
  async getNotes(): Promise<IGLNote[]> {
    return this.request<IGLNote[]>('/api/notes');
  }

  async createNote(data: any): Promise<IGLNote> {
    return this.request<IGLNote>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getDashboardSummary(period: string = 'Today', dateFilter?: string): Promise<DashboardSummary> {
    const q = dateFilter && dateFilter !== 'All' ? `&date_filter=${encodeURIComponent(dateFilter)}` : '';
    return this.request<DashboardSummary>(`/api/analytics/dashboard?period=${period}${q}`);
  }

  async getDailyEvaluation(date: string = '25 Sept 2026'): Promise<DailyEvaluation> {
    return this.request<DailyEvaluation>(`/api/analytics/daily?date=${encodeURIComponent(date)}`);
  }

  async getWeeklyEvaluation(): Promise<WeeklyEvaluation> {
    return this.request<WeeklyEvaluation>('/api/analytics/weekly');
  }
}

export const api = new ApiClient();
