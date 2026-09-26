import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Calendar, Skull, Target, Flame, Gamepad2,
  Users, Sparkles, RefreshCw, Trophy, BarChart2, CheckCircle2
} from 'lucide-react';
import { Match } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InsightsChart, ChartDataPoint } from '../components/InsightsChart';
import { DatePickerModal } from '../components/DatePickerModal';
import { fetchDeterministicInsights, InsightResult } from '../services/groqService';
import { getPlacementPoints } from '../utils/points';

type ViewMode = 'Me' | 'Team';
type CategoryFilter = 'Today' | 'Overall';

interface Props {
  onBack?: () => void;
  matches?: Match[];
}

export const InsightsScreen: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('Me');
  const [category, setCategory] = useState<CategoryFilter>('Today');
  const [selectedDate, setSelectedDate] = useState('26 Sept 2026');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [, setLoading] = useState(true);

  // AI Coaching state
  const [aiInsight, setAiInsight] = useState<InsightResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load matches
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

  // Filter matches based on selected category & date (All matches are Tournament matches)
  const isToday = category === 'Today';

  const filteredMatches = matches.filter((m) => {
    if (isToday) {
      return m.date === selectedDate || m.date.includes(selectedDate.split(' ')[0]);
    }
    return true; // Overall
  });

  // Sort matches CHRONOLOGICALLY (oldest first: Match 1 -> Match 2 -> Match 3)
  const chronologicalMatches = [...filteredMatches].sort((a, b) => a.id - b.id);

  // Check if player corresponds to current user (Ashish is HASHIRAMA 777)
  const isCurrentUser = (pName?: string) => {
    if (!pName) return false;
    const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const pClean = clean(pName);
    const uIdClean = clean(user?.userId || '');
    const uIgnClean = clean(user?.ign || '');
    const uNameClean = clean(user?.name || '');

    // Default to Hashirama (Ashish) if not logged in or logged in as Ashish
    const isAshish =
      !user ||
      uIdClean.includes('ASHISH') ||
      uNameClean.includes('ASHISH') ||
      uIgnClean.includes('HASHIRAMA');
    if (isAshish) {
      return pClean.includes('HASHIRAMA') || pClean.includes('ASHISH');
    }

    // Itachi (Shashank)
    if (uIdClean.includes('SHASHANK') || uNameClean.includes('SHASHANK') || uIgnClean.includes('ITACHI')) {
      return pClean.includes('ITACHI') || pClean.includes('SHASHANK');
    }

    // Tuufan (Priyanshu)
    if (
      uIdClean.includes('PRIYANSHU') ||
      uNameClean.includes('PRIYANSHU') ||
      uIgnClean.includes('TUUFAN') ||
      uIgnClean.includes('TUFAN')
    ) {
      return pClean.includes('TUUFAN') || pClean.includes('TUFAN') || pClean.includes('PRIYANSHU');
    }

    // Pandit (Ansh)
    if (uIdClean.includes('ANSH') || uNameClean.includes('ANSH') || uIgnClean.includes('PANDIT')) {
      return pClean.includes('PANDIT') || pClean.includes('ANSH');
    }

    // General matching fallback
    if (uIgnClean && (pClean.includes(uIgnClean) || uIgnClean.includes(pClean))) return true;
    if (uIdClean && (pClean.includes(uIdClean) || uIdClean.includes(pClean))) return true;
    if (uNameClean && (pClean.includes(uNameClean) || uNameClean.includes(pClean))) return true;

    return false;
  };

  // Calculate stats for "Me"
  const currentUserName = user?.userId || 'ASHISH';
  const playerStatsList = chronologicalMatches.map((m, idx) => {
    const pStat = m.player_stats?.find((p) => isCurrentUser(p.player_name));
    const kills = pStat ? pStat.kills : 0;
    return {
      matchIndex: idx + 1,
      matchName: `Match ${idx + 1}`,
      kills,
      map: m.map,
      date: m.date,
    };
  });

  const meTotalKills = playerStatsList.reduce((acc, curr) => acc + curr.kills, 0);
  const meMatchesCount = playerStatsList.length;
  const meAvgKills = meMatchesCount > 0 ? Number((meTotalKills / meMatchesCount).toFixed(1)) : 0.0;
  const meHighestKills = playerStatsList.length > 0 ? Math.max(...playerStatsList.map((p) => p.kills)) : 0;

  // Chart 1 (Me Kills in category) - Chronological left to right
  const meKillsChartData: ChartDataPoint[] =
    playerStatsList.length > 0
      ? playerStatsList.map((p) => ({
          label: p.matchName,
          value: p.kills,
          subtext: `${p.kills} Kills`,
        }))
      : [];

  // Recent Trend data for Me - Chronological left to right
  const meTrendChartData: ChartDataPoint[] =
    playerStatsList.length > 0
      ? playerStatsList.map((p) => ({
          label: p.matchName,
          value: p.kills,
          subtext: `${p.kills} Kills`,
        }))
      : [];

  // Team calculations
  const teamTotalKills = chronologicalMatches.reduce((acc, curr) => acc + (curr.team_kills || 0), 0);
  const teamMatchesCount = chronologicalMatches.length;
  const teamAvgKills = teamMatchesCount > 0 ? Number((teamTotalKills / teamMatchesCount).toFixed(1)) : 0.0;
  const teamHighestKills =
    chronologicalMatches.length > 0 ? Math.max(...chronologicalMatches.map((m) => m.team_kills || 0)) : 0;

  // Team kills chart data - Chronological left to right (Match 1 -> Match 2 -> Match 3)
  const teamKillsChartData: ChartDataPoint[] =
    chronologicalMatches.length > 0
      ? chronologicalMatches.map((m, idx) => ({
          label: `Match ${idx + 1}`,
          value: m.team_kills || 0,
        }))
      : [];

  // Team points chart data (Placement pts + Kill pts) - Chronological left to right
  const teamPointsChartData: ChartDataPoint[] =
    chronologicalMatches.length > 0
      ? chronologicalMatches.map((m, idx) => {
          const rank = m.placement || 12;
          const killPts = m.team_kills || 0;
          const totalPts = getPlacementPoints(rank) + killPts;
          return {
            label: `Match ${idx + 1}`,
            value: totalPts,
            subtext: `#${rank} (${killPts} Kills)`,
          };
        })
      : [];

  // Team position chart data (Rank in each match) - Chronological left to right
  const teamPositionChartData: ChartDataPoint[] =
    chronologicalMatches.length > 0
      ? chronologicalMatches.map((m, idx) => ({
          label: `Match ${idx + 1}`,
          value: m.placement || 12,
        }))
      : [];

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
        playerName: currentUserName,
        recentKills: viewMode === 'Me' ? meKillsChartData.map((d) => d.value) : teamKillsChartData.map((d) => d.value),
      });
      setAiInsight(res);
    } catch {
      // handled in service
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    generateAiInsights();
  }, [viewMode, category, matches]);

  const categories: CategoryFilter[] = [
    'Today',
    'Overall',
  ];

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
              className="w-8 h-8 rounded-full bg-[#141419] shadow-xs border border-[#22222b] flex items-center justify-center text-zinc-300 hover:text-white active:scale-95"
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
                ? 'Track your performance and improvement'
                : 'Track team performance and growth'}
            </p>
          </div>
        </div>

        {/* Date Selector Pill */}
        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="px-3 py-1.5 rounded-full bg-[#141419] border border-[#22222b] shadow-xs flex items-center gap-1.5 text-zinc-300 text-xs font-bold hover:text-white hover:border-red-500/30 active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px] font-extrabold">{selectedDate}</span>
          <span className="text-zinc-500 text-[10px]">▼</span>
        </button>
      </div>

      {/* Main View Toggle: [ Me | Team ] */}
      <div className="px-5 mb-3">
        <div className="p-1 bg-[#141419] border border-[#22222b] rounded-full flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('Me')}
            className={`flex-1 py-1.5 text-xs font-black rounded-full transition-all text-center ${
              viewMode === 'Me'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Me
          </button>
          <button
            type="button"
            onClick={() => setViewMode('Team')}
            className={`flex-1 py-1.5 text-xs font-black rounded-full transition-all text-center ${
              viewMode === 'Team'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Team
          </button>
        </div>
      </div>

      {/* Sub-Filters */}
      <div className="px-5 mb-3 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all shadow-xs ${
              category === cat
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-[#141419] text-zinc-400 border border-[#22222b] hover:text-white hover:border-red-500/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content for ME View */}
      {viewMode === 'Me' && (
        <div className="px-5 space-y-3.5">
          {/* Main Kills Chart Card */}
          <div>
            <InsightsChart
              title={`Kills - ${category}`}
              subtitle="Your kills in each match today"
              data={meKillsChartData}
              colorTheme="red"
              yAxisLabel="Kills"
              defaultChartType="line"
            />

            {/* 4 Compact Stats Pill Row */}
            <div className="grid grid-cols-4 gap-2 -mt-1 mb-3">
              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Skull className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayTotalKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Total Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayAvgKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Avg Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayHighestKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Highest Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayMatchesCount}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Matches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Details Card */}
          <div className="bg-[#141419] rounded-2xl p-3.5 border border-[#22222b] shadow-sm">
            <div className="mb-2.5">
              <h3 className="text-sm font-black text-white tracking-tight leading-tight">
                Match Details
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium">Kill count for each match</p>
            </div>

            {/* Match list or 0 state */}
            {meKillsChartData.length > 0 ? (
              <div className="grid grid-cols-5 gap-1.5 overflow-x-auto">
                {meKillsChartData.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-[#1c1c24] border border-[#2b2b38] text-center flex flex-col items-center justify-center min-w-[58px]"
                  >
                    <span className="text-[9.5px] font-bold text-zinc-400 whitespace-nowrap">
                      {m.label}
                    </span>
                    <div className="text-xs font-black text-red-500 my-0.5 whitespace-nowrap">
                      {m.value} Kills
                    </div>
                    <span className="text-[8.5px] font-semibold text-zinc-500 whitespace-nowrap">
                      {m.subtext || `${m.value * 150} DMG`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#1c1c24] border border-[#2b2b38] text-center">
                <p className="text-xs font-bold text-zinc-300">0 Matches Recorded</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Use the (+) button below to log tournament matches.</p>
              </div>
            )}
          </div>

          {/* Recent Trend Card */}
          <div>
            <InsightsChart
              title={`Recent Trend - ${category}`}
              subtitle="Your kills in each match"
              data={meTrendChartData}
              colorTheme="red"
              yAxisLabel="Kills"
              defaultChartType="line"
            />
          </div>

          {/* Deterministic AI Coaching Card */}
          <div className="bg-gradient-to-br from-[#16161d] via-[#1a1215] to-[#121217] rounded-2xl p-4 text-white border border-[#2d2226] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-2.5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-red-400">
                    Sarkar AI Engine
                  </div>
                  <h3 className="text-xs font-black text-white">Deterministic Coach Insights</h3>
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
                Analyzing combat telemetry via Groq AI...
              </div>
            ) : aiInsight ? (
              <div className="space-y-2.5 relative z-10">
                {/* Headline & Form Score */}
                <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/10">
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
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[9.5px] font-extrabold text-red-400 uppercase tracking-wide block mb-1">
                    Key Strengths
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

                {/* Tactical Advice */}
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
              subtitle="Total team kills in each match today"
              data={teamKillsChartData}
              colorTheme="red"
              yAxisLabel="Kills"
              defaultChartType="line"
            />

            {/* 4 Compact Stats Pill Row */}
            <div className="grid grid-cols-4 gap-2 -mt-1 mb-3">
              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayTotalKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Total Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayAvgKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Avg Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayHighestKills}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Highest Kills</div>
                </div>
              </div>

              <div className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white leading-tight">
                    {displayMatchesCount}
                  </div>
                  <div className="text-[9px] font-bold text-zinc-500 truncate">Matches</div>
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
          <div className="bg-gradient-to-br from-[#16161d] via-[#1a1215] to-[#121217] rounded-2xl p-4 text-white border border-[#2d2226] shadow-xl relative overflow-hidden">
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
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
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
