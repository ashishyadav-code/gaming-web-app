import React, { useState, useEffect } from 'react';
import {
  Calendar, Trophy, Gamepad2, ChevronRight, Plus, Search,
  Swords, Crown
} from 'lucide-react';
import { Match } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DatePickerModal } from '../components/DatePickerModal';
import { ASSETS, getPlayerAvatar } from '../utils/assets';

interface Props {
  onSelectMatch: (match: Match) => void;
  onOpenAddMatch: () => void;
}

export const MatchesScreen: React.FC<Props> = ({ onSelectMatch, onOpenAddMatch }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [filterType, setFilterType] = useState<'All' | 'Tournament' | 'Practice'>('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);

  const loadMatches = async () => {
    try {
      const data = await api.getMatches({
        type: filterType,
        date: selectedDate !== 'All' ? selectedDate : undefined,
      });
      setMatches(data);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadMatches();
  }, [filterType, selectedDate]);

  const mapThumbnails: Record<string, string> = {
    BERMUDA: ASSETS.maps.BERMUDA,
    NEXTERRA: ASSETS.maps.NEXTERRA,
    KALAHARI: ASSETS.maps.KALAHARI,
    ALPINE: ASSETS.maps.ALPINE,
    PURGATORY: ASSETS.maps.PURGATORY,
  };

  // Group matches by date
  const groupedMatches: Record<string, Match[]> = {};
  matches.forEach((m) => {
    const key = m.date.includes('26 Sept') ? 'Today • 26 Sept 2026' : m.date;
    if (!groupedMatches[key]) {
      groupedMatches[key] = [];
    }
    groupedMatches[key].push(m);
  });

  const getPlacementBadge = (placement: number) => {
    if (placement === 1) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm flex flex-col items-center justify-center">
          <span className="text-xs font-black leading-none">#1</span>
          <Crown className="w-3 h-3 text-amber-400 mt-0.5" />
        </div>
      );
    }
    if (placement === 2) {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-500/20 text-slate-300 border border-slate-500/40 shadow-sm flex items-center justify-center font-black text-xs">
          #2
        </div>
      );
    }
    if (placement === 3) {
      return (
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm flex items-center justify-center font-black text-xs">
          #3
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-[#1c1c24] text-zinc-400 border border-[#2b2b38] shadow-sm flex items-center justify-center font-black text-xs">
        #{placement}
      </div>
    );
  };

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth bg-[#0c0c10]">
      {/* Top Header */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center p-0.5 bg-[#14141a] border border-white/10">
            <img
              src={ASSETS.logo}
              alt="Team Sarkar Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.2em] font-black text-zinc-400 uppercase leading-none">
              Team
            </div>
            <div className="text-base font-black tracking-tight text-white leading-tight">
              SARKAR
            </div>
            <div className="text-[9px] tracking-widest font-bold text-red-500 uppercase leading-none">
              FF ESPORTS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-[#15151c] border border-white/10 shadow-sm flex items-center justify-center text-zinc-300 hover:bg-[#202029] active:scale-95 transition-transform">
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (!isIGL) {
                showPermissionDenied('Add Match');
                return;
              }
              onOpenAddMatch();
            }}
            className="w-9 h-9 rounded-full bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all"
            title="Add Match"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Screen Title & Date Filter Capsule */}
      <div className="px-5 mt-2 mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight leading-tight">
            Matches
          </h1>
          <p className="text-[11px] font-semibold text-zinc-400">
            Tournament and practice match logs
          </p>
        </div>

        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-zinc-300 shadow-sm bg-[#141419] border border-[#22222b] hover:border-red-500/30 active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px]">{selectedDate === 'All' ? 'All Dates' : selectedDate}</span>
          <span className="text-[10px] text-zinc-500">▼</span>
        </button>
      </div>

      {/* Segmented Filter Control */}
      <div className="px-5 mb-4">
        <div className="p-1 rounded-2xl flex items-center justify-between bg-[#141419] border border-[#22222b] shadow-sm">
          <button
            onClick={() => setFilterType('All')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              filterType === 'All'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All Matches</span>
          </button>

          <button
            onClick={() => setFilterType('Tournament')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              filterType === 'Tournament'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Tournaments</span>
          </button>

          <button
            onClick={() => setFilterType('Practice')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              filterType === 'Practice'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>
        </div>
      </div>

      {/* Match List Grouped By Date */}
      <div className="px-5 space-y-4">
        {matches.length === 0 ? (
          <div className="p-8 text-center bg-[#141419] rounded-2xl border border-[#22222b]">
            <Swords className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-zinc-300">No matches found for this filter.</div>
            <p className="text-[11px] text-zinc-500 mt-1">Tap the (+) button above to record a new match.</p>
          </div>
        ) : (
          Object.keys(groupedMatches).map((dateGroup) => (
            <div key={dateGroup} className="space-y-2">
              <div className="text-[11px] font-black text-zinc-400 uppercase tracking-wider px-1">
                {dateGroup}
              </div>

              <div className="space-y-2">
                {groupedMatches[dateGroup].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m)}
                    className="p-3 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm hover:border-red-500/35 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {/* Top Row: Map icon, Name, Time, Placement, Team Kills */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Map Image Thumbnail */}
                      <div className="w-12 h-11 rounded-xl overflow-hidden bg-[#1c1c24] flex-shrink-0 border border-white/10">
                        <img
                          src={mapThumbnails[m.map] || ASSETS.maps.BERMUDA}
                          alt={m.map}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Placement Badge */}
                      {getPlacementBadge(m.placement)}

                      {/* Match Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-black text-white tracking-tight truncate">
                            {m.map}
                          </h3>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            m.type === 'Tournament'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {m.type}
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                          {m.time} {m.tournament_name ? `• ${m.tournament_name}` : ''}
                        </div>
                      </div>

                      {/* Team Kills */}
                      <div className="flex items-center gap-2 text-right flex-shrink-0">
                        <div>
                          <div className="text-sm font-black text-red-500">{m.team_kills}</div>
                          <div className="text-[9px] font-bold text-zinc-500 uppercase">Kills</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                      </div>
                    </div>

                    {/* Sub-row: 4 Players Mini-Stats Breakdown */}
                    {m.player_stats && m.player_stats.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#22222b] grid grid-cols-4 gap-1">
                        {m.player_stats.slice(0, 4).map((p) => (
                          <div key={p.id || p.player_id} className="flex items-center gap-1.5 text-[10px]">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-xs bg-[#1c1c24] flex-shrink-0">
                              <img
                                src={getPlayerAvatar(p.player_name || p.player_role || p.player_avatar)}
                                alt={p.player_name || 'Player'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-zinc-200 text-[10px] truncate leading-tight">
                                {p.player_name}
                              </div>
                              <div className="text-[9px] font-bold text-red-400 leading-tight">
                                {p.kills} Kills
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

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
