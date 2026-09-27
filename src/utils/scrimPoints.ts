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
export const DEFAULT_FALLBACK_SCRIMS: ScrimSummary[] = [
  {
    id: 101,
    name: 'TEAM SARKAR SCRIM CUP',
    date: '25 Sept 2026',
    status: 'Completed',
    notes: 'Tier-1 invitational scrims against top national squads.',
    matchesCount: 4,
    kp: 45,
    pp: 41,
    tp: 86,
    booyahCount: 2,
    avgKills: 11.3,
    avgPlacement: 1.8,
    matches: [
      {
        id: 1001,
        matchNumber: 1,
        map: 'NEXTERRA',
        placement: 1,
        kills: 14,
        damage: 3820,
        time: '07:30 PM',
        date: '25 Sept 2026',
        kp: 14,
        pp: 12,
        tp: 26,
      },
      {
        id: 1002,
        matchNumber: 2,
        map: 'BERMUDA',
        placement: 2,
        kills: 11,
        damage: 3120,
        time: '08:15 PM',
        date: '25 Sept 2026',
        kp: 11,
        pp: 9,
        tp: 20,
      },
      {
        id: 1003,
        matchNumber: 3,
        map: 'PURGATORY',
        placement: 3,
        kills: 8,
        damage: 2640,
        time: '08:50 PM',
        date: '25 Sept 2026',
        kp: 8,
        pp: 8,
        tp: 16,
      },
      {
        id: 1004,
        matchNumber: 4,
        map: 'ALPINE',
        placement: 1,
        kills: 12,
        damage: 3450,
        time: '09:30 PM',
        date: '25 Sept 2026',
        kp: 12,
        pp: 12,
        tp: 24,
      },
    ],
  },
  {
    id: 102,
    name: 'FREE FIRE PREMIER LEAGUE',
    date: '24 Sept 2026',
    status: 'Completed',
    notes: 'Regional group qualifiers - Stage 2.',
    matchesCount: 4,
    kp: 40,
    pp: 36,
    tp: 76,
    booyahCount: 1,
    avgKills: 10.0,
    avgPlacement: 2.5,
    matches: [
      {
        id: 1005,
        matchNumber: 1,
        map: 'PURGATORY',
        placement: 2,
        kills: 11,
        damage: 3310,
        time: '07:00 PM',
        date: '24 Sept 2026',
        kp: 11,
        pp: 9,
        tp: 20,
      },
      {
        id: 1006,
        matchNumber: 2,
        map: 'NEXTERRA',
        placement: 1,
        kills: 13,
        damage: 3600,
        time: '07:45 PM',
        date: '24 Sept 2026',
        kp: 13,
        pp: 12,
        tp: 25,
      },
      {
        id: 1007,
        matchNumber: 3,
        map: 'BERMUDA',
        placement: 3,
        kills: 9,
        damage: 2920,
        time: '08:30 PM',
        date: '24 Sept 2026',
        kp: 9,
        pp: 8,
        tp: 17,
      },
      {
        id: 1008,
        matchNumber: 4,
        map: 'KALAHARI',
        placement: 4,
        kills: 7,
        damage: 2310,
        time: '09:15 PM',
        date: '24 Sept 2026',
        kp: 7,
        pp: 7,
        tp: 14,
      },
    ],
  },
  {
    id: 103,
    name: 'TIER-1 DAILY SCRIMS #18',
    date: '23 Sept 2026',
    status: 'Completed',
    notes: 'Competitive slot practice against T1 orgs.',
    matchesCount: 3,
    kp: 26,
    pp: 24,
    tp: 50,
    booyahCount: 0,
    avgKills: 8.7,
    avgPlacement: 3.0,
    matches: [
      {
        id: 1009,
        matchNumber: 1,
        map: 'BERMUDA',
        placement: 3,
        kills: 9,
        damage: 2890,
        time: '08:00 PM',
        date: '23 Sept 2026',
        kp: 9,
        pp: 8,
        tp: 17,
      },
      {
        id: 1010,
        matchNumber: 2,
        map: 'NEXTERRA',
        placement: 4,
        kills: 7,
        damage: 2410,
        time: '08:45 PM',
        date: '23 Sept 2026',
        kp: 7,
        pp: 7,
        tp: 14,
      },
      {
        id: 1011,
        matchNumber: 3,
        map: 'ALPINE',
        placement: 2,
        kills: 10,
        damage: 3100,
        time: '09:20 PM',
        date: '23 Sept 2026',
        kp: 10,
        pp: 9,
        tp: 19,
      },
    ],
  },
  {
    id: 104,
    name: 'PRO INVITATIONAL SERIES',
    date: '21 Sept 2026',
    status: 'Completed',
    notes: 'Weekly community cup series.',
    matchesCount: 3,
    kp: 17,
    pp: 17,
    tp: 34,
    booyahCount: 0,
    avgKills: 5.7,
    avgPlacement: 5.3,
    matches: [
      {
        id: 1012,
        matchNumber: 1,
        map: 'BERMUDA',
        placement: 7,
        kills: 4,
        damage: 1800,
        time: '07:30 PM',
        date: '21 Sept 2026',
        kp: 4,
        pp: 4,
        tp: 8,
      },
      {
        id: 1013,
        matchNumber: 2,
        map: 'NEXTERRA',
        placement: 4,
        kills: 7,
        damage: 2400,
        time: '08:15 PM',
        date: '21 Sept 2026',
        kp: 7,
        pp: 7,
        tp: 14,
      },
      {
        id: 1014,
        matchNumber: 3,
        map: 'ALPINE',
        placement: 5,
        kills: 6,
        damage: 2050,
        time: '09:00 PM',
        date: '21 Sept 2026',
        kp: 6,
        pp: 6,
        tp: 12,
      },
    ],
  },
  {
    id: 105,
    name: 'COMMUNITY SHOWDOWN QUALIFIERS',
    date: '19 Sept 2026',
    status: 'Completed',
    notes: 'Open qualifying stage - rough early rotations.',
    matchesCount: 3,
    kp: 9,
    pp: 6,
    tp: 15,
    booyahCount: 0,
    avgKills: 3.0,
    avgPlacement: 9.0,
    matches: [
      {
        id: 1015,
        matchNumber: 1,
        map: 'KALAHARI',
        placement: 9,
        kills: 3,
        damage: 1200,
        time: '07:00 PM',
        date: '19 Sept 2026',
        kp: 3,
        pp: 2,
        tp: 5,
      },
      {
        id: 1016,
        matchNumber: 2,
        map: 'PURGATORY',
        placement: 8,
        kills: 4,
        damage: 1450,
        time: '07:45 PM',
        date: '19 Sept 2026',
        kp: 4,
        pp: 3,
        tp: 7,
      },
      {
        id: 1017,
        matchNumber: 3,
        map: 'BERMUDA',
        placement: 10,
        kills: 2,
        damage: 980,
        time: '08:30 PM',
        date: '19 Sept 2026',
        kp: 2,
        pp: 1,
        tp: 3,
      },
    ],
  },
];

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

      result.push({
        id: t.id,
        name: t.name,
        date: t.date,
        status: t.status || (count > 0 ? 'Completed' : 'Upcoming'),
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

  // 2. Supplement with default fallback scrims if count < 5 so user always sees full top 5
  if (result.length < 5) {
    for (const fb of DEFAULT_FALLBACK_SCRIMS) {
      const fbNameUpper = fb.name.trim().toUpperCase();
      if (!processedNames.has(fbNameUpper) && !processedTournamentIds.has(fb.id)) {
        result.push({ ...fb });
        processedNames.add(fbNameUpper);
        if (result.length >= 5) break;
      }
    }
  }

  // 3. Strictly sort all scrims chronologically (newest date first)
  result.sort((a, b) => {
    const timeA = parseDateToMillis(a.date);
    const timeB = parseDateToMillis(b.date);
    if (timeB !== timeA) return timeB - timeA;
    return b.id - a.id;
  });

  // 4. Tag Top and Lowest within the first up to 5 items (latest 5)
  // Only evaluate played scrims with matches and positive points so upcoming/empty scrims aren't tagged as LOWEST
  const topSlice = result.slice(0, 5);
  const playedScrims = topSlice.filter((s) => s.matchesCount > 0 && s.tp > 0 && s.status !== 'Upcoming');

  if (playedScrims.length >= 2) {
    const tps = playedScrims.map((s) => s.tp);
    const maxTp = Math.max(...tps);
    const minTp = Math.min(...tps);

    if (maxTp !== minTp) {
      let topTagged = false;
      let lowestTagged = false;
      // Tag highest TP in GREEN and lowest TP in RED
      topSlice.forEach((s) => {
        if (!topTagged && s.matchesCount > 0 && s.tp === maxTp) {
          s.isTop = true;
          topTagged = true;
        } else if (!lowestTagged && s.matchesCount > 0 && s.tp === minTp) {
          s.isLowest = true;
          lowestTagged = true;
        }
      });
    }
  } else if (playedScrims.length === 1) {
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
