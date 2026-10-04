import { Tournament, Match } from '../types';
import { getPlacementPoints } from './points';

export interface ScrimMatchBreakdown {
  id: number;
  matchNumber: number;
  map: string;
  placement: number;
  kills: number;
  damage?: number;
  time?: string;
  date?: string;
  kp: number; // Kill points (1 pt per kill)
  pp: number; // Placement points
  tp: number; // Total points = kp + pp
}

export interface ScrimSummary {
  id: number;
  name: string;
  date: string;
  status: string;
  notes?: string | null;
  matchesCount: number;
  kp: number;
  pp: number;
  tp: number;
  booyahCount: number;
  avgKills: number;
  avgPlacement: number;
  matches: ScrimMatchBreakdown[];
  isTop?: boolean;
  isLowest?: boolean;
}

export interface OverallPointsSummary {
  totalScrims: number;
  totalMatches: number;
  totalKp: number;
  totalPp: number;
  totalTp: number;
  avgPointsPerMatch: number;
  booyahCount: number;
}

// Built-in realistic Free Fire esports scrims with complete match breakdowns
export const DEFAULT_FALLBACK_SCRIMS: ScrimSummary[] = [];

export function parseDateToMillis(dateStr: string = ''): number {
  if (!dateStr) return 0;
  const lower = dateStr.trim().toLowerCase();
  if (lower === 'today') return Date.now();
  if (lower === 'yesterday') return Date.now() - 86400000;

  // Replace 'Sept' with 'Sep' for RFC2822 / Date.parse cross-browser compatibility
  const normalized = dateStr.replace(/Sept/i, 'Sep');
  const parsed = Date.parse(normalized);
  if (!isNaN(parsed)) return parsed;

  const parts = dateStr.match(/(\d{1,2})[\s\-\/]([a-zA-Z]+|\d{1,2})[\s\-\/](\d{4})/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const monthStr = parts[2];
    const year = parseInt(parts[3], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = months.indexOf(monthStr.toLowerCase().slice(0, 3));
    if (monthIdx !== -1) {
      return new Date(year, monthIdx, day).getTime();
    }
  }

  return 0;
}

/**
 * Builds processed ScrimSummary objects with KP, PP, TP, sorted by latest date,
 * and identifies Top & Lowest performers within the latest 5 played scrims.
 */
export function buildScrimsPointsList(
  tournaments: Tournament[],
  allMatches: Match[]
): ScrimSummary[] {
  const result: ScrimSummary[] = [];
  const processedTournamentIds = new Set<number>();
  const processedNames = new Set<string>();

  // 1. Convert real tournaments with their associated matches
  if (tournaments && tournaments.length > 0) {
    tournaments.forEach((t) => {
      processedTournamentIds.add(t.id);
      processedNames.add(t.name.trim().toUpperCase());

      // Match collection for this tournament
      const matchMap = new Map<number, Match>();
      (t.matches || []).forEach((m) => matchMap.set(m.id, m));

      // Also gather any matches in allMatches pointing to this tournament
      allMatches.forEach((m) => {
        if (
          m.tournament_id === t.id ||
          (m.tournament_name && m.tournament_name.trim().toLowerCase() === t.name.trim().toLowerCase())
        ) {
          matchMap.set(m.id, m);
        }
      });

      const rawMatches = Array.from(matchMap.values());
      // Sort matches chronologically (or by ID)
      rawMatches.sort((a, b) => a.id - b.id);

      const breakdowns: ScrimMatchBreakdown[] = rawMatches.map((m, idx) => {
        const kp = Math.max(0, Number(m.team_kills) || 0);
        const pp = getPlacementPoints(m.placement);
        return {
          id: m.id,
          matchNumber: idx + 1,
          map: m.map,
          placement: m.placement,
          kills: m.team_kills,
          damage: m.team_damage,
          time: m.time,
          date: m.date,
          kp,
          pp,
          tp: kp + pp,
        };
      });

      let totalKp = breakdowns.reduce((sum, b) => sum + b.kp, 0);
      let totalPp = breakdowns.reduce((sum, b) => sum + b.pp, 0);
      let totalTp = totalKp + totalPp;

      // Fallback if tournament has stats but 0 detailed match rows
      if (breakdowns.length === 0 && (t.total_kills || t.matches_count)) {
        totalKp = t.total_kills || 0;
        const estPlacement = Math.round(t.avg_placement || 5);
        totalPp = (t.matches_count || 1) * getPlacementPoints(estPlacement);
        totalTp = totalKp + totalPp;
      }

      const booyahs = breakdowns.filter((b) => b.placement === 1).length || t.booyah_count || 0;
      const count = breakdowns.length || t.matches_count || 0;
      const avgK = count > 0 ? Number((totalKp / count).toFixed(1)) : 0;
      const avgP = count > 0
        ? Number((breakdowns.reduce((sum, b) => sum + b.placement, 0) / count).toFixed(1))
        : t.avg_placement || 0;

      const effectiveStatus = (t.status && t.status !== 'Upcoming')
        ? t.status
        : (count > 0 ? 'Completed' : 'Upcoming');

      result.push({
        id: t.id,
        name: t.name,
        date: t.date,
        status: effectiveStatus,
        notes: t.notes,
        matchesCount: count,
        kp: totalKp,
        pp: totalPp,
        tp: totalTp,
        booyahCount: booyahs,
        avgKills: avgK,
        avgPlacement: avgP,
        matches: breakdowns,
      });
    });
  }

  // 3. Strictly sort all scrims chronologically (newest date first)
  result.sort((a, b) => {
    const timeA = parseDateToMillis(a.date);
    const timeB = parseDateToMillis(b.date);
    if (timeB !== timeA) return timeB - timeA;
    return b.id - a.id;
  });

  // 4. Tag Top and Lowest within the first up to 5 items (latest 5)
  // Evaluate all scrims in latest 5 that have matches played (matchesCount > 0)
  const topSlice = result.slice(0, 5);
  const playedScrims = topSlice.filter((s) => s.matchesCount > 0);

  if (playedScrims.length >= 2) {
    // Sort played scrims by TP descending, then KP descending for tie-break
    const sortedByPoints = [...playedScrims].sort((a, b) => {
      if (b.tp !== a.tp) return b.tp - a.tp;
      return b.kp - a.kp;
    });

    const bestScrim = sortedByPoints[0];
    const worstScrim = sortedByPoints[sortedByPoints.length - 1];

    // Only tag if there's a real difference between the best and worst score
    if (bestScrim.tp > worstScrim.tp) {
      topSlice.forEach((s) => {
        s.isTop = (s.id === bestScrim.id);
        s.isLowest = (s.id === worstScrim.id);
      });
    }
  } else if (playedScrims.length === 1 && playedScrims[0].tp > 0) {
    playedScrims[0].isTop = true;
  }

  return result;
}

/**
 * Calculates aggregated overall performance statistics across all scrims.
 */
export function calculateOverallSummary(scrims: ScrimSummary[]): OverallPointsSummary {
  const totalScrims = scrims.length;
  let totalMatches = 0;
  let totalKp = 0;
  let totalPp = 0;
  let totalTp = 0;
  let booyahCount = 0;

  for (const s of scrims) {
    totalMatches += s.matchesCount;
    totalKp += s.kp;
    totalPp += s.pp;
    totalTp += s.tp;
    booyahCount += s.booyahCount;
  }

  const avgPointsPerMatch = totalMatches > 0
    ? Number((totalTp / totalMatches).toFixed(1))
    : 0;

  return {
    totalScrims,
    totalMatches,
    totalKp,
    totalPp,
    totalTp,
    avgPointsPerMatch,
    booyahCount,
  };
}
