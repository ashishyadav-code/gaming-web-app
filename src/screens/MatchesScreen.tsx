import React, { useState, useEffect } from 'react';
import {
  Calendar, ChevronRight, Plus, Search,
  Swords, Crown
} from 'lucide-react';
import { Match } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DatePickerModal } from '../components/DatePickerModal';
import { ASSETS, getPlayerAvatar } from '../utils/assets';
import { calculateMatchPoints } from '../utils/points';
import { getTodayDateString, getYesterdayDateString, isSameDay } from '../utils/dateUtils';

interface Props {
  onSelectMatch: (match: Match) => void;
  onOpenAddMatch: () => void;
}

export const MatchesScreen: React.FC<Props> = ({ onSelectMatch, onOpenAddMatch }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const [selectedDate, setSelectedDate] = useState('All');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  // Instant load from cache
  const [matches, setMatches] = useState<Match[]>(() => api.getCachedMatches());

  const loadMatches = async () => {
    try {
      const data = await api.getMatches({
        type: 'Tournament',
        date: selectedDate !== 'All' ? selectedDate : undefined,
      });
      setMatches(data);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadMatches();
  }, [selectedDate]);

  const mapThumbnails: Record<string, string> = {
    BERMUDA: ASSETS.maps.BERMUDA,
    NEXTERRA: ASSETS.maps.NEXTERRA,
    KALAHARI: ASSETS.maps.KALAHARI,
    ALPINE: ASSETS.maps.ALPINE,
    PURGATORY: ASSETS.maps.PURGATORY,
  };

  // Group matches by date dynamically
  const groupedMatches: Record<string, Match[]> = {};
  matches.forEach((m) => {
    const key = isSameDay(m.date, todayStr)
      ? `Today • ${todayStr}`
      : isSameDay(m.date, yesterdayStr)
      ? `Yesterday • ${yesterdayStr}`
      : m.date;
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
      <div className="w-10 h-10 rounded-xl bg-[#1c1c24] text-zinc-400 border border-white/5 shadow-sm flex items-center justify-center font-black text-xs">
        #{placement}
      </div>
    );
  };

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth bg-[#0c0c10]">
      {/* Top Header */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-md shadow-red-950/30">
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
          <button className="w-9 h-9 rounded-full glass-card border border-white/10 shadow-sm flex items-center justify-center text-zinc-300 hover:bg-white/10 active:scale-95 transition-transform">
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
            Tournament Matches
          </h1>
          <p className="text-[11px] font-semibold text-zinc-400">
            Official tournament and scrim match logs
          </p>
        </div>

        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-zinc-300 shadow-sm glass-card border border-white/10 hover:border-red-500/30 active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px]">{selectedDate === 'All' ? 'All Dates' : selectedDate}</span>
          <span className="text-[10px] text-zinc-500">▼</span>
        </button>
      </div>

      {/* Match List Grouped By Date */}
      <div className="px-5 space-y-4">
        {matches.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl border border-white/10">
            <Swords className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-zinc-300">No tournament matches found for this filter.</div>
            <p className="text-[11px] text-zinc-500 mt-1">Tap the (+) button above to record a new tournament match.</p>
          </div>
        ) : (
          Object.keys(groupedMatches).map((dateGroup) => (
            <div key={dateGroup} className="space-y-2">
              <div className="text-[11px] font-black text-zinc-400 uppercase tracking-wider px-1">
                {dateGroup}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 space-y-0">
                {groupedMatches[dateGroup].map((m) => {
                  const pts = calculateMatchPoints(m.placement, m.team_kills);
                  return (
                    <div
                      key={m.id}
                      onClick={() => onSelectMatch(m)}
                      className="p-3 rounded-2xl glass-card border border-white/10 shadow-sm hover:border-red-500/35 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      {/* Top Row: Map icon, Name, Time, Placement, Points & Team Kills */}
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
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                              Tournament
                            </span>
                          </div>
                          <div className="text-[10px] font-medium text-zinc-400 mt-0.5">
                            {m.date} • {m.time}
                          </div>
                        </div>

                        {/* Points & Kills */}
                        <div className="flex items-center gap-2.5 text-right">
                          <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                            <div className="text-xs font-black text-amber-400 leading-none">{pts.totalPts}</div>
                            <div className="text-[8px] font-extrabold text-zinc-400 uppercase">Pts</div>
                          </div>
                          <div>
                            <div className="text-xs font-black text-red-500">{m.team_kills}</div>
                            <div className="text-[9px] font-bold text-zinc-400 uppercase">Kills</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </div>
                      </div>

                      {/* Bottom Row: Compact Player Frags Horizontal Pills */}
                      {m.player_stats && m.player_stats.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-1 overflow-x-auto">
                          {m.player_stats.map((ps) => (
                            <div
                              key={ps.id || ps.player_id}
                              className="px-2 py-1 rounded-lg bg-black/40 border border-white/5 flex items-center gap-1.5 flex-1 min-w-[70px]"
                            >
                              <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 bg-[#222]">
                                <img
                                  src={getPlayerAvatar(ps.player_name)}
                                  alt={ps.player_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-[10px] font-bold text-zinc-300 truncate">
                                {ps.player_name?.replace(' 777', '')}
                              </span>
                              <span className="text-[10px] font-black text-red-400 ml-auto">
                                {ps.kills}k
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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
        onSelectDate={(newDate) => {
          setSelectedDate(newDate);
        }}
      />
    </div>
  );
};
