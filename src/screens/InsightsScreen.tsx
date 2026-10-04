import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, Calendar, Skull, Target, Flame, Gamepad2,
  Sparkles, RefreshCw, Trophy, BarChart2, CheckCircle2,
  AlertCircle, ArrowRight
} from 'lucide-react';
import { Match } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InsightsChart, ChartDataPoint } from '../components/InsightsChart';
import { DatePickerModal } from '../components/DatePickerModal';
import { fetchDeterministicInsights, InsightResult } from '../services/groqService';
import { getPlacementPoints } from '../utils/points';
import { getTodayDateString, getYesterdayDateString, isSameDay } from '../utils/dateUtils';
import { getPlayerAvatar } from '../utils/assets';
import { JellyTabs } from '../components/JellyTabs';

type ViewMode = 'Me' | 'Team';
type CategoryFilter = 'Today' | 'Overall';

interface Props {
  onBack?: () => void;
  matches?: Match[];
}

const SQUAD_PLAYERS = [
  { name: 'HASHIRAMA', ign: 'SRK•HASHIRAMA⚡', role: 'Sniper' },
  { name: 'TUUFAN', ign: 'SRK•TUUFAN⚔', role: 'Assaulter' },
  { name: 'ITACHI', ign: 'SRK•ITACHI🗡', role: 'Primary Rusher' },
  { name: 'PANDIT', ign: 'SRK•PANDIT💣', role: '2nd Rusher' },
];

export const InsightsScreen: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const [viewMode, setViewMode] = useState<ViewMode>('Me');
  const [category, setCategory] = useState<CategoryFilter>('Today');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Active player selection for "Me" view (defaults to logged in user)
  const defaultPlayerName = useMemo(() => {
    const u = (user?.userId || user?.name || user?.ign || '').toUpperCase();
    if (u.includes('TUUFAN') || u.includes('TUFAN') || u.includes('PRIYANSHU')) return 'TUUFAN';
    if (u.includes('ITACHI') || u.includes('SHASHANK')) return 'ITACHI';
    if (u.includes('PANDIT') || u.includes('ANSH')) return 'PANDIT';
    return 'HASHIRAMA'; // Default to Hashirama (Ashish)
  }, [user]);

  const [activePlayer, setActivePlayer] = useState<string>(defaultPlayerName);

  useEffect(() => {
    setActivePlayer(defaultPlayerName);
  }, [defaultPlayerName]);

  // Instant SWR cache load
  const [matches, setMatches] = useState<Match[]>(() => api.getCachedMatches());
  const [, setLoading] = useState(false);

  // AI Coaching state
  const [aiInsight, setAiInsight] = useState<InsightResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load matches from API
  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await api.getMatches();
      setMatches(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  // Filter matches based on selected category & date
  const isTodayCategory = category === 'Today';

  const filteredMatches = useMemo(() => {
    if (isTodayCategory) {
      return matches.filter((m) => isSameDay(m.date, selectedDate));
    }
    return matches; // Overall
  }, [matches, isTodayCategory, selectedDate]);

  // Sort matches CHRONOLOGICALLY (oldest first: Match 1 -> Match 2 -> Match 3)
  const chronologicalMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => a.id - b.id);
  }, [filteredMatches]);

  // Check if player corresponds to active player
  const matchesActivePlayer = (pName?: string) => {
    if (!pName) return false;
    const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const pClean = clean(pName);
    const actClean = clean(activePlayer);

    if (actClean.includes('HASHIRAMA')) {
      return pClean.includes('HASHIRAMA') || pClean.includes('ASHISH');
    }
    if (actClean.includes('TUUFAN') || actClean.includes('TUFAN')) {
      return pClean.includes('TUUFAN') || pClean.includes('TUFAN') || pClean.includes('PRIYANSHU');
    }
    if (actClean.includes('ITACHI')) {
      return pClean.includes('ITACHI') || pClean.includes('SHASHANK');
    }
    if (actClean.includes('PANDIT')) {
      return pClean.includes('PANDIT') || pClean.includes('ANSH');
    }

    return false;
  };

  // Only matches where this active player actually played in the squad
  const playerPlayedMatches = useMemo(() => {
    return chronologicalMatches.filter((m) =>
      m.player_stats?.some((p) => matchesActivePlayer(p.player_name))
    );
  }, [chronologicalMatches, activePlayer]);

  // Calculate stats for "Me" strictly from matches played
  const playerStatsList = useMemo(() => {
    return playerPlayedMatches.map((m, idx) => {
      const pStat = m.player_stats?.find((p) => matchesActivePlayer(p.player_name));
      const kills = pStat ? pStat.kills : 0;
      return {
        matchIndex: idx + 1,
        matchName: `Match ${idx + 1}`,
        kills,
        map: m.map,
        date: m.date,
      };
    });
  }, [playerPlayedMatches, activePlayer]);

  const meTotalKills = playerStatsList.reduce((acc, curr) => acc + curr.kills, 0);
  const meMatchesCount = playerStatsList.length;
  const meAvgKills = meMatchesCount > 0 ? Number((meTotalKills / meMatchesCount).toFixed(1)) : 0.0;
  const meHighestKills = playerStatsList.length > 0 ? Math.max(...playerStatsList.map((p) => p.kills)) : 0;

  // Chart 1 (Me Kills in category) - Chronological left to right
  const meKillsChartData: ChartDataPoint[] = useMemo(() => {
    return playerStatsList.map((p) => ({
      label: p.matchName,
      value: p.kills,
      subtext: `${p.kills} Kills`,
    }));
  }, [playerStatsList]);

  // Recent Trend data for Me
  const meTrendChartData: ChartDataPoint[] = useMemo(() => {
    return playerStatsList.map((p) => ({
      label: p.matchName,
      value: p.kills,
      subtext: `${p.kills} Kills`,
    }));
  }, [playerStatsList]);

  // Team calculations
  const teamTotalKills = chronologicalMatches.reduce((acc, curr) => acc + (curr.team_kills || 0), 0);
  const teamMatchesCount = chronologicalMatches.length;
  const teamAvgKills = teamMatchesCount > 0 ? Number((teamTotalKills / teamMatchesCount).toFixed(1)) : 0.0;
  const teamHighestKills =
    chronologicalMatches.length > 0 ? Math.max(...chronologicalMatches.map((m) => m.team_kills || 0)) : 0;

  // Team kills chart data
  const teamKillsChartData: ChartDataPoint[] = useMemo(() => {
    return chronologicalMatches.map((m, idx) => ({
      label: `Match ${idx + 1}`,
      value: m.team_kills || 0,
    }));
  }, [chronologicalMatches]);

  // Team points chart data
  const teamPointsChartData: ChartDataPoint[] = useMemo(() => {
    return chronologicalMatches.map((m, idx) => {
      const rank = m.placement || 12;
      const killPts = m.team_kills || 0;
      const totalPts = getPlacementPoints(rank) + killPts;
      return {
        label: `Match ${idx + 1}`,
        value: totalPts,
        subtext: `#${rank} (${killPts} Kills)`,
      };
    });
  }, [chronologicalMatches]);

  // Team position chart data
  const teamPositionChartData: ChartDataPoint[] = useMemo(() => {
    return chronologicalMatches.map((m, idx) => ({
      label: `Match ${idx + 1}`,
      value: m.placement || 12,
    }));
  }, [chronologicalMatches]);

  // Load AI Insights
  const generateAiInsights = async () => {
    const count = viewMode === 'Me' ? meMatchesCount : teamMatchesCount;
    if (count === 0) {
      setAiInsight(null);
      setAiLoading(false);
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetchDeterministicInsights({
        viewMode,
        category,
        totalKills: viewMode === 'Me' ? meTotalKills : teamTotalKills,
        avgKills: viewMode === 'Me' ? meAvgKills : teamAvgKills,
        highestKills: viewMode === 'Me' ? meHighestKills : teamHighestKills,
        matchesCount: count,
        playerName: viewMode === 'Me' ? activePlayer : 'Team Sarkar',
        recentKills: viewMode === 'Me' ? meKillsChartData.map((d) => d.value) : teamKillsChartData.map((d) => d.value),
      });
      setAiInsight(res);
    } catch {
      // handled
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    generateAiInsights();
  }, [viewMode, category, selectedDate, activePlayer, chronologicalMatches.length]);

  const categories: CategoryFilter[] = ['Today', 'Overall'];

  const displayTotalKills = viewMode === 'Me' ? meTotalKills : teamTotalKills;
  const displayAvgKills = viewMode === 'Me' ? meAvgKills : teamAvgKills;
  const displayHighestKills = viewMode === 'Me' ? meHighestKills : teamHighestKills;
  const displayMatchesCount = viewMode === 'Me' ? meMatchesCount : teamMatchesCount;

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth bg-[#0c0c10]">
      {/* Top Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full glass-card border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              Insights
            </h1>
            <p className="text-[11px] text-zinc-400 font-semibold mt-1">
              {viewMode === 'Me'
                ? `Individual Telemetry • ${activePlayer}`
                : 'Track team performance and growth'}
            </p>
          </div>
        </div>

        {/* Date Selector Pill */}
        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="px-3 py-1.5 rounded-full glass-card border border-white/10 shadow-xs flex items-center gap-1.5 text-zinc-300 text-xs font-bold hover:text-white hover:border-red-500/30 active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px] font-extrabold">{selectedDate}</span>
          <span className="text-zinc-500 text-[10px]">▼</span>
        </button>
      </div>

      {/* Main View Toggle: [ Me | Team ] with Jelly Effect */}
      <div className="px-5 mb-3">
        <JellyTabs
          tabs={[
            { id: 'Me', label: `Me (${activePlayer})` },
            { id: 'Team', label: 'Team' },
          ]}
          activeTab={viewMode}
          onChange={(v) => setViewMode(v as ViewMode)}
          tabClassName="py-1.5 text-xs font-black"
        />
      </div>

      {/* Player Identity Selector for "Me" view mode with Jelly Effect */}
      {viewMode === 'Me' && (
        <div className="px-5 mb-3">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Viewing Player Profile:</span>
            <span className="text-red-400 font-extrabold">{activePlayer}</span>
          </div>
          <JellyTabs
            tabs={SQUAD_PLAYERS.map((sp) => ({
              id: sp.name,
              label: (
                <div className="flex flex-col items-center py-0.5 w-full">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 mb-1 bg-[#1a1a24] flex-shrink-0">
                    <img
                      src={getPlayerAvatar(sp.name)}
                      alt={sp.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9.5px] font-black tracking-tight leading-tight truncate w-full text-center">
                    {sp.name}
                  </span>
                </div>
              ),
            }))}
            activeTab={activePlayer}
            onChange={(name) => setActivePlayer(name)}
            tabClassName="py-1"
          />
        </div>
      )}

      {/* Sub-Filters: Today vs Overall with Jelly Effect */}
      <div className="px-5 mb-3 flex items-center justify-between gap-2">
        <div className="w-[190px]">
          <JellyTabs
            tabs={['Today', 'Overall'] as const}
            activeTab={category}
            onChange={(cat) => setCategory(cat as CategoryFilter)}
            tabClassName="py-1 text-[11px] font-extrabold"
          />
        </div>

        {/* Dynamic today status badge */}
        <span className="text-[10px] font-bold text-zinc-400">
          {category === 'Today' && isSameDay(selectedDate, todayStr) ? (
            <span className="text-red-400">● Live Today ({todayStr})</span>
          ) : (
            <span>Filtered: {selectedDate}</span>
          )}
        </span>
      </div>

      {/* Zero matches banner if viewing today and matches are empty */}
      {isTodayCategory && isSameDay(selectedDate, todayStr) && chronologicalMatches.length === 0 && (
        <div className="px-5 mb-3">
          <div className="p-3.5 rounded-2xl glass-card border border-amber-500/30 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="text-[11px] text-zinc-300 leading-tight">
                No matches logged yet for <strong>Today ({todayStr})</strong>.
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(yesterdayStr)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10.5px] font-extrabold flex items-center gap-1 active:scale-95 transition-all whitespace-nowrap"
            >
              <span>View Yesterday</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Content for ME View */}
      {viewMode === 'Me' && (
        <div className="px-5 space-y-3.5">
          {/* Main Kills Chart Card */}
          <div>
            <InsightsChart
              title={`Kills - ${category}`}
              subtitle={`${activePlayer}'s kills in each match ${category.toLowerCase()}`}
              data={meKillsChartData}
              colorTheme="red"
              yAxisLabel="Kills"
              defaultChartType="line"
            />

            {/* 4 Compact Stats Pill Row */}
            <div className="grid grid-cols-4 gap-2 -mt-1 mb-3">
              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                  <Skull className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayTotalKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Total Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayAvgKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Avg Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayHighestKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Highest Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <Gamepad2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayMatchesCount}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Matches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Details Card */}
          <div className="glass-card rounded-2xl p-3.5 border border-white/10 shadow-sm">
            <div className="mb-2.5">
              <h3 className="text-sm font-black text-white tracking-tight leading-tight">
                Match Details • {activePlayer}
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium">Individual frags across recorded scrims</p>
            </div>

            {/* Match list or 0 state */}
            {meKillsChartData.length > 0 ? (
              <div className="grid grid-cols-6 gap-1.5 overflow-x-auto">
                {meKillsChartData.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center justify-center min-w-[54px]"
                  >
                    <span className="text-[9px] font-bold text-zinc-400 whitespace-nowrap">
                      {m.label}
                    </span>
                    <div className="text-xs font-black text-red-400 my-0.5 whitespace-nowrap">
                      {m.value} Kills
                    </div>
                    <span className="text-[8px] font-semibold text-zinc-500 whitespace-nowrap">
                      {m.subtext}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-center">
                <p className="text-xs font-bold text-zinc-300">0 Matches Recorded</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Use the (+) button below to log tournament matches.</p>
              </div>
            )}
          </div>

          {/* Recent Trend Card */}
          <div>
            <InsightsChart
              title={`Recent Trend - ${category}`}
              subtitle={`${activePlayer}'s kills progression`}
              data={meTrendChartData}
              colorTheme="red"
              yAxisLabel="Kills"
              defaultChartType="line"
            />
          </div>

          {/* Deterministic AI Coaching Card (Personalized Strict Coach) */}
          <div className="glass-card rounded-2xl p-4 text-white border border-red-500/25 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-red-400">
                    Sarkar AI Engine • {activePlayer}
                  </div>
                  <h3 className="text-xs font-black text-white">Coach Performance Verdict</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={generateAiInsights}
                disabled={aiLoading}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 transition-all active:scale-95"
                title="Refresh AI Insights"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {aiLoading ? (
              <div className="py-5 text-center text-xs font-bold text-zinc-400 animate-pulse">
                Analyzing combat telemetry for {activePlayer}...
              </div>
            ) : aiInsight ? (
              <div className="space-y-2.5 relative z-10">
                {/* Headline & Rating */}
                <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[9.5px] text-zinc-400 font-bold block uppercase">
                      Current Form
                    </span>
                    <span className="text-xs font-black text-white">{aiInsight.headline}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] text-emerald-400 font-bold block">Combat Rating</span>
                    <span className="text-sm font-black text-emerald-300">
                      {aiInsight.rating} <span className="text-[9.5px] text-zinc-500">/ 10</span>
                    </span>
                  </div>
                </div>

                {/* Strengths */}
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[9.5px] font-extrabold text-red-400 uppercase tracking-wide block mb-1">
                    Key Strengths / Observations
                  </span>
                  <ul className="space-y-1">
                    {aiInsight.strengths.map((s, i) => (
                      <li key={i} className="text-[10.5px] text-zinc-200 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tactical Advice / Roast */}
                <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  <span className="text-[9.5px] font-extrabold text-red-300 uppercase tracking-wide block mb-0.5">
                    Coach Tactical Directive
                  </span>
                  <p className="text-[10.5px] text-zinc-200 font-medium leading-relaxed">
                    {aiInsight.tacticalAdvice}
                  </p>
                </div>
              </div>
            ) : displayMatchesCount === 0 ? (
              <div className="py-5 text-center relative z-10">
                <BarChart2 className="w-7 h-7 text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-zinc-400">No match data available</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Play some matches to unlock AI insights</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Content for TEAM View */}
      {viewMode === 'Team' && (
        <div className="px-5 space-y-3.5">
          {/* Team Kills Card */}
          <div>
            <InsightsChart
              title={`Team Kills - ${category}`}
              subtitle="Squad kills per match"
              data={teamKillsChartData}
              colorTheme="purple"
              yAxisLabel="Kills"
              defaultChartType="line"
            />

            {/* 4 Compact Stats Pill Row */}
            <div className="grid grid-cols-4 gap-2 -mt-1 mb-3">
              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                  <Skull className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayTotalKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Total Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayAvgKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Avg Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayHighestKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Highest Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl glass-card border border-white/10 shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <Gamepad2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayMatchesCount}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-400 truncate">Matches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Points Card */}
          <div>
            <InsightsChart
              title={`Team Points - ${category}`}
              subtitle="Total team points (Placement + Kills) per match"
              data={teamPointsChartData}
              colorTheme="green"
              yAxisLabel="Points"
              defaultChartType="line"
            />
          </div>

          {/* Team Position Card */}
          <div>
            <InsightsChart
              title={`Team Position - ${category}`}
              subtitle="Team rank in each match (Lower is better)"
              data={teamPositionChartData}
              colorTheme="amber"
              yAxisLabel="Position"
              defaultChartType="line"
              invertRank={true}
            />
          </div>

          {/* AI Squad Synergy Card */}
          <div className="glass-card rounded-2xl p-4 text-white border border-red-500/25 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-400/30">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-red-400">
                    Squad Synergy Engine
                  </div>
                  <h3 className="text-xs font-black text-white">AI Team Growth Analysis</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={generateAiInsights}
                disabled={aiLoading}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {aiInsight && (
              <div className="space-y-2.5">
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[9.5px] font-extrabold text-red-400 uppercase tracking-wide block mb-1">
                    Squad Strengths
                  </span>
                  <ul className="space-y-1">
                    {aiInsight.strengths.map((s, i) => (
                      <li key={i} className="text-[10.5px] text-zinc-200 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  <span className="text-[9.5px] font-extrabold text-red-300 uppercase tracking-wide block mb-0.5">
                    Strategic Execution Tip
                  </span>
                  <p className="text-[10.5px] text-zinc-200 font-medium leading-relaxed">
                    {aiInsight.tacticalAdvice}
                  </p>
                </div>
              </div>
            )}
            {!aiLoading && !aiInsight && displayMatchesCount === 0 && (
              <div className="py-5 text-center">
                <BarChart2 className="w-7 h-7 text-zinc-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-zinc-400">No team match data available</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Record matches to unlock team AI insights</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />
    </div>
  );
};
