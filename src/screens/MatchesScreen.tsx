import React, { useState, useEffect } from 'react';
import {
  Calendar, Trophy, Gamepad2, ChevronRight, Plus, Search,
  Swords
} from 'lucide-react';
import { Match } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DatePickerModal } from '../components/DatePickerModal';
import { ASSETS } from '../utils/assets';

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
    const key = m.date.includes('25 Sept') ? 'Today • 25 Sept 2026' : m.date;
    if (!groupedMatches[key]) {
      groupedMatches[key] = [];
    }
    groupedMatches[key].push(m);
  });

  const getPlacementBadge = (placement: number) => {
    if (placement === 1) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200/80 shadow-sm flex flex-col items-center justify-center">
          <span className="text-xs font-black leading-none">#1</span>
          <span className="text-[10px] leading-none mt-0.5">👑</span>
        </div>
      );
    }
    if (placement === 2) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200/80 shadow-sm flex items-center justify-center font-black text-xs">
          #2
        </div>
      );
    }
    if (placement === 3) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-700 border border-orange-200/80 shadow-sm flex items-center justify-center font-black text-xs">
          #3
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200/80 shadow-sm flex items-center justify-center font-black text-xs">
        #{placement}
      </div>
    );
  };

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth">
      {/* Top Header */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center p-0.5">
            <img
              src={ASSETS.logo}
              alt="Team Sarkar Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.2em] font-black text-slate-500 uppercase leading-none">
              Team
            </div>
            <div className="text-base font-black tracking-tight text-slate-900 leading-tight">
              SARKAR
            </div>
            <div className="text-[9px] tracking-widest font-bold text-blue-600 uppercase leading-none">
              FF ESPORTS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition-transform">
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
            className="w-9 h-9 rounded-full bg-blue-600 text-white shadow-btn-glow flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
            title="Add Match"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* Screen Title & Date Filter Capsule */}
      <div className="px-5 mt-2 mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Matches
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Tournament and practice logs (Kalahari supported)
          </p>
        </div>

        <button
          onClick={() => setIsDatePickerOpen(true)}
          className="glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-slate-700 shadow-sm border border-white active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{selectedDate === 'All' ? 'All Dates' : selectedDate}</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </button>
      </div>

      {/* Segmented Filter Control */}
      <div className="px-5 mb-4">
        <div className="glass-pill p-1 rounded-2xl flex items-center justify-between border border-white/80 shadow-sm">
          <button
            onClick={() => setFilterType('All')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              filterType === 'All'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>All Matches</span>
          </button>

          <button
            onClick={() => setFilterType('Tournament')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              filterType === 'Tournament'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Tournaments</span>
          </button>

          <button
            onClick={() => setFilterType('Practice')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              filterType === 'Practice'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>
        </div>
      </div>

      {/* Date Grouped Matches Feed */}
      <div className="px-5 space-y-6">
        {Object.keys(groupedMatches).length === 0 ? (
          <div className="p-8 text-center bg-white/70 rounded-3xl border border-slate-200">
            <Gamepad2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">No matches found for this filter.</div>
            <div className="text-xs text-slate-400 mt-1">
              {isIGL ? 'Tap + to record a match.' : 'Waiting for IGL to record matches.'}
            </div>
          </div>
        ) : (
          Object.entries(groupedMatches).map(([dateLabel, dateMatches]) => (
            <div key={dateLabel} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center justify-between text-xs font-black text-slate-800 px-1">
                <span>{dateLabel}</span>
                <span className="text-[11px] font-bold text-slate-400">
                  {dateMatches.length} Matches
                </span>
              </div>

              {/* Match Cards */}
              <div className="space-y-3">
                {dateMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMatch(m)}
                    className="p-3.5 rounded-3xl bg-white/95 backdrop-blur-md border border-white/80 shadow-soft-card cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                  >
                    {/* Top Row: Map Thumbnail, Map Name, Tag, Placement, Kills */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Map Image Thumbnail */}
                      <div className="w-16 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                        <img
                          src={mapThumbnails[m.map] || ASSETS.maps.BERMUDA}
                          alt={m.map}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Map & Type Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 tracking-tight truncate">
                          {m.map}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                            m.type === 'Tournament'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                              : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {m.type}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {m.time}
                          </span>
                        </div>
                      </div>

                      {/* Placement Badge */}
                      {getPlacementBadge(m.placement)}

                      {/* Kills Only */}
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <div className="text-sm font-black text-blue-600">{m.team_kills}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Kills</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>

                    {/* Sub-row: 4 Players Mini-Stats Breakdown (KILLS ONLY) */}
                    {m.player_stats && m.player_stats.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-4 gap-1">
                        {m.player_stats.slice(0, 4).map((p) => (
                          <div key={p.id || p.player_id} className="flex items-center gap-1.5 text-[10px]">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-xs bg-slate-100 flex-shrink-0">
                              <img
                                src={p.player_avatar || ASSETS.avatars.ash}
                                alt={p.player_name || 'Player'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-800 text-[10px] truncate leading-tight">
                                {p.player_name}
                              </div>
                              <div className="text-[9px] font-bold text-blue-600 leading-tight">
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
        onSelectDate={setSelectedDate}
      />
    </div>
  );
};
