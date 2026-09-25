export type UserRole = 'IGL' | 'PLAYER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface PlayerRoleHistory {
  id: number;
  role: string;
  started_at: string;
  ended_at?: string | null;
  notes?: string | null;
}

export interface Player {
  id: number;
  player_name: string;
  ign?: string;
  team_role: string;
  status: 'Active' | 'Inactive';
  avatar_url: string;
  joined_at: string;
  matches_count: number;
  kd: number;
  avg_damage: number;
  total_kills: number;
  total_damage: number;
  total_assists: number;
  total_deaths: number;
  survival_rate: number;
  trend: 'up' | 'down' | 'stable';
  role_history: PlayerRoleHistory[];
}

export interface PlayerMatchStat {
  id: number;
  player_id: number;
  player_name?: string;
  player_avatar?: string;
  player_role?: string;
  kills: number;
  damage: number;
  assists: number;
  deaths: number;
  headshots?: number;
  survival_percent?: number;
}

export interface Match {
  id: number;
  team_id: number;
  tournament_id?: number | null;
  tournament_name?: string | null;
  practice_session_id?: number | null;
  type: 'Tournament' | 'Practice';
  map: 'BERMUDA' | 'NEXTERRA' | 'ALPINE' | 'PURGATORY' | string;
  date: string;
  time: string;
  placement: number;
  team_kills: number;
  team_damage: number;
  notes?: string | null;
  player_stats: PlayerMatchStat[];
}

export interface Tournament {
  id: number;
  name: string;
  date: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  notes?: string | null;
  matches_count: number;
  avg_placement: number;
  total_kills: number;
  avg_kills: number;
  total_damage: number;
  avg_damage: number;
  booyah_count: number;
  matches: Match[];
}

export interface PracticeSession {
  id: number;
  date: string;
  duration_minutes: number;
  focus: string;
  notes?: string | null;
  mistakes?: string | null;
  positive_observations?: string | null;
  matches: Match[];
}

export interface IGLNote {
  id: number;
  player_id?: number | null;
  match_id?: number | null;
  practice_session_id?: number | null;
  title?: string | null;
  note: string;
  category: string;
  created_at: string;
  author_name: string;
}

export interface DashboardSummary {
  matches: number;
  matches_trend: number;
  avg_kills: number;
  avg_kills_trend_pct: number;
  avg_damage: number;
  avg_damage_trend_pct: number;
  booyah: number;
  booyah_trend: number;
  period: 'Today' | '7D' | '14D' | '30D';
  recent_matches: Match[];
  players: Player[];
  today_practice_count: number;
  today_tournament_count: number;
}

export interface InsightItem {
  category: 'Team' | 'Player' | 'Practice' | 'Warning';
  title: string;
  message: string;
  confidence: 'High' | 'Moderate' | 'Early signal only';
  is_positive: boolean;
  metric_delta?: string | null;
}

export interface DailyEvaluation {
  date: string;
  matches_count: number;
  avg_kills: number;
  avg_damage: number;
  avg_placement: number;
  booyah_count: number;
  comparison_summary: string;
  player_insights: InsightItem[];
  team_insights: InsightItem[];
}

export interface WeeklyEvaluation {
  current_week_label: string;
  previous_week_label: string;
  current_avg_kills: number;
  previous_avg_kills: number;
  current_avg_damage: number;
  previous_avg_damage: number;
  current_avg_placement: number;
  previous_avg_placement: number;
  current_booyah: number;
  previous_booyah: number;
  insights: InsightItem[];
  confidence_note: string;
}

export interface PlayerProgressDetail {
  player: Player;
  seven_day_avg_damage: number;
  prev_seven_day_avg_damage: number;
  damage_change_pct: number;
  seven_day_avg_kills: number;
  prev_seven_day_avg_kills: number;
  kills_change_pct: number;
  consistency_score: number;
  variance_rating: 'Stable' | 'Moderate Variance' | 'High Variance';
  recent_match_performances: Array<{
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
  }>;
  observations: string[];
}
