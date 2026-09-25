import React, { useState, useEffect } from 'react';
import {
  Swords, Skull, Trophy, ChevronRight, Gamepad2,
  Sparkles, Award, Calendar, CheckCircle2
} from 'lucide-react';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { DatePickerModal } from '../components/DatePickerModal';
import { Player, Match, DashboardSummary, DailyEvaluation } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';

interface Props {
  onNavigateTab: (tab: 'home' | 'matches' | 'players' | 'insights') => void;
  onOpenAddPractice: () => void;
  onOpenAddTournament: () => void;
  onSelectPlayer: (player: Player) => void;
  onSelectMatch: (match: Match) => void;
  onOpenAccount?: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onNavigateTab,
  onOpenAddPractice,
  onOpenAddTournament,
  onSelectPlayer,
  onSelectMatch,
  onOpenAccount,
}) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [period, setPeriod] = useState<'Today' | '7D' | '14D' | '30D'>('Today');
  const [selectedDate, setSelectedDate] = useState('25 Sept 2026');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dailyEval, setDailyEval] = useState<DailyEvaluation | null>(null);

  const loadData = async () => {
    try {
      const [sumData, evalData] = await Promise.all([
        api.getDashboardSummary(period, selectedDate),
        api.getDailyEvaluation(selectedDate),
      ]);
      setSummary(sumData);
      setDailyEval(evalData);
    } catch {
      // fallback to cached data
    }
  };

  useEffect(() => {
    loadData();
  }, [period, selectedDate]);

  const mapThumbnails: Record<string, string> = {
    BERMUDA: ASSETS.maps.BERMUDA,
    NEXTERRA: ASSETS.maps.NEXTERRA,
    KALAHARI: ASSETS.maps.KALAHARI,
    ALPINE: ASSETS.maps.ALPINE,
    PURGATORY: ASSETS.maps.PURGATORY,
  };

  const roleColors: Record<string, string> = {
    'Rusher': 'bg-rose-50 text-rose-500 border-rose-100',
    'Primary Rusher': 'bg-rose-50 text-rose-500 border-rose-100',
    '2nd Rusher': 'bg-blue-50 text-blue-500 border-blue-100',
    'Secondary Rusher': 'bg-blue-50 text-blue-500 border-blue-100',
    'Naider': 'bg-purple-50 text-purple-500 border-purple-100',
    'Assaulter': 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth">
      {/* Top Header */}
      <Header onUserClick={onOpenAccount} />

      {/* Hero Banner with clickable non-overlapping date capsule */}
      <HeroBanner
        selectedDate={selectedDate}
        onDateClick={() => setIsDatePickerOpen(true)}
      />

      {/* Date Filter Status Indicator */}
      {selectedDate !== 'All' && (
        <div className="px-5 mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Filtered to: <strong className="text-slate-800">{selectedDate}</strong>
          </span>
          <button
            onClick={() => setSelectedDate('All')}
            className="text-[10px] font-bold text-blue-600 hover:underline"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* Period Selector Tabs */}
      <div className="px-5 mb-3">
        <div className="glass-pill p-1 rounded-2xl flex items-center justify-between border border-white/80 shadow-sm max-w-sm mx-auto">
          {(['Today', '7D', '14D', '30D'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p
                  ? 'bg-blue-600 text-white shadow-sm scale-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Summary Cards (Clean 0 State) */}
      <div className="px-5 grid grid-cols-4 gap-2 mb-5">
        {/* Card 1: Matches */}
        <div className="p-2.5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-soft-card flex flex-col justify-between h-[105px]">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {summary && summary.matches !== undefined ? summary.matches : 0}
            </div>
            <div className="text-[10px] font-bold text-slate-400 leading-tight">
              Matches
            </div>
            <div className="text-[10px] font-extrabold text-slate-400 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> {summary?.matches_trend ? `+${summary.matches_trend}` : '0'}
            </div>
          </div>
        </div>

        {/* Card 2: Avg Kills */}
        <div className="p-2.5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-soft-card flex flex-col justify-between h-[105px]">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Skull className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {summary && summary.avg_kills !== undefined ? summary.avg_kills : '0.0'}
            </div>
            <div className="text-[10px] font-bold text-slate-400 leading-tight">
              Avg Kills
            </div>
            <div className="text-[10px] font-extrabold text-slate-400 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> {summary?.avg_kills_trend_pct ? `${summary.avg_kills_trend_pct}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Card 3: Top-3 Rate */}
        <div className="p-2.5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-soft-card flex flex-col justify-between h-[105px]">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {summary && (summary as any).top_3_rate !== undefined ? (summary as any).top_3_rate : '0%'}
            </div>
            <div className="text-[10px] font-bold text-slate-400 leading-tight">
              Top 3 Rate
            </div>
            <div className="text-[10px] font-extrabold text-slate-400 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> 0%
            </div>
          </div>
        </div>

        {/* Card 4: Booyah */}
        <div className="p-2.5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-soft-card flex flex-col justify-between h-[105px]">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-base font-black text-slate-900 leading-tight">
              {summary && summary.booyah !== undefined ? summary.booyah : 0}
            </div>
            <div className="text-[10px] font-bold text-slate-400 leading-tight">
              Booyah
            </div>
            <div className="text-[10px] font-extrabold text-slate-400 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> {summary?.booyah_trend ? `+${summary.booyah_trend}` : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Players Section Header */}
      <div className="px-5 mb-2.5 flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Players
        </h2>
        <button
          onClick={() => onNavigateTab('players')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          See All
        </button>
      </div>

      {/* Players Horizontal Grid */}
      <div className="px-5 mb-5">
        {summary?.players && summary.players.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {summary.players.slice(0, 4).map((p: any) => (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p)}
                className="p-2.5 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-soft-card flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-all active:scale-95"
              >
                <div className="relative mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white shadow-sm bg-slate-100 p-0.5">
                    <img
                      src={p.avatar_url || ASSETS.avatars.ash}
                      alt={p.player_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider mb-1 ${roleColors[p.team_role] || 'bg-slate-50 text-slate-600'}`}>
                  {p.team_role.replace('Primary ', '').replace('Secondary ', '2nd ')}
                </div>

                <h3 className="text-xs font-black text-slate-900 tracking-tight leading-tight">
                  {p.player_name}
                </h3>

                <div className="mt-2 pt-1.5 border-t border-slate-100 w-full flex items-center justify-around text-[10px] leading-tight">
                  <div>
                    <div className="font-black text-slate-900">{p.kd || 0.0}</div>
                    <div className="text-[9px] font-bold text-slate-400">K/D</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-white/80 border border-slate-100 text-center">
            <p className="text-xs font-bold text-slate-700">No players registered yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the + menu to add team players to your squad roster.</p>
          </div>
        )}
      </div>

      {/* Recent Matches Header */}
      <div className="px-5 mb-2.5 flex items-center justify-between">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Recent Matches
        </h2>
        <button
          onClick={() => onNavigateTab('matches')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
        >
          See All
        </button>
      </div>

      {/* Recent Matches List */}
      <div className="px-5 mb-5 space-y-2.5">
        {(summary?.recent_matches && summary.recent_matches.length > 0
          ? summary.recent_matches.slice(0, 4)
          : []
        ).map((m) => (
          <div
            key={m.id}
            onClick={() => onSelectMatch(m)}
            className="p-3 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 shadow-soft-card flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          >
            {/* Map Thumbnail */}
            <div className="w-14 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
              <img
                src={mapThumbnails[m.map] || ASSETS.maps.BERMUDA}
                alt={m.map}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Placement Badge */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
              m.placement === 1
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : m.placement === 2
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-slate-50 text-slate-500 border border-slate-100'
            }`}>
              #{m.placement}
              {m.placement === 1 && <span className="text-[10px] ml-0.5">👑</span>}
            </div>

            {/* Map Info */}
            <div className="flex-1 min-w-0">
              <div className="font-black text-slate-900 text-xs tracking-tight truncate">
                {m.map}
              </div>
              <div className="text-[10px] font-semibold text-slate-400">
                {m.date}, {m.time}
              </div>
            </div>

            {/* Stats (Kills Only) */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-xs font-black text-blue-600">{m.team_kills}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Kills</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-5">
        <div
          onClick={onOpenAddPractice}
          className="p-3.5 rounded-3xl bg-blue-50/70 border border-blue-100/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                Add Practice
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Record practice stats
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-500" />
        </div>

        <div
          onClick={onOpenAddTournament}
          className="p-3.5 rounded-3xl bg-amber-50/70 border border-amber-100/80 shadow-sm flex items-center justify-between cursor-pointer hover:bg-amber-50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                Add Tournament
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Record match results
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      {/* Today's Insights Section */}
      {dailyEval && (dailyEval.team_insights.length > 0 || dailyEval.player_insights.length > 0) && (
        <div className="px-5 mb-4">
          <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-soft-card border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deterministic Insights</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full">
                {dailyEval.date}
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {dailyEval.team_insights.map((item, i) => (
                <div key={i} className="text-xs bg-white/10 rounded-2xl p-2.5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.title}</span>
                    {item.metric_delta && (
                      <span className="font-extrabold text-emerald-400 text-[11px]">
                        {item.metric_delta}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Filter Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
        }}
      />
    </div>
  );
};
