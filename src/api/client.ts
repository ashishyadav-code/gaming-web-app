import {
  User, UserRole, Player, Tournament, Match, PracticeSession,
  IGLNote, DashboardSummary, DailyEvaluation, WeeklyEvaluation, PlayerProgressDetail
} from '../types';

// Client-side Local Storage Database Keys
const STORAGE_KEYS = {
  USERS: 'sarkar_db_users',
  PLAYERS: 'sarkar_db_players',
  MATCHES: 'sarkar_db_matches',
  TOURNAMENTS: 'sarkar_db_tournaments',
  PRACTICE: 'sarkar_db_practice',
  NOTES: 'sarkar_db_notes',
  AUTH_TOKEN: 'sarkar_token',
  AUTH_ROLE: 'sarkar_role',
  AUTH_USER_ID: 'sarkar_user_id',
};

// Master Admin User
// Master Admin User (Ashish - IGL & Sniper)
const MASTER_USER = {
  userId: 'ASHISH',
  name: 'Ashish',
  ign: 'HASHIRAMA 777',
  email: 'ashish@teamsarkar.com',
  role: 'IGL' as UserRole,
  teamRole: 'Sniper',
  password: 'ASHISH',
};

// Initial Seed Setup with Official 4-Player Roster
function initializeLocalStorageDB() {
  if (typeof window === 'undefined') return;

  // 1. Users (Only 4 official team members)
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      MASTER_USER,
      {
        userId: 'ITACHI 777',
        name: 'Shashank',
        ign: 'SRK•ITACHI 777',
        role: 'PLAYER' as UserRole,
        teamRole: 'Primary Rusher',
        password: 'password123',
      },
      {
        userId: 'TuUFAN   777',
        name: 'Priyanshu',
        ign: 'SRK•TUUFAN   777',
        role: 'PLAYER' as UserRole,
        teamRole: 'Assaulter',
        password: 'password123',
      },
      {
        userId: 'PANDIT    777',
        name: 'Ansh mishra',
        ign: 'SRK•PANDIT    777',
        role: 'PLAYER' as UserRole,
        teamRole: '2nd Rusher',
        password: 'password123',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 2. Official 4 Players Roster
  if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
    const defaultPlayers: Player[] = [
      {
        id: 4,
        player_name: 'HASHIRAMA 777',
        ign: 'HASHIRAMA 777',
        team_role: 'Sniper',
        status: 'Active',
        avatar_url: '',
        joined_at: '25 Sept 2026',
        matches_count: 0,
        kd: 0.0,
        avg_damage: 0,
        total_kills: 0,
        total_damage: 0,
        total_assists: 0,
        total_deaths: 0,
        survival_rate: 0,
        trend: 'stable',
        role_history: [
          {
            id: 1,
            role: 'Sniper',
            started_at: '25 Sept 2026',
            notes: 'Team Sarkar Official IGL & Sniper',
          },
        ],
      },
      {
        id: 1,
        player_name: 'ITACHI 777',
        ign: 'SRK•ITACHI 777',
        team_role: 'Primary Rusher',
        status: 'Active',
        avatar_url: '',
        joined_at: '25 Sept 2026',
        matches_count: 0,
        kd: 0.0,
        avg_damage: 0,
        total_kills: 0,
        total_damage: 0,
        total_assists: 0,
        total_deaths: 0,
        survival_rate: 0,
        trend: 'stable',
        role_history: [
          {
            id: 1,
            role: 'Primary Rusher',
            started_at: '25 Sept 2026',
            notes: 'Primary Entry Fragger',
          },
        ],
      },
      {
        id: 3,
        player_name: 'TUUFAN   777',
        ign: 'SRK•TUUFAN   777',
        team_role: 'Assaulter',
        status: 'Active',
        avatar_url: '',
        joined_at: '25 Sept 2026',
        matches_count: 0,
        kd: 0.0,
        avg_damage: 0,
        total_kills: 0,
        total_damage: 0,
        total_assists: 0,
        total_deaths: 0,
        survival_rate: 0,
        trend: 'stable',
        role_history: [
          {
            id: 1,
            role: 'Assaulter',
            started_at: '25 Sept 2026',
            notes: 'Frontline Assault',
          },
        ],
      },
      {
        id: 5,
        player_name: 'PANDIT    777',
        ign: 'SRK•PANDIT    777',
        team_role: '2nd Rusher',
        status: 'Active',
        avatar_url: '',
        joined_at: '25 Sept 2026',
        matches_count: 0,
        kd: 0.0,
        avg_damage: 0,
        total_kills: 0,
        total_damage: 0,
        total_assists: 0,
        total_deaths: 0,
        survival_rate: 0,
        trend: 'stable',
        role_history: [
          {
            id: 1,
            role: '2nd Rusher',
            started_at: '25 Sept 2026',
            notes: 'Secondary Rusher & Support',
          },
        ],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(defaultPlayers));
  }

  // 3. Tournaments Seed
  if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
    const defaultTournaments: Tournament[] = [
      {
        id: 1,
        name: 'Daily scrims',
        date: '26 Sept 2026',
        status: 'Upcoming',
        notes: '3 matches',
        matches_count: 3,
        avg_placement: 9.0,
        total_kills: 6,
        avg_kills: 2.0,
        total_damage: 0,
        avg_damage: 0,
        booyah_count: 0,
        matches: [],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(defaultTournaments));
  }

  // 4. Matches Seed (3 real matches from MongoDB Atlas)
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    const defaultMatches: Match[] = [
      {
        id: 3,
        team_id: 1,
        tournament_id: 1,
        tournament_name: 'Daily scrims',
        practice_session_id: null,
        type: 'Tournament',
        map: 'KALAHARI',
        date: '26 Sept 2026',
        time: '11:00 AM',
        placement: 4,
        team_kills: 4,
        team_damage: 0,
        notes: '',
        player_stats: [
          { id: 1, player_id: 1, player_name: 'ITACHI 777', player_role: 'Primary Rusher', kills: 0, damage: 0, assists: 0, deaths: 1, survival_percent: 59 },
          { id: 2, player_id: 3, player_name: 'TUUFAN   777', player_role: 'Assaulter', kills: 2, damage: 0, assists: 0, deaths: 1, survival_percent: 59 },
          { id: 3, player_id: 4, player_name: 'HASHIRAMA 777', player_role: 'Sniper', kills: 2, damage: 0, assists: 0, deaths: 1, survival_percent: 59 },
          { id: 4, player_id: 5, player_name: 'PANDIT    777', player_role: '2nd Rusher', kills: 0, damage: 0, assists: 0, deaths: 1, survival_percent: 59 },
        ],
      },
      {
        id: 2,
        team_id: 1,
        tournament_id: 1,
        tournament_name: 'Daily scrims',
        practice_session_id: null,
        type: 'Tournament',
        map: 'PURGATORY',
        date: '26 Sept 2026',
        time: '11:00 AM',
        placement: 12,
        team_kills: 0,
        team_damage: 0,
        notes: '',
        player_stats: [
          { id: 1, player_id: 1, player_name: 'ITACHI 777', player_role: 'Primary Rusher', kills: 0, damage: 0, assists: 1, deaths: 1, survival_percent: 30 },
          { id: 2, player_id: 3, player_name: 'TUUFAN   777', player_role: 'Assaulter', kills: 0, damage: 0, assists: 1, deaths: 1, survival_percent: 30 },
          { id: 3, player_id: 4, player_name: 'HASHIRAMA 777', player_role: 'Sniper', kills: 0, damage: 0, assists: 1, deaths: 1, survival_percent: 30 },
          { id: 4, player_id: 5, player_name: 'PANDIT    777', player_role: '2nd Rusher', kills: 0, damage: 0, assists: 1, deaths: 1, survival_percent: 30 },
        ],
      },
      {
        id: 1,
        team_id: 1,
        tournament_id: 1,
        tournament_name: 'Daily scrims',
        practice_session_id: null,
        type: 'Tournament',
        map: 'BERMUDA',
        date: '26 Sept 2026',
        time: '11:00 AM',
        placement: 11,
        team_kills: 2,
        team_damage: 0,
        notes: '',
        player_stats: [
          { id: 1, player_id: 1, player_name: 'ITACHI 777', player_role: 'Primary Rusher', kills: 1, damage: 0, assists: 1, deaths: 1, survival_percent: 31 },
          { id: 2, player_id: 3, player_name: 'TUUFAN   777', player_role: 'Assaulter', kills: 1, damage: 0, assists: 1, deaths: 1, survival_percent: 31 },
          { id: 3, player_id: 4, player_name: 'HASHIRAMA 777', player_role: 'Sniper', kills: 0, damage: 0, assists: 1, deaths: 1, survival_percent: 31 },
          { id: 4, player_id: 5, player_name: 'PANDIT    777', player_role: '2nd Rusher', kills: 0, damage: 0, assists: 1, deaths: 1, survival_percent: 31 },
        ],
      },
    ];
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(defaultMatches));
  }

  // 5. Practice & Notes
  if (!localStorage.getItem(STORAGE_KEYS.PRACTICE)) {
    localStorage.setItem(STORAGE_KEYS.PRACTICE, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
  }
}

// Helpers
function getStore<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStore<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving store [${key}]:`, e);
  }
}

class ApiClient {
  private token: string | null = null;
  private role: UserRole = 'PLAYER';
  private userId: string = '';

  constructor() {
    initializeLocalStorageDB();
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      this.role = (localStorage.getItem(STORAGE_KEYS.AUTH_ROLE) as UserRole) || 'PLAYER';
      this.userId = localStorage.getItem(STORAGE_KEYS.AUTH_USER_ID) || '';
    }
  }

  setAuth(token: string, role: UserRole, userId: string = '') {
    this.token = token || null;
    this.role = role;
    this.userId = userId;
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_ROLE, role);
      localStorage.setItem(STORAGE_KEYS.AUTH_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_ROLE);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER_ID);
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
    try {
      const key = `@teamSarkar_${(this.userId || 'player').toLowerCase()}_${dataType}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Local storage write error:', e);
    }
  }

  getLocal<T>(dataType: string): T | null {
    try {
      const key = `@teamSarkar_${(this.userId || 'player').toLowerCase()}_${dataType}`;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async syncToCloud<T>(_dataType: string, _data: T): Promise<void> {
    // Standalone client storage: sync completes instantaneously
    return Promise.resolve();
  }

  // ----------------- AUTHENTICATION -----------------
  async loginWithCredentials(identifier: string, password: string): Promise<{ access_token: string; user: any }> {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    // Check Master login
    const isMaster =
      cleanId.toUpperCase() === 'ASHISH' ||
      cleanId.toUpperCase() === 'ASHISH800' ||
      cleanId.toUpperCase() === 'ASHISH8006';

    if (isMaster && cleanPass.toUpperCase() === 'ASHISH') {
      const user = {
        id: 4,
        userId: 'ASHISH',
        name: 'Ashish',
        ign: 'HASHIRAMA 777',
        email: 'ashish@teamsarkar.com',
        role: 'IGL' as UserRole,
        teamRole: 'Sniper',
        isMaster: true,
      };
      const token = `sarkar_jwt_${Date.now()}`;
      this.setAuth(token, 'IGL', 'ASHISH');
      return { access_token: token, user };
    }

    // Check registered users
    const users = getStore<any[]>(STORAGE_KEYS.USERS, [MASTER_USER]);
    const foundUser = users.find(
      (u) =>
        u.userId.toLowerCase() === cleanId.toLowerCase() ||
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
    );

    if (!foundUser) {
      throw new Error('User not found. Please register first.');
    }

    if (foundUser.password && foundUser.password !== cleanPass) {
      throw new Error('Incorrect password. Please try again.');
    }

    const token = `sarkar_jwt_${Date.now()}`;
    const userPayload = {
      id: foundUser.id || 2,
      userId: foundUser.userId,
      name: foundUser.name || foundUser.userId,
      email: foundUser.email,
      role: foundUser.role || 'PLAYER',
      isMaster: false,
    };

    this.setAuth(token, userPayload.role, userPayload.userId);
    return { access_token: token, user: userPayload };
  }

  async registerUser(data: { userId: string; name?: string; email?: string; password: string; teamRole?: string }): Promise<{ access_token: string; user: any }> {
    const cleanId = (data.userId || '').trim();
    if (!cleanId) throw new Error('User ID is required.');
    if (!data.password) throw new Error('Password is required.');

    const users = getStore<any[]>(STORAGE_KEYS.USERS, [MASTER_USER]);
    const exists = users.find((u) => u.userId.toLowerCase() === cleanId.toLowerCase());
    if (exists) {
      throw new Error('User ID already taken. Please choose another or Sign In.');
    }

    const isMaster =
      cleanId.toUpperCase() === 'ASHISH' ||
      cleanId.toUpperCase() === 'ASHISH800' ||
      cleanId.toUpperCase() === 'ASHISH8006';

    const newUser = {
      id: users.length + 1,
      userId: cleanId,
      name: data.name?.trim() || cleanId,
      email: data.email?.trim() || `${cleanId.toLowerCase()}@teamsarkar.com`,
      password: data.password.trim(),
      role: (isMaster ? 'IGL' : 'PLAYER') as UserRole,
      teamRole: data.teamRole || 'Rusher',
      isMaster,
    };

    users.push(newUser);
    setStore(STORAGE_KEYS.USERS, users);

    // Also add to Players list if not present
    const players = getStore<Player[]>(STORAGE_KEYS.PLAYERS, []);
    const playerExists = players.some((p) => p.player_name.toLowerCase() === cleanId.toLowerCase());
    if (!playerExists) {
      const newPlayer: Player = {
        id: players.length + 1,
        player_name: cleanId,
        ign: cleanId,
        team_role: data.teamRole || 'Rusher',
        status: 'Active',
        avatar_url: '',
        joined_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        matches_count: 0,
        kd: 0.0,
        avg_damage: 0,
        total_kills: 0,
        total_damage: 0,
        total_assists: 0,
        total_deaths: 0,
        survival_rate: 0,
        trend: 'stable',
        role_history: [
          {
            id: 1,
            role: data.teamRole || 'Rusher',
            started_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            notes: 'Registered player',
          },
        ],
      };
      players.push(newPlayer);
      setStore(STORAGE_KEYS.PLAYERS, players);
    }

    const token = `sarkar_jwt_${Date.now()}`;
    this.setAuth(token, newUser.role, newUser.userId);
    return { access_token: token, user: newUser };
  }

  async getMe(): Promise<User> {
    return {
      id: 1,
      name: this.userId || 'Player',
      email: `${(this.userId || 'player').toLowerCase()}@teamsarkar.com`,
      role: this.role,
    };
  }

  // ----------------- MATCHES -----------------
  async getMatches(params?: { type?: string; map?: string; month?: string; date?: string; limit?: number }): Promise<Match[]> {
    let matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);

    if (params?.type && params.type !== 'All') {
      matches = matches.filter((m) => m.type.toLowerCase() === params.type!.toLowerCase());
    }
    if (params?.map) {
      matches = matches.filter((m) => m.map.toLowerCase() === params.map!.toLowerCase());
    }
    if (params?.date && params.date !== 'All') {
      matches = matches.filter((m) => m.date.includes(params.date!) || params.date!.includes(m.date));
    }
    if (params?.limit) {
      matches = matches.slice(0, params.limit);
    }

    return matches;
  }

  async createMatch(data: any): Promise<Match> {
    const matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);
    const playerStats = (data.player_stats || []).map((ps: any, idx: number) => ({
      id: idx + 1,
      player_id: ps.player_id || idx + 1,
      player_name: ps.player_name || 'Player',
      player_avatar: ps.player_avatar || '',
      player_role: ps.player_role || 'Rusher',
      kills: Number(ps.kills) || 0,
      damage: Number(ps.damage) || 0,
      assists: Number(ps.assists) || 0,
      deaths: Number(ps.deaths) || (data.placement === 1 ? 0 : 1),
      survival_percent: Number(ps.survival_percent) || (data.placement === 1 ? 100 : 50),
    }));

    const computedKills = playerStats.reduce((sum: number, p: any) => sum + p.kills, 0);
    const computedDamage = playerStats.reduce((sum: number, p: any) => sum + p.damage, 0);

    const newMatch: Match = {
      id: matches.length > 0 ? Math.max(...matches.map((m) => m.id)) + 1 : 1,
      team_id: 1,
      tournament_id: data.tournament_id || null,
      tournament_name: data.tournament_name || null,
      practice_session_id: data.practice_session_id || null,
      type: data.type || 'Practice',
      map: (data.map || 'BERMUDA').toUpperCase(),
      date: data.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: data.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      placement: Number(data.placement) || 1,
      team_kills: data.team_kills !== undefined ? Number(data.team_kills) : computedKills,
      team_damage: data.team_damage !== undefined ? Number(data.team_damage) : computedDamage,
      notes: data.notes || '',
      player_stats: playerStats,
    };

    matches.unshift(newMatch);
    setStore(STORAGE_KEYS.MATCHES, matches);
    return newMatch;
  }

  async deleteMatch(id: number): Promise<{ message: string }> {
    let matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);
    matches = matches.filter((m) => m.id !== id);
    setStore(STORAGE_KEYS.MATCHES, matches);
    return { message: 'Match deleted successfully' };
  }

  // ----------------- PLAYERS -----------------
  async getPlayers(status?: 'Active' | 'Inactive'): Promise<Player[]> {
    let players = getStore<Player[]>(STORAGE_KEYS.PLAYERS, []);
    const matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);

    if (status) {
      players = players.filter((p) => p.status === status);
    }

    // Compute live stats for each player
    return players.map((p) => {
      let pKills = 0;
      let pDeaths = 0;
      let pDamage = 0;
      let pAssists = 0;
      let pMatches = 0;
      let pSurvivalTotal = 0;

      matches.forEach((m) => {
        const ps = (m.player_stats || []).find(
          (s) =>
            s.player_id === p.id ||
            (s.player_name && s.player_name.toLowerCase() === p.player_name.toLowerCase())
        );
        if (ps) {
          pMatches++;
          pKills += ps.kills || 0;
          pDeaths += ps.deaths || 0;
          pDamage += ps.damage || 0;
          pAssists += ps.assists || 0;
          pSurvivalTotal += ps.survival_percent || (m.placement === 1 ? 100 : 0);
        }
      });

      const kd = pMatches > 0 ? Number((pKills / Math.max(1, pDeaths)).toFixed(1)) : 0.0;
      const avgDamage = pMatches > 0 ? Math.round(pDamage / pMatches) : 0;
      const survivalRate = pMatches > 0 ? Math.round(pSurvivalTotal / pMatches) : 0;

      return {
        ...p,
        matches_count: pMatches,
        kd,
        avg_damage: avgDamage,
        total_kills: pKills,
        total_damage: pDamage,
        total_assists: pAssists,
        total_deaths: pDeaths,
        survival_rate: survivalRate,
      };
    });
  }

  async getPlayerDetail(id: number): Promise<PlayerProgressDetail> {
    const players = await this.getPlayers();
    const player = players.find((p) => p.id === id) || players[0];
    const matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);

    const playerMatchStats: Array<{
      match_id: number;
      map: string;
      type: string;
      placement: number;
      kills: number;
      damage: number;
      assists: number;
      deaths: number;
      survival_percent: number;
      date: string;
    }> = [];

    matches.forEach((m) => {
      const s = (m.player_stats || []).find(
        (ps) =>
          ps.player_id === id ||
          (ps.player_name && player && ps.player_name.toLowerCase() === player.player_name.toLowerCase())
      );
      if (s) {
        playerMatchStats.push({
          match_id: m.id,
          map: m.map,
          type: m.type,
          placement: m.placement,
          kills: s.kills || 0,
          damage: s.damage || 0,
          assists: s.assists || 0,
          deaths: s.deaths || 0,
          survival_percent: s.survival_percent || (m.placement === 1 ? 100 : 0),
          date: m.date,
        });
      }
    });

    const mCount = playerMatchStats.length;
    const totalKills = playerMatchStats.reduce((sum, s) => sum + s.kills, 0);
    const totalDamage = playerMatchStats.reduce((sum, s) => sum + s.damage, 0);
    const avgDamage = mCount > 0 ? Math.round(totalDamage / mCount) : 0;

    return {
      player,
      seven_day_avg_damage: avgDamage,
      prev_seven_day_avg_damage: 0,
      damage_change_pct: 0,
      seven_day_avg_kills: mCount > 0 ? Number((totalKills / mCount).toFixed(1)) : 0.0,
      prev_seven_day_avg_kills: 0.0,
      kills_change_pct: 0,
      consistency_score: mCount > 0 ? 80 : 0,
      variance_rating: mCount > 0 ? 'Stable' : 'Stable',
      recent_match_performances: playerMatchStats.slice(0, 6),
      observations:
        mCount > 0
          ? [
              `Consistent entries across recent ${mCount} games.`,
              `Fulfills ${player.team_role} positioning objectives.`,
            ]
          : ['No match records logged for this player. Telemetry activates after matches are played.'],
    };
  }

  async createPlayer(data: any): Promise<Player> {
    const players = getStore<Player[]>(STORAGE_KEYS.PLAYERS, []);
    const newId = players.length > 0 ? Math.max(...players.map((p) => p.id)) + 1 : 1;

    const newPlayer: Player = {
      id: newId,
      player_name: data.player_name || data.playerName,
      ign: data.ign || data.player_name,
      team_role: data.team_role || data.teamRole || 'Rusher',
      status: 'Active',
      avatar_url: data.avatar_url || data.avatarUrl || '',
      joined_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      matches_count: 0,
      kd: 0.0,
      avg_damage: 0,
      total_kills: 0,
      total_damage: 0,
      total_assists: 0,
      total_deaths: 0,
      survival_rate: 0,
      trend: 'stable',
      role_history: [
        {
          id: 1,
          role: data.team_role || data.teamRole || 'Rusher',
          started_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          notes: 'Player joined roster',
        },
      ],
    };

    players.push(newPlayer);
    setStore(STORAGE_KEYS.PLAYERS, players);
    return newPlayer;
  }

  async updatePlayerRole(playerId: number, newRole: string, reason?: string): Promise<any> {
    const players = getStore<Player[]>(STORAGE_KEYS.PLAYERS, []);
    const player = players.find((p) => p.id === playerId);
    if (!player) throw new Error('Player not found');

    player.team_role = newRole;
    player.role_history.push({
      id: player.role_history.length + 1,
      role: newRole,
      started_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      notes: reason || 'Role updated by IGL',
    });

    setStore(STORAGE_KEYS.PLAYERS, players);
    return { message: 'Role updated successfully', player };
  }

  // ----------------- TOURNAMENTS & PRACTICE -----------------
  async getTournaments(): Promise<Tournament[]> {
    const tournaments = getStore<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, []);
    const matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);

    return tournaments.map((t) => {
      const tMatches = matches.filter((m) => m.tournament_id === t.id);
      const mCount = tMatches.length;
      const tKills = tMatches.reduce((s, m) => s + (m.team_kills || 0), 0);
      const tBooyah = tMatches.filter((m) => m.placement === 1).length;
      const avgPlace = mCount > 0 ? Number((tMatches.reduce((s, m) => s + m.placement, 0) / mCount).toFixed(1)) : 0.0;
      const avgK = mCount > 0 ? Number((tKills / mCount).toFixed(1)) : 0.0;

      return {
        ...t,
        matches_count: mCount,
        avg_placement: avgPlace,
        total_kills: tKills,
        avg_kills: avgK,
        booyah_count: tBooyah,
        matches: tMatches,
      };
    });
  }

  async createTournament(data: any): Promise<Tournament> {
    const tournaments = getStore<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, []);
    const newT: Tournament = {
      id: tournaments.length > 0 ? Math.max(...tournaments.map((t) => t.id)) + 1 : 1,
      name: data.name,
      date: data.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: data.status || 'Upcoming',
      notes: data.notes || '',
      matches_count: 0,
      avg_placement: 0.0,
      total_kills: 0,
      avg_kills: 0.0,
      total_damage: 0,
      avg_damage: 0,
      booyah_count: 0,
      matches: [],
    };

    tournaments.unshift(newT);
    setStore(STORAGE_KEYS.TOURNAMENTS, tournaments);
    return newT;
  }

  async getPracticeSessions(): Promise<PracticeSession[]> {
    const practice = getStore<PracticeSession[]>(STORAGE_KEYS.PRACTICE, []);
    const matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);

    return practice.map((p) => ({
      ...p,
      matches: matches.filter((m) => m.practice_session_id === p.id),
    }));
  }

  async createPracticeSession(data: any): Promise<PracticeSession> {
    const practice = getStore<PracticeSession[]>(STORAGE_KEYS.PRACTICE, []);
    const newP: PracticeSession = {
      id: practice.length > 0 ? Math.max(...practice.map((p) => p.id)) + 1 : 1,
      date: data.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      duration_minutes: Number(data.duration_minutes) || 60,
      focus: data.focus || 'Crossfire & Rotation',
      notes: data.notes || '',
      mistakes: data.mistakes || '',
      positive_observations: data.positive_observations || '',
      matches: [],
    };

    practice.unshift(newP);
    setStore(STORAGE_KEYS.PRACTICE, practice);
    return newP;
  }

  // ----------------- NOTES -----------------
  async getNotes(): Promise<IGLNote[]> {
    return getStore<IGLNote[]>(STORAGE_KEYS.NOTES, []);
  }

  async createNote(data: any): Promise<IGLNote> {
    const notes = getStore<IGLNote[]>(STORAGE_KEYS.NOTES, []);
    const newNote: IGLNote = {
      id: notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1,
      title: data.title || 'Team Strategy Note',
      note: data.note || '',
      category: data.category || 'Strategy',
      created_at: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      author_name: this.userId || 'ASHISH (IGL)',
    };

    notes.unshift(newNote);
    setStore(STORAGE_KEYS.NOTES, notes);
    return newNote;
  }

  // ----------------- DASHBOARD & ANALYTICS -----------------
  async getDashboardSummary(period: string = 'Today', dateFilter?: string): Promise<DashboardSummary> {
    let matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);

    if (dateFilter && dateFilter !== 'All') {
      matches = matches.filter((m) => m.date.includes(dateFilter) || dateFilter.includes(m.date));
    }

    const matchesCount = matches.length;
    const totalKills = matches.reduce((s, m) => s + (m.team_kills || 0), 0);
    const booyahCount = matches.filter((m) => m.placement === 1).length;
    const avgKills = matchesCount > 0 ? Number((totalKills / matchesCount).toFixed(1)) : 0.0;

    const players = await this.getPlayers('Active');

    return {
      matches: matchesCount,
      matches_trend: 0,
      avg_kills: avgKills,
      avg_kills_trend_pct: 0,
      avg_damage: 0,
      avg_damage_trend_pct: 0,
      booyah: booyahCount,
      booyah_trend: 0,
      period: (period as any) || 'Today',
      recent_matches: matches.slice(0, 5),
      players,
      today_practice_count: matches.filter((m) => m.type === 'Practice').length,
      today_tournament_count: matches.filter((m) => m.type === 'Tournament').length,
    };
  }

  async getDailyEvaluation(date: string = '25 Sept 2026'): Promise<DailyEvaluation> {
    const matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []).filter(
      (m) => m.date.includes(date) || date.includes(m.date)
    );

    const mCount = matches.length;
    const totalK = matches.reduce((s, m) => s + (m.team_kills || 0), 0);
    const byh = matches.filter((m) => m.placement === 1).length;
    const avgK = mCount > 0 ? Number((totalK / mCount).toFixed(1)) : 0.0;
    const avgPlace = mCount > 0 ? Number((matches.reduce((s, m) => s + m.placement, 0) / mCount).toFixed(1)) : 0.0;

    return {
      date,
      matches_count: mCount,
      avg_kills: avgK,
      avg_damage: 0,
      avg_placement: avgPlace,
      booyah_count: byh,
      comparison_summary: mCount > 0 ? `Recorded ${mCount} match(es) today` : 'No matches recorded for this date.',
      team_insights:
        mCount > 0
          ? [
              {
                category: 'Team',
                title: 'Daily Combat Summary',
                message: `Averaged ${avgK} kills per match across ${mCount} recorded match(es) today.`,
                confidence: 'High',
                is_positive: true,
                metric_delta: `${avgK} Avg Kills`,
              },
            ]
          : [],
      player_insights: [],
    };
  }

  async getWeeklyEvaluation(): Promise<WeeklyEvaluation> {
    const matches = getStore<Match[]>(STORAGE_KEYS.MATCHES, []);
    const mCount = matches.length;
    const totalK = matches.reduce((s, m) => s + (m.team_kills || 0), 0);
    const byh = matches.filter((m) => m.placement === 1).length;
    const avgK = mCount > 0 ? Number((totalK / mCount).toFixed(1)) : 0.0;
    const avgPlace = mCount > 0 ? Number((matches.reduce((s, m) => s + m.placement, 0) / mCount).toFixed(1)) : 0.0;

    return {
      current_week_label: 'Current Week',
      previous_week_label: 'Previous Week',
      current_avg_kills: avgK,
      previous_avg_kills: 0.0,
      current_avg_damage: 0,
      previous_avg_damage: 0,
      current_avg_placement: avgPlace,
      previous_avg_placement: 0.0,
      current_booyah: byh,
      previous_booyah: 0,
      insights:
        mCount > 0
          ? [
              {
                category: 'Team',
                title: 'Weekly Combat Summary',
                message: `Current squad average is ${avgK} kills per match across ${mCount} matches.`,
                confidence: 'High',
                is_positive: true,
                metric_delta: `${avgK} Kills`,
              },
            ]
          : [],
      confidence_note: 'Computed from local match database.',
    };
  }
}

export const api = new ApiClient();
