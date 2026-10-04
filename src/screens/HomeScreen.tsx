import React, { useState, useEffect, useMemo } from 'react';
import {
  Swords, Crosshair, Trophy, ChevronRight,
  Award, Crown, AlertCircle, ShieldAlert
} from 'lucide-react';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { DatePickerModal } from '../components/DatePickerModal';
import { PointsTableModal } from '../components/PointsTableModal';
import { Player, Match, Tournament, DashboardSummary, DailyEvaluation } from '../types';
import { api } from '../api/client';
import { ASSETS } from '../utils/assets';
import { calculateMatchPoints } from '../utils/points';
import {
  getTodayDateString, getYesterdayDateString, isSameDay,
  parseMatchDate, isWithinLastNDays, getUniqueMatchDates
} from '../utils/dateUtils';
import { buildScrimsPointsList } from '../utils/scrimPoints';

interface Props {
  onNavigateTab: (tab: 'home' | 'matches' | 'players' | 'insights') => void;
  onOpenAddMatch: () => void;
  onOpenAddTournament: () => void;
  onSelectPlayer?: (player: Player) => void;
  onSelectMatch: (match: Match) => void;
  onOpenAccount?: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onNavigateTab,
  onOpenAddMatch,
  onOpenAddTournament,
  onSelectPlayer: _onSelectPlayer,
  onSelectMatch,
  onOpenAccount,
}) => {
  const todayDateStr = getTodayDateString();
  const yesterdayDateStr = getYesterdayDateString();

  const PERIOD_TABS = ['Today', '7D', '15D', '20D'] as const;
  type PeriodTab = (typeof PERIOD_TABS)[number];

  const [period, setPeriod] = useState<PeriodTab>('Today');
  const [jellyDir, setJellyDir] = useState<'right' | 'left' | null>(null);
  const [jellyKey, setJellyKey] = useState(0);

  const handlePeriodChange = (newPeriod: PeriodTab) => {
    if (newPeriod === period) return;
    const oldIdx = PERIOD_TABS.indexOf(period);
    const newIdx = PERIOD_TABS.indexOf(newPeriod);
    setJellyDir(newIdx > oldIdx ? 'right' : 'left');
    setJellyKey((k) => k + 1);
    setPeriod(newPeriod);
    if (newPeriod === 'Today') setSelectedDate(todayDateStr);
    else setSelectedDate('All');
  };

  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Instant synchronous initial load from cache
  const [summary, setSummary] = useState<DashboardSummary | null>(() => api.getCachedDashboard());
  const [allMatches, setAllMatches] = useState<Match[]>(() => api.getCachedMatches());
  const [tournaments, setTournaments] = useState<Tournament[]>(() => api.getCachedTournaments());
  const [dailyEval, setDailyEval] = useState<DailyEvaluation | null>(null);

  // Scrims Points Table Modal state
  const [isPointsTableOpen, setIsPointsTableOpen] = useState(false);
  const [selectedScrimId, setSelectedScrimId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [sumData, evalData, matchesData, tournsData] = await Promise.all([
        api.getDashboardSummary(period, selectedDate),
        api.getDailyEvaluation(selectedDate),
        api.getMatches(),
        api.getTournaments(),
      ]);
      setSummary(sumData);
      setDailyEval(evalData);
      setAllMatches(matchesData);
      setTournaments(tournsData);
    } catch {
      // already utilizing cached data
    }
  };

  useEffect(() => {
    loadData();
  }, [period, selectedDate]);

  // Scrims data calculation
  const scrims = useMemo(() => {
    return buildScrimsPointsList(tournaments, allMatches);
  }, [tournaments, allMatches]);

  const latestScrims = useMemo(() => scrims.slice(0, 5), [scrims]);

  // Points rank map for latest 5 scrims (Rank #1 = highest points)
  const pointsRankMap = useMemo(() => {
    const sorted = [...latestScrims].sort((a, b) => {
      if (b.tp !== a.tp) return b.tp - a.tp;
      return b.kp - a.kp;
    });
    const map = new Map<number, number>();
    sorted.forEach((s, i) => map.set(s.id, i + 1));
    return map;
  }, [latestScrims]);

  const handleOpenScrimDetail = (scrimId: number) => {
    setSelectedScrimId(scrimId);
    setIsPointsTableOpen(true);
  };

  const handleOpenSeeAll = () => {
    setSelectedScrimId(null);
    setIsPointsTableOpen(true);
  };

  const mapThumbnails: Record<string, string> = {
    BERMUDA: ASSETS.maps.BERMUDA,
    NEXTERRA: ASSETS.maps.NEXTERRA,
    KALAHARI: ASSETS.maps.KALAHARI,
    ALPINE: ASSETS.maps.ALPINE,
    PURGATORY: ASSETS.maps.PURGATORY,
  };

  // Filter matches for the active view / period
  const activeMatches = useMemo(() => {
    if (period === 'Today') {
      if (selectedDate && selectedDate !== 'All') {
        return allMatches.filter((m) => isSameDay(m.date, selectedDate));
      }
      return allMatches.filter((m) => isSameDay(m.date, todayDateStr));
    }
    if (period === '7D') {
      return allMatches.filter((m) => isWithinLastNDays(m.date, 7));
    }
    if (period === '15D') {
      return allMatches.filter((m) => isWithinLastNDays(m.date, 15));
    }
    if (period === '20D') {
      return allMatches.filter((m) => isWithinLastNDays(m.date, 20));
    }
    return allMatches;
  }, [allMatches, period, selectedDate, todayDateStr]);

  // Keep selectedDateMatches synced so any downstream lists use active period data
  const selectedDateMatches = activeMatches;

  // Find the actual most recent match day strictly before the selected date (for Today comparison)
  const previousMatchDayInfo = useMemo(() => {
    if (allMatches.length === 0) return { dateStr: null, matches: [] };
    const curTargetDate = (period === 'Today' && selectedDate !== 'All') ? selectedDate : todayDateStr;
    const curParsed = parseMatchDate(curTargetDate);

    // Get unique dates in match history, sorted newest first
    const uniqueDates = getUniqueMatchDates(allMatches);
    const candidateDates = uniqueDates
      .map((d) => ({ str: d, date: parseMatchDate(d) }))
      .filter((d) => d.date !== null && !isSameDay(d.str, curTargetDate));

    // Pick the latest date strictly earlier than curTargetDate
    let prevEntry = curParsed
      ? candidateDates.find((d) => d.date!.getTime() < curParsed.getTime())
      : null;

    if (!prevEntry && candidateDates.length > 0) {
      prevEntry = candidateDates[0];
    }

    if (!prevEntry) return { dateStr: null, matches: [] };

    const matchesOnPrevDay = allMatches.filter((m) => isSameDay(m.date, prevEntry.str));
    return {
      dateStr: prevEntry.str,
      matches: matchesOnPrevDay,
    };
  }, [allMatches, period, selectedDate, todayDateStr]);

  // Compute stats and real daily improvements / period averages
  const metrics = useMemo(() => {
    const curMatches = activeMatches;
    const curCount = curMatches.length;
    const curKillsSum = curMatches.reduce((acc, m) => acc + (m.team_kills || 0), 0);
    const curAvgK = curCount > 0 ? Number((curKillsSum / curCount).toFixed(1)) : 0.0;
    const curPlacements = curMatches.map((m) => m.placement || 12);
    const curAvgRank = curPlacements.length > 0
      ? Math.round(curPlacements.reduce((a, b) => a + b, 0) / curPlacements.length)
      : (period === 'Today' ? 0 : 7);
    const curBooyah = curMatches.filter((m) => m.placement === 1).length;

    if (period === 'Today') {
      const prevMatches = previousMatchDayInfo.matches;
      const prevCount = prevMatches.length;
      const prevDateLabel = previousMatchDayInfo.dateStr || 'last match day';

      let prevAvgK = 0.0;
      let prevAvgRank = 0;
      let prevBooyah = 0;

      if (prevCount > 0) {
        const prevKillsSum = prevMatches.reduce((acc, m) => acc + (m.team_kills || 0), 0);
        prevAvgK = Number((prevKillsSum / prevCount).toFixed(1));
        const prevPlacements = prevMatches.map((m) => m.placement || 12);
        prevAvgRank = Math.round(prevPlacements.reduce((a, b) => a + b, 0) / prevPlacements.length);
        prevBooyah = prevMatches.filter((m) => m.placement === 1).length;
      }

      // Matches Trend
      const matchesTrend = prevCount > 0 ? (curCount - prevCount) : 0;

      // Kills Trend
      let killsTrendPct = 0;
      if (prevAvgK > 0) {
        killsTrendPct = Math.round(((curAvgK - prevAvgK) / prevAvgK) * 100);
      } else if (curAvgK > 0) {
        killsTrendPct = 100;
      }

      // Rank improvement: lower placement rank is better (#1 > #7)
      let rankImprovement = 0;
      if (prevAvgRank > 0 && curAvgRank > 0) {
        rankImprovement = prevAvgRank - curAvgRank;
      }

      const booyahTrend = curBooyah - prevBooyah;

      return {
        matches: curCount,
        matchesLabel: prevCount > 0
          ? (matchesTrend > 0 ? `▲ +${matchesTrend} vs ${prevDateLabel}` : matchesTrend < 0 ? `▼ ${matchesTrend} vs ${prevDateLabel}` : `Same as ${prevDateLabel}`)
          : (curCount > 0 ? `Logged today` : `No matches today`),
        matchesTrend,

        avgKills: curAvgK,
        avgKillsLabel: prevAvgK > 0
          ? (killsTrendPct > 0 ? `▲ +${killsTrendPct}% vs ${prevDateLabel}` : killsTrendPct < 0 ? `▼ ${Math.abs(killsTrendPct)}% vs ${prevDateLabel}` : `Same as ${prevDateLabel} (${prevAvgK})`)
          : (curAvgK > 0 ? `▲ +100% vs ${prevDateLabel}` : `0% vs ${prevDateLabel}`),
        avgKillsTrendPct: killsTrendPct,

        avgPosition: curAvgRank,
        avgPositionLabel: prevAvgRank > 0 && curAvgRank > 0
          ? (rankImprovement > 0 ? `▲ +${rankImprovement} Ranks vs #${prevAvgRank}` : rankImprovement < 0 ? `▼ ${Math.abs(rankImprovement)} Ranks vs #${prevAvgRank}` : `Same rank (#${prevAvgRank})`)
          : (curAvgRank > 0 ? `#${curAvgRank} Today` : `No ranks logged`),
        rankImprovement,

        booyah: curBooyah,
        booyahLabel: prevCount > 0
          ? (booyahTrend > 0 ? `▲ +${booyahTrend} vs ${prevDateLabel}` : booyahTrend < 0 ? `▼ ${Math.abs(booyahTrend)} vs ${prevDateLabel}` : (curBooyah === 0 ? `0 in both days` : `Same as ${prevDateLabel}`))
          : `${curBooyah} Booyahs`,
        booyahTrend,

        periodSubtitle: prevCount > 0 ? `Compared to last match day (${prevDateLabel})` : `Today telemetry`,
        hasCurrentMatches: curCount > 0,
        isMultiDay: false,
      };
    }

    // Multi-day periods: 7D, 15D, 20D
    const daysNum = period === '7D' ? 7 : period === '15D' ? 15 : 20;
    return {
      matches: curCount,
      matchesLabel: `${curCount} in last ${daysNum} days`,
      matchesTrend: 0,

      avgKills: curAvgK,
      avgKillsLabel: `Overall avg (${daysNum}D)`,
      avgKillsTrendPct: 0,

      avgPosition: curAvgRank,
      avgPositionLabel: `Overall avg rank (${daysNum}D)`,
      rankImprovement: 0,

      booyah: curBooyah,
      booyahLabel: `${curBooyah} Booyahs (${daysNum}D)`,
      booyahTrend: 0,

      periodSubtitle: `Last ${daysNum} Days Overall Squad Averages`,
      hasCurrentMatches: curCount > 0,
      isMultiDay: true,
    };
  }, [activeMatches, period, previousMatchDayInfo]);

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth bg-[#0c0c10]">
      {/* Top Header with official logo */}
      <div className="md:hidden">
        <Header onUserClick={onOpenAccount} />
      </div>

      {/* Hero Banner with slim design & attached bottom JellyTabs panel matching Image 3 */}
      <HeroBanner
        selectedDate={selectedDate}
        onDateClick={() => setIsDatePickerOpen(true)}
        period={period}
        onPeriodChange={handlePeriodChange}
      />

      {/* Date Filter Status Indicator */}
      <div className="px-5 mt-2 mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${period === 'Today' && isSameDay(selectedDate, todayDateStr) ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span>
            {period === 'Today'
              ? (isSameDay(selectedDate, todayDateStr) ? `Today • ${todayDateStr}` : `Date • ${selectedDate}`)
              : `${period} • Last ${period.replace('D', '')} Days Overall Performance`}
          </span>
        </span>
        {period !== 'Today' && (
          <button
            onClick={() => handlePeriodChange('Today')}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
          >
            <span>Switch to Today</span>
          </button>
        )}
        {period === 'Today' && selectedDate !== todayDateStr && (
          <button
            onClick={() => setSelectedDate(todayDateStr)}
            className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
          >
            <span>Jump to Today</span>
          </button>
        )}
      </div>

      {/* Zero matches today notification banner if user is viewing today & no matches logged yet */}
      {isSameDay(selectedDate, todayDateStr) && !metrics.hasCurrentMatches && allMatches.length > 0 && (
        <div className="px-5 mb-3">
          <div className="p-3 rounded-2xl glass-card border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-[11px] text-zinc-300 leading-tight">
                No matches logged yet for <strong>Today ({todayDateStr})</strong>.
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(yesterdayDateStr)}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold whitespace-nowrap active:scale-95 transition-all"
            >
              View Yesterday ({allMatches.length} Matches)
            </button>
          </div>
        </div>
      )}

      {/* 4 Compact Minimalist Glassy Stat Summary Cards (With Real Daily Improvements & Period Averages) */}
      <div className="px-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-4 mb-4 mt-1">
        {/* Card 1: Matches */}
        <div className="p-2.5 rounded-2xl glass-card border border-white/10 shadow-sm flex flex-col justify-between min-h-[86px] hover:border-red-500/30 transition-all">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/20">
            <Swords className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-base font-black text-white leading-tight">
              {metrics.matches}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight">
              Matches
            </div>
            <div className="text-[9px] font-extrabold flex items-center gap-0.5 mt-1 min-w-0">
              <span
                className={`truncate ${
                  metrics.isMultiDay
                    ? 'text-zinc-400 font-semibold'
                    : metrics.matchesTrend > 0
                    ? 'text-emerald-400'
                    : metrics.matchesTrend < 0
                    ? 'text-red-400'
                    : 'text-zinc-400 font-medium'
                }`}
                title={metrics.matchesLabel}
              >
                {metrics.matchesLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Avg Kills (Real Improvement vs Yesterday / Period Avg) */}
        <div className="p-2.5 rounded-2xl glass-card border border-white/10 shadow-sm flex flex-col justify-between min-h-[86px] hover:border-rose-500/30 transition-all">
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Crosshair className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-base font-black text-white leading-tight">
              {metrics.avgKills}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight">
              Avg Kills
            </div>
            <div className="text-[9px] font-extrabold flex items-center gap-0.5 mt-1 min-w-0">
              <span
                className={`truncate ${
                  metrics.isMultiDay
                    ? 'text-zinc-400 font-semibold'
                    : metrics.avgKillsTrendPct > 0
                    ? 'text-emerald-400'
                    : metrics.avgKillsTrendPct < 0
                    ? 'text-red-400'
                    : 'text-zinc-400 font-medium'
                }`}
                title={metrics.avgKillsLabel}
              >
                {metrics.avgKillsLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Position */}
        <div className="p-2.5 rounded-2xl glass-card border border-white/10 shadow-sm flex flex-col justify-between min-h-[86px] hover:border-amber-500/30 transition-all">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-base font-black text-white leading-tight">
              {metrics.avgPosition > 0 ? `#${metrics.avgPosition}` : '-'}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight truncate">
              Avg Position
            </div>
            <div className="text-[9px] font-extrabold flex items-center gap-0.5 mt-1 min-w-0">
              <span
                className={`truncate ${
                  metrics.isMultiDay
                    ? 'text-zinc-400 font-semibold'
                    : metrics.rankImprovement > 0
                    ? 'text-emerald-400'
                    : metrics.rankImprovement < 0
                    ? 'text-red-400'
                    : 'text-zinc-400 font-medium'
                }`}
                title={metrics.avgPositionLabel}
              >
                {metrics.avgPositionLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Booyah */}
        <div className="p-2.5 rounded-2xl glass-card border border-white/10 shadow-sm flex flex-col justify-between min-h-[86px] hover:border-amber-500/30 transition-all">
          <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/20">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-base font-black text-white leading-tight">
              {metrics.booyah}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight">
              Booyah
            </div>
            <div className="text-[9px] font-extrabold flex items-center gap-0.5 mt-1 min-w-0">
              <span
                className={`truncate ${
                  metrics.isMultiDay
                    ? 'text-zinc-400 font-semibold'
                    : metrics.booyahTrend > 0
                    ? 'text-emerald-400'
                    : metrics.booyahTrend < 0
                    ? 'text-red-400'
                    : 'text-zinc-400 font-medium'
                }`}
                title={metrics.booyahLabel}
              >
                {metrics.booyahLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrims Points Table Section Header */}
      <div className="px-5 mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
            <Trophy className="w-3 h-3" />
          </div>
          <h2 className="text-sm font-black text-white tracking-tight uppercase">
            Scrims Points Table
          </h2>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            Latest 5
          </span>
        </div>
        <button
          onClick={handleOpenSeeAll}
          className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-0.5 active:scale-95 transition-all"
        >
          <span>See All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Column Labels */}
      {latestScrims.length > 0 && (
        <div className="px-5 mb-1.5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-zinc-500">
          <span>Tournament / Scrim</span>
          <div className="flex items-center gap-3 pr-4">
            <span className="text-red-400/80">KP</span>
            <span className="text-blue-400/80">PP</span>
            <span className="text-amber-400/80">TP</span>
          </div>
        </div>
      )}

      {/* Empty State if no scrims */}
      {latestScrims.length === 0 && (
        <div className="px-5 mb-4">
          <div className="p-4 rounded-2xl glass-card border border-white/10 text-center">
            <p className="text-xs font-bold text-zinc-300">No scrims found</p>
            <button
              onClick={onOpenAddTournament}
              className="mt-2 text-xs font-black text-red-500 hover:text-red-400 underline"
            >
              + Create Tournament
            </button>
          </div>
        </div>
      )}

      {/* Latest 5 Scrims Cards (Top performing in Green, Worst performing in Red) */}
      <div className="px-5 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0">
        {latestScrims.map((s, idx) => {
          let cardStyle = 'border-white/15 glass-card hover:border-white/30';
          if (s.isTop) {
            cardStyle = 'glass-card border-emerald-500/60 bg-gradient-to-r from-emerald-950/30 via-[#0e1f16] to-[#0c0c10] shadow-[0_0_18px_rgba(16,185,129,0.22)] hover:border-emerald-400/80';
          } else if (s.isLowest) {
            cardStyle = 'glass-card border-red-500/60 bg-gradient-to-r from-red-950/30 via-[#220d10] to-[#0c0c10] shadow-[0_0_18px_rgba(239,68,68,0.22)] hover:border-red-400/80';
          }

          return (
            <div
              key={s.id}
              onClick={() => handleOpenScrimDetail(s.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${cardStyle}`}
            >
              {/* Left: Rank & Scrim Name & Date/Matches */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    s.isTop
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : s.isLowest
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-[#1c1c24] text-zinc-400 border border-white/5'
                  }`}
                >
                  #{pointsRankMap.get(s.id) || idx + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {s.isTop && (
                      <span className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                        <Crown className="w-2 h-2 text-emerald-400" />
                        <span>TOP SCRIM</span>
                      </span>
                    )}
                    {s.isLowest && (
                      <span className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-0.5">
                        <ShieldAlert className="w-2 h-2 text-red-400" />
                        <span>LOWEST</span>
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-zinc-400">
                      {s.matchesCount} {s.matchesCount === 1 ? 'Match' : 'Matches'}
                    </span>
                  </div>

                  <h3 className="text-xs font-black text-white tracking-tight leading-tight truncate mt-0.5">
                    {s.name}
                  </h3>

                  <div className="text-[9.5px] text-zinc-500 font-semibold truncate">
                    {s.date}
                  </div>
                </div>
              </div>

              {/* Right: KP, PP, TP */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* KP */}
                <div className="px-2 py-1 rounded-xl bg-red-500/10 border border-red-500/20 text-center min-w-[34px]">
                  <div className="text-xs font-black text-red-400 leading-none">{s.kp}</div>
                  <div className="text-[7.5px] font-extrabold text-zinc-400 uppercase mt-0.5">KP</div>
                </div>

                {/* PP */}
                <div className="px-2 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center min-w-[34px]">
                  <div className="text-xs font-black text-blue-400 leading-none">{s.pp}</div>
                  <div className="text-[7.5px] font-extrabold text-zinc-400 uppercase mt-0.5">PP</div>
                </div>

                {/* TP */}
                <div
                  className={`px-2.5 py-1 rounded-xl border text-center min-w-[40px] ${
                    s.isTop
                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : s.isLowest
                      ? 'bg-red-500/25 text-red-300 border-red-500/40 shadow-sm'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <div className="text-xs font-black leading-none">{s.tp}</div>
                  <div className="text-[7.5px] font-extrabold uppercase mt-0.5">TP</div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Matches Header */}
      <div className="px-5 mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-black text-white tracking-tight uppercase">
          Recent Matches
        </h2>
        <button
          onClick={() => onNavigateTab('matches')}
          className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-0.5"
        >
          See All
        </button>
      </div>

      {/* Compact Recent Matches List with Points */}
      <div className="px-5 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0">
        {(allMatches && allMatches.length > 0 ? allMatches.slice(0, 4) : []).map((m) => {
          const matchPts = calculateMatchPoints(m.placement, m.team_kills);
          return (
            <div
              key={m.id}
              onClick={() => onSelectMatch(m)}
              className="p-2.5 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-red-500/35 transition-all active:scale-[0.98]"
            >
              {/* Map Thumbnail */}
              <div className="w-12 h-11 rounded-xl overflow-hidden bg-[#1c1c24] flex-shrink-0 border border-white/10">
                <img
                  src={mapThumbnails[m.map] || ASSETS.maps.BERMUDA}
                  alt={m.map}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Placement Badge */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                m.placement === 1
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : m.placement === 2
                  ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                  : 'bg-[#1c1c24] text-zinc-400 border border-white/5'
              }`}>
                #{m.placement}
                {m.placement === 1 && <Crown className="w-2.5 h-2.5 text-amber-400 ml-0.5" />}
              </div>

              {/* Map Info */}
              <div className="flex-1 min-w-0">
                <div className="font-black text-white text-xs tracking-tight truncate">
                  {m.map}
                </div>
                <div className="text-[10px] font-semibold text-zinc-500">
                  {m.date}, {m.time}
                </div>
              </div>

              {/* Stats (Kills + Points) */}
              <div className="flex items-center gap-2.5 text-right">
                <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-xs font-black text-amber-400 leading-none">{matchPts.totalPts}</div>
                  <div className="text-[8px] font-extrabold text-zinc-400 uppercase">Pts</div>
                </div>
                <div>
                  <div className="text-xs font-black text-red-500">{m.team_kills}</div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase">Kills</div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Cards (Add Match + Add Tournament) */}
      <div className="px-5 grid grid-cols-2 gap-2.5 mb-4">
        <div
          onClick={onOpenAddMatch}
          className="p-3 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center justify-between cursor-pointer hover:border-red-500/35 transition-all active:scale-95"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shadow-sm">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white leading-tight">
                Add Match
              </h3>
              <p className="text-[9px] text-zinc-400 font-medium">
                Record match results
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-red-500" />
        </div>

        <div
          onClick={onOpenAddTournament}
          className="p-3 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-500/35 transition-all active:scale-95"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-sm">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white leading-tight">
                Add Tournament
              </h3>
              <p className="text-[9px] text-zinc-400 font-medium">
                Create tournament cup
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </div>

      {/* Date Picker Filter Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
        }}
      />

      {/* Comprehensive Points Table Modal (See All) */}
      <PointsTableModal
        isOpen={isPointsTableOpen}
        onClose={() => setIsPointsTableOpen(false)}
        scrims={scrims}
        initialExpandedId={selectedScrimId}
        onOpenAddMatch={onOpenAddMatch}
        onOpenAddTournament={onOpenAddTournament}
      />
    </div>
  );
};
