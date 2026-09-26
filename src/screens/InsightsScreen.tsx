import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Calendar, Skull, Target, Flame, Gamepad2,
  Users, Sparkles, RefreshCw, Trophy, TrendingUp, Shield, BarChart2
} from 'lucide-react';
import { Match, Player } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { InsightsChart, ChartDataPoint } from '../components/InsightsChart';
import { DatePickerModal } from '../components/DatePickerModal';
import { fetchDeterministicInsights, InsightResult } from '../services/groqService';

type ViewMode = 'Me' | 'Team';
type CategoryFilter = 'Today Tournament' | 'Today Practice' | 'Overall Tournament' | 'Overall Practice';

interface Props {
  onBack?: () => void;
  matches?: Match[];
}

export const InsightsScreen: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('Me');
  const [category, setCategory] = useState<CategoryFilter>('Today Tournament');
  const [selectedDate, setSelectedDate] = useState('26 Sept 2026');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Filter matches based on selected category & date
  const isToday = category.startsWith('Today');
  const isTournament = category.includes('Tournament');

  const filteredMatches = matches.filter((m) => {
    const typeMatch = isTournament ? m.type === 'Tournament' : m.type === 'Practice';
    if (!typeMatch) return false;
    if (isToday) {
      return m.date === selectedDate || m.date.includes(selectedDate.split(' ')[0]);
    }
    return true; // Overall
  });

  // Calculate stats for "Me"
  const currentUserName = user?.userId || 'ASHISH';
  const playerStatsList = filteredMatches.map((m, idx) => {
    const pStat = m.player_stats?.find(
      (p) =>
        p.player_name?.toUpperCase() === currentUserName.toUpperCase() ||
        p.player_name?.toUpperCase().includes('ASHISH')
    ) || m.player_stats?.[0];

    const kills = pStat ? pStat.kills : 0;
    const damage = pStat ? pStat.damage : 0;
    return {
      matchIndex: idx + 1,
      matchName: `Match ${idx + 1}`,
      kills,
      damage,
      map: m.map,
      date: m.date,
    };
  });

  const meTotalKills = playerStatsList.reduce((acc, curr) => acc + curr.kills, 0);
  const meMatchesCount = playerStatsList.length;
  const meAvgKills = meMatchesCount > 0 ? Number((meTotalKills / meMatchesCount).toFixed(1)) : 0.0;
  const meHighestKills = playerStatsList.length > 0 ? Math.max(...playerStatsList.map((p) => p.kills)) : 0;

  // Chart 1 (Me Kills in category) - Strictly 0 if no matches
  const meKillsChartData: ChartDataPoint[] =
    playerStatsList.length > 0
      ? playerStatsList.map((p) => ({
          label: p.matchName,
          value: p.kills,
          subtext: `${p.damage} DMG`,
        }))
      : [];

  // Recent 7-Day Trend data for Me - Strictly empty/0 if no matches
  const meTrendChartData: ChartDataPoint[] = [];

  // Team calculations
  const teamTotalKills = filteredMatches.reduce((acc, curr) => acc + (curr.team_kills || 0), 0);
  const teamMatchesCount = filteredMatches.length;
  const teamAvgKills = teamMatchesCount > 0 ? Number((teamTotalKills / teamMatchesCount).toFixed(1)) : 0.0;
  const teamHighestKills =
    filteredMatches.length > 0 ? Math.max(...filteredMatches.map((m) => m.team_kills || 0)) : 0;

  const teamKillsChartData: ChartDataPoint[] =
    filteredMatches.length > 0
      ? filteredMatches.map((m, idx) => ({
          label: `Match ${idx + 1}`,
          value: m.team_kills || 0,
        }))
      : [];

  // Team Points progression (Overall Tournament) - Strictly empty/0 if no matches
  const teamPointsChartData: ChartDataPoint[] = [];

  // Team Position progression (Rank, 1 is best) - Strictly empty/0 if no matches
  const teamPositionChartData: ChartDataPoint[] = [];

  // Load AI Insights — only when real data exists
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

  // Categories list
  const categories: CategoryFilter[] = [
    'Today Tournament',
    'Today Practice',
    'Overall Tournament',
    'Overall Practice',
  ];

  const displayTotalKills = viewMode === 'Me' ? meTotalKills : teamTotalKills;
  const displayAvgKills = viewMode === 'Me' ? meAvgKills : teamAvgKills;
  const displayHighestKills = viewMode === 'Me' ? meHighestKills : teamHighestKills;
  const displayMatchesCount = viewMode === 'Me' ? meMatchesCount : teamMatchesCount;

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth">
      {/* Top Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-700 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
              Insights
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              {viewMode === 'Me'
                ? 'Track your performance and improvement'
                : 'Track team performance and growth'}
            </p>
          </div>
        </div>

        {/* Date Selector Pill */}
        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center gap-1.5 text-slate-700 text-xs font-bold active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[11px] font-extrabold">{selectedDate}</span>
          <span className="text-slate-400 text-[10px]">▼</span>
        </button>
      </div>

      {/* Main View Toggle: [ Me | Team ] */}
      <div className="px-5 mb-3">
        <div className="p-1 bg-white border border-slate-200/80 rounded-full flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('Me')}
            className={`flex-1 py-2 text-xs font-black rounded-full transition-all text-center ${
              viewMode === 'Me'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Me
          </button>
          <button
            type="button"
            onClick={() => setViewMode('Team')}
            className={`flex-1 py-2 text-xs font-black rounded-full transition-all text-center ${
              viewMode === 'Team'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team
          </button>
        </div>
      </div>

      {/* Sub-Filters: Today Tournament, Today Practice, Overall Tournament, Overall Practice */}
      <div className="px-5 mb-4 overflow-x-auto scrollbar-none flex items-center gap-1.5 py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all shadow-xs ${
              category === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content for ME View */}
      {viewMode === 'Me' && (
        <div className="px-5 space-y-4">
          {/* Main Kills Chart Card */}
          <div>
            <InsightsChart
              title={`Kills - ${category}`}
              subtitle="Your kills in each match today"
              data={meKillsChartData}
              colorTheme="blue"
              yAxisLabel="Kills"
              defaultChartType="line"
            />

            {/* 4 Stats Pill Row Underneath Chart */}
            <div className="grid grid-cols-4 gap-2 -mt-1 mb-4">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Skull className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayTotalKills}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Total Kills</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayAvgKills}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Avg Kills</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayHighestKills}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Highest Kills</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayMatchesCount}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Matches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Details Card */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft-card">
            <div className="mb-3">
              <h3 className="text-[15px] font-black text-slate-900 tracking-tight leading-tight">
                Match Details
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Kill count for each match</p>
            </div>

            {/* Match list or 0 state */}
            {meKillsChartData.length > 0 ? (
              <div className="grid grid-cols-5 gap-1.5 overflow-x-auto">
                {meKillsChartData.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-2xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center justify-center min-w-[58px]"
                  >
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                      {m.label}
                    </span>
                    <div className="text-xs font-black text-blue-600 my-0.5 whitespace-nowrap">
                      {m.value} Kills
                    </div>
                    <span className="text-[9px] font-semibold text-slate-500 whitespace-nowrap">
                      {m.subtext || `${m.value * 110 + 200} DMG`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-700">0 Matches Recorded</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the (+) button below to log tournament or practice matches.</p>
              </div>
            )}
          </div>

          {/* Recent Trend Card */}
          <div>
            <InsightsChart
              title="Recent Trend"
              subtitle="Your tournament kills in last 7 days"
              data={meTrendChartData}
              colorTheme="blue"
              yAxisLabel="Kills"
              defaultChartType="line"
            />
          </div>

          {/* Groq Deterministic AI Coaching Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400">
                    Sarkar AI Engine
                  </div>
                  <h3 className="text-sm font-black text-white">Deterministic Coach Insights</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={generateAiInsights}
                disabled={aiLoading}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-all active:scale-95"
                title="Refresh AI Insights"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {aiLoading ? (
              <div className="py-6 text-center text-xs font-bold text-slate-300 animate-pulse">
                Analyzing combat telemetry via Groq AI...
              </div>
            ) : aiInsight ? (
              <div className="space-y-3 relative z-10">
                {/* Headline & Form Score */}
                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Current Form
                    </span>
                    <span className="text-xs font-black text-white">{aiInsight.headline}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-400 font-bold block">Combat Rating</span>
                    <span className="text-base font-black text-emerald-300">
                      {aiInsight.rating} <span className="text-[10px] text-slate-400">/ 10</span>
                    </span>
                  </div>
                </div>

                {/* Strengths */}
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wide block mb-1">
                    Key Strengths
                  </span>
                  <ul className="space-y-1">
                    {aiInsight.strengths.map((s, i) => (
                      <li key={i} className="text-[11px] text-slate-200 flex items-center gap-1.5 font-medium">
                        <span className="text-blue-400 text-xs font-bold">✔</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tactical Advice */}
                <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
                  <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-wide block mb-1">
                    Coach Tactical Directive
                  </span>
                  <p className="text-[11px] text-blue-100 font-medium leading-relaxed">
                    {aiInsight.tacticalAdvice}
                  </p>
                </div>
              </div>
              ) : displayMatchesCount === 0 ? (
              <div className="py-6 text-center relative z-10">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-xs font-bold text-slate-400">No match data available</p>
                <p className="text-[10px] text-slate-500 mt-1">Play some matches to unlock AI insights</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Content for TEAM View */}
      {viewMode === 'Team' && (
        <div className="px-5 space-y-4">
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

            {/* 4 Stats Pill Row Underneath Team Chart */}
            <div className="grid grid-cols-4 gap-2 -mt-1 mb-4">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayTotalKills}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Total Kills</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayAvgKills}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Avg Kills</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayHighestKills}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Highest Kills</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-soft-card flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Gamepad2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {displayMatchesCount}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 truncate">Matches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Points Card */}
          <div>
            <InsightsChart
              title="Team Points - Overall Tournament"
              subtitle="Total team points by day"
              data={teamPointsChartData}
              colorTheme="green"
              yAxisLabel="Points"
              defaultChartType="line"
            />
          </div>

          {/* Team Position Card */}
          <div>
            <InsightsChart
              title="Team Position - Overall Tournament"
              subtitle="Team rank by day (Lower is better)"
              data={teamPositionChartData}
              colorTheme="amber"
              yAxisLabel="Position"
              defaultChartType="line"
              invertRank={true}
            />
          </div>

          {/* AI Squad Synergy Card */}
          <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-5 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-400/30">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest text-rose-400">
                    Squad Synergy Engine
                  </div>
                  <h3 className="text-sm font-black text-white">AI Team Growth Analysis</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={generateAiInsights}
                disabled={aiLoading}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {aiInsight && (
              <div className="space-y-3">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wide block mb-1">
                    Squad Strengths
                  </span>
                  <ul className="space-y-1">
                    {aiInsight.strengths.map((s, i) => (
                      <li key={i} className="text-[11px] text-slate-200 flex items-center gap-1.5 font-medium">
                        <span className="text-rose-400 text-xs font-bold">✔</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
                  <span className="text-[10px] font-extrabold text-rose-300 uppercase tracking-wide block mb-1">
                    Strategic Execution Tip
                  </span>
                  <p className="text-[11px] text-rose-100 font-medium leading-relaxed">
                    {aiInsight.tacticalAdvice}
                  </p>
                </div>
              </div>
            )}
            {!aiLoading && !aiInsight && displayMatchesCount === 0 && (
              <div className="py-6 text-center">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-xs font-bold text-slate-400">No team match data available</p>
                <p className="text-[10px] text-slate-500 mt-1">Record matches to unlock team AI insights</p>
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
