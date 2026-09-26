import React, { useState, useEffect, useMemo } from 'react';
import {
  Swords, Crosshair, Trophy, ChevronRight, Gamepad2,
  Sparkles, Award, Calendar, Crown
} from 'lucide-react';
import { Header } from '../components/Header';
import { HeroBanner } from '../components/HeroBanner';
import { DatePickerModal } from '../components/DatePickerModal';
import { Player, Match, DashboardSummary, DailyEvaluation } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS, getPlayerAvatar } from '../utils/assets';

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
  const { isIGL } = useAuth();
  const [period, setPeriod] = useState<'Today' | '7D' | '14D' | '30D'>('Today');
  const [selectedDate, setSelectedDate] = useState('26 Sept 2026');
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
    'Rusher': 'bg-red-500/15 text-red-400 border-red-500/30',
    'Primary Rusher': 'bg-red-500/15 text-red-400 border-red-500/30',
    '2nd Rusher': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Secondary Rusher': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Naider': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'Assaulter': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Sniper': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };

  // Calculate rounded Avg Position
  const roundedAvgPosition = useMemo(() => {
    if (dailyEval && dailyEval.avg_placement > 0) {
      return Math.round(dailyEval.avg_placement);
    }
    if (summary?.recent_matches && summary.recent_matches.length > 0) {
      const sum = summary.recent_matches.reduce((acc, m) => acc + (m.placement || 0), 0);
      return Math.round(sum / summary.recent_matches.length);
    }
    return 0;
  }, [dailyEval, summary]);

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth bg-[#0c0c10]">
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
          <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Filtered to: <strong className="text-zinc-200">{selectedDate}</strong>
          </span>
          <button
            onClick={() => setSelectedDate('All')}
            className="text-[10px] font-bold text-red-500 hover:text-red-400 hover:underline"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* Period Selector Tabs */}
      <div className="px-5 mb-3">
        <div className="p-1 rounded-2xl flex items-center justify-between bg-[#141419] border border-[#22222b] shadow-sm max-w-sm mx-auto">
          {(['Today', '7D', '14D', '30D'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p
                  ? 'bg-red-600 text-white shadow-sm scale-100'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Compact Minimalist Stat Summary Cards */}
      <div className="px-5 grid grid-cols-4 gap-2 mb-4">
        {/* Card 1: Matches */}
        <div className="p-2.5 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex flex-col justify-between min-h-[82px] hover:border-red-500/25 transition-all">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
            <Swords className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base font-black text-white leading-tight">
              {summary && summary.matches !== undefined ? summary.matches : 0}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight">
              Matches
            </div>
            <div className="text-[9px] font-extrabold text-zinc-500 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> {summary && summary.matches > 0 && summary.matches_trend ? `+${summary.matches_trend}` : '0'}
            </div>
          </div>
        </div>

        {/* Card 2: Avg Kills */}
        <div className="p-2.5 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex flex-col justify-between min-h-[82px] hover:border-red-500/25 transition-all">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Crosshair className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base font-black text-white leading-tight">
              {summary && summary.avg_kills !== undefined ? summary.avg_kills : '0.0'}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight">
              Avg Kills
            </div>
            <div className="text-[9px] font-extrabold text-zinc-500 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> {summary && summary.matches > 0 && summary.avg_kills_trend_pct ? `+${summary.avg_kills_trend_pct}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Card 3: Avg Position (Replaces Top-3 Rate, rounded) */}
        <div className="p-2.5 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex flex-col justify-between min-h-[82px] hover:border-red-500/25 transition-all">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base font-black text-white leading-tight">
              {roundedAvgPosition > 0 ? `#${roundedAvgPosition}` : '-'}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight truncate">
              Avg Position
            </div>
            <div className="text-[9px] font-extrabold text-zinc-500 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> 0
            </div>
          </div>
        </div>

        {/* Card 4: Booyah */}
        <div className="p-2.5 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex flex-col justify-between min-h-[82px] hover:border-red-500/25 transition-all">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base font-black text-white leading-tight">
              {summary && summary.booyah !== undefined ? summary.booyah : 0}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 leading-tight">
              Booyah
            </div>
            <div className="text-[9px] font-extrabold text-zinc-500 flex items-center gap-0.5 mt-0.5">
              <span>▲</span> {summary && summary.matches > 0 && summary.booyah_trend ? `+${summary.booyah_trend}` : '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Players Section Header */}
      <div className="px-5 mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-black text-white tracking-tight uppercase">
          Players
        </h2>
        <button
          onClick={() => onNavigateTab('players')}
          className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-0.5"
        >
          See All
        </button>
      </div>

      {/* Compact Players Horizontal Grid */}
      <div className="px-5 mb-4">
        {summary?.players && summary.players.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {summary.players.slice(0, 4).map((p: any) => (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p)}
                className="p-2 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex flex-col items-center text-center cursor-pointer hover:border-red-500/35 transition-all active:scale-95"
              >
                <div className="relative mb-1.5">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 shadow-sm bg-[#1c1c24] p-0.5">
                    <img
                      src={getPlayerAvatar(p.player_name || p.team_role || p.avatar_url)}
                      alt={p.player_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#141419]" />
                </div>

                <div className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-black border uppercase tracking-wider mb-1 ${roleColors[p.team_role] || 'bg-[#1c1c24] text-zinc-400 border-[#2a2a38]'}`}>
                  {p.team_role.replace('Primary ', '').replace('Secondary ', '2nd ')}
                </div>

                <h3 className="text-[11px] font-black text-white tracking-tight leading-tight truncate w-full">
                  {p.player_name}
                </h3>

                <div className="mt-1.5 pt-1 border-t border-[#22222b] w-full flex items-center justify-around text-[9px] leading-tight">
                  <div>
                    <div className="font-black text-zinc-200">{p.kd || 0.0}</div>
                    <div className="text-[8px] font-bold text-zinc-500">K/D</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#141419] border border-[#22222b] text-center">
            <p className="text-xs font-bold text-zinc-300">No players registered yet</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Use the + menu to add team players to your squad roster.</p>
          </div>
        )}
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

      {/* Compact Recent Matches List */}
      <div className="px-5 mb-4 space-y-2">
        {(summary?.recent_matches && summary.recent_matches.length > 0
          ? summary.recent_matches.slice(0, 4)
          : []
        ).map((m) => (
          <div
            key={m.id}
            onClick={() => onSelectMatch(m)}
            className="p-2.5 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-red-500/35 transition-all active:scale-[0.98]"
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
                : 'bg-[#1c1c24] text-zinc-400 border border-[#2b2b38]'
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

            {/* Stats (Kills Only) */}
            <div className="flex items-center gap-2.5 text-right">
              <div>
                <div className="text-xs font-black text-red-500">{m.team_kills}</div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase">Kills</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div className="px-5 grid grid-cols-2 gap-2.5 mb-4">
        <div
          onClick={onOpenAddPractice}
          className="p-3 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center justify-between cursor-pointer hover:border-red-500/35 transition-all active:scale-95"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shadow-sm">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white leading-tight">
                Add Practice
              </h3>
              <p className="text-[9px] text-zinc-400 font-medium">
                Record practice stats
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-red-500" />
        </div>

        <div
          onClick={onOpenAddTournament}
          className="p-3 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-500/35 transition-all active:scale-95"
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
                Record match results
              </p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
        </div>
      </div>

      {/* Today's Insights Section */}
      {dailyEval && (dailyEval.team_insights.length > 0 || dailyEval.player_insights.length > 0) && (
        <div className="px-5 mb-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#141419] to-[#1c1214] text-white shadow-soft-card border border-[#2a2226]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deterministic Insights</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 bg-white/10 px-2 py-0.5 rounded-full">
                {dailyEval.date}
              </span>
            </div>

            <div className="space-y-1.5 mt-2">
              {dailyEval.team_insights.map((item, i) => (
                <div key={i} className="text-xs bg-white/5 rounded-xl p-2 border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.title}</span>
                    {item.metric_delta && (
                      <span className="font-extrabold text-emerald-400 text-[11px]">
                        {item.metric_delta}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
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
