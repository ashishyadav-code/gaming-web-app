import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Trophy, Crown, Swords, Crosshair, Award, ChevronDown, ChevronUp,
  Search, Flame, ShieldAlert, Sparkles, Calendar, Layers, ArrowLeft
} from 'lucide-react';
import { ScrimSummary, OverallPointsSummary, calculateOverallSummary } from '../utils/scrimPoints';
import { ASSETS } from '../utils/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scrims: ScrimSummary[];
  initialExpandedId?: number | null;
  onOpenAddMatch?: () => void;
  onOpenAddTournament?: () => void;
}

export const PointsTableModal: React.FC<Props> = ({
  isOpen,
  onClose,
  scrims,
  initialExpandedId,
  onOpenAddMatch,
  onOpenAddTournament,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedScrimIds, setExpandedScrimIds] = useState<Record<number, boolean>>({});
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      if (initialExpandedId) {
        setExpandedScrimIds({ [initialExpandedId]: true });
      } else if (scrims.length > 0) {
        // Expand the first scrim by default for immediate preview
        setExpandedScrimIds({ [scrims[0].id]: true });
      }
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialExpandedId, scrims]);

  if (!isOpen && !shouldRender) return null;

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const toggleExpand = (id: number) => {
    setExpandedScrimIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectScrimFromLeaderboard = (id: number) => {
    setExpandedScrimIds((prev) => ({
      ...prev,
      [id]: true,
    }));
    setTimeout(() => {
      const el = document.getElementById(`scrim-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const overall: OverallPointsSummary = calculateOverallSummary(scrims);

  // Leaderboard ranked by Total Points (TP)
  const leaderboardScrims = [...scrims].sort((a, b) => b.tp - a.tp || b.kp - a.kp);

  const filteredScrims = scrims.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mapThumbnails: Record<string, string> = {
    BERMUDA: ASSETS.maps.BERMUDA,
    NEXTERRA: ASSETS.maps.NEXTERRA,
    KALAHARI: ASSETS.maps.KALAHARI,
    ALPINE: ASSETS.maps.ALPINE,
    PURGATORY: ASSETS.maps.PURGATORY,
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-3 bg-black/90 backdrop-blur-md overflow-y-auto ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
    >
      <div
        className={`glass-sheet rounded-none sm:rounded-3xl p-4 sm:p-5 max-w-lg w-full min-h-screen sm:min-h-0 shadow-2xl border-0 sm:border border-white/10 relative my-0 sm:my-6 text-left max-h-none sm:max-h-[92vh] overflow-y-auto transition-all ${
          isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'
        }`}
      >
        {/* Top Header with Back Navigation (Mobile-first page experience) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 sticky top-0 bg-[#0c0c10]/95 backdrop-blur-md z-20 -mx-4 -mt-4 px-4 pt-4 sm:static sm:mx-0 sm:mt-0 sm:px-0 sm:pt-0">
          <div className="flex items-center gap-2">
            <button
              onClick={triggerClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1 text-zinc-300 hover:text-white transition-all active:scale-95 mr-1"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden sm:inline">Back</span>
            </button>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-400">
                  Esports Standings
                </span>
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                  KP • PP • TP
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Scrims Points Table
              </h2>
            </div>
          </div>
          <button
            onClick={triggerClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* OVERALL PERFORMANCE SUMMARY CARD (WITH OVERALL STANDINGS TABLE INSIDE) */}
        <div className="mt-4 p-4 rounded-3xl glass-card border border-amber-500/30 bg-gradient-to-br from-[#1a1410] via-[#121218] to-[#0c0c10] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Overall Squad Performance
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Aggregated Standings
            </span>
          </div>

          {/* 6 Key Stats Grid */}
          <div className="grid grid-cols-3 gap-2 relative z-10 mb-4">
            {/* Total Scrims */}
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase mb-1">
                <Layers className="w-3 h-3 text-red-400" />
                <span>Total Scrims</span>
              </div>
              <div className="text-lg font-black text-white leading-tight">
                {overall.totalScrims}
              </div>
            </div>

            {/* Total Matches */}
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase mb-1">
                <Swords className="w-3 h-3 text-rose-400" />
                <span>Total Matches</span>
              </div>
              <div className="text-lg font-black text-white leading-tight">
                {overall.totalMatches}
              </div>
            </div>

            {/* Avg Points / Match */}
            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase mb-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Avg Pts/M</span>
              </div>
              <div className="text-lg font-black text-amber-400 leading-tight">
                {overall.avgPointsPerMatch}
              </div>
            </div>

            {/* Total KP */}
            <div className="p-2.5 rounded-2xl bg-black/40 border border-red-500/20">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase mb-1">
                <Crosshair className="w-3 h-3 text-red-400" />
                <span>Kill Pts (KP)</span>
              </div>
              <div className="text-lg font-black text-red-400 leading-tight">
                {overall.totalKp}
              </div>
              <div className="text-[8px] font-medium text-zinc-500">1 kill = 1 pt</div>
            </div>

            {/* Total PP */}
            <div className="p-2.5 rounded-2xl bg-black/40 border border-blue-500/20">
              <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase mb-1">
                <Award className="w-3 h-3 text-blue-400" />
                <span>Place Pts (PP)</span>
              </div>
              <div className="text-lg font-black text-blue-400 leading-tight">
                {overall.totalPp}
              </div>
              <div className="text-[8px] font-medium text-zinc-500">Rank based</div>
            </div>

            {/* Total TP */}
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-black uppercase mb-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Total Pts (TP)</span>
              </div>
              <div className="text-lg font-black text-amber-300 leading-tight">
                {overall.totalTp}
              </div>
              <div className="text-[8px] font-bold text-amber-400/80">KP + PP</div>
            </div>
          </div>

          {/* OVERALL STANDINGS LEADERBOARD TABLE (Inside the top card as requested) */}
          <div className="relative z-10 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-200">
                  Overall Tournaments Leaderboard
                </span>
              </div>
              <span className="text-[9px] font-bold text-zinc-400">
                Ranked by Total Points
              </span>
            </div>

            {/* Overall Standings Compact Table */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50">
              <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-white/5 border-b border-white/10 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Tournament / Scrim</div>
                <div className="col-span-1 text-center">M</div>
                <div className="col-span-1 text-center text-red-400">KP</div>
                <div className="col-span-1 text-center text-blue-400">PP</div>
                <div className="col-span-2 text-right text-amber-400">TP</div>
              </div>

              <div className="divide-y divide-white/5">
                {leaderboardScrims.map((scrim, rIdx) => {
                  return (
                    <div
                      key={`overall-${scrim.id}`}
                      onClick={() => handleSelectScrimFromLeaderboard(scrim.id)}
                      className="grid grid-cols-12 gap-1 px-3 py-2 items-center text-xs hover:bg-white/[0.04] cursor-pointer transition-colors"
                      title="Tap to see match breakdown"
                    >
                      <div className="col-span-1 text-center">
                        <span
                          className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-black text-[10px] ${
                            rIdx === 0
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : rIdx === 1
                              ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30'
                              : rIdx === 2
                              ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30'
                              : 'text-zinc-500 font-bold'
                          }`}
                        >
                          {rIdx + 1}
                        </span>
                      </div>

                      <div className="col-span-6 min-w-0 pr-1">
                        <div className="font-extrabold text-white text-[11px] truncate leading-tight flex items-center gap-1">
                          <span className="truncate">{scrim.name}</span>
                          {scrim.booyahCount > 0 && (
                            <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold flex-shrink-0">
                              🏆{scrim.booyahCount}
                            </span>
                          )}
                        </div>
                        <div className="text-[8.5px] text-zinc-500 font-medium truncate">
                          {scrim.date}
                        </div>
                      </div>

                      <div className="col-span-1 text-center font-bold text-zinc-400 text-[10.5px]">
                        {scrim.matchesCount}
                      </div>

                      <div className="col-span-1 text-center font-bold text-red-400 text-[10.5px]">
                        {scrim.kp}
                      </div>

                      <div className="col-span-1 text-center font-bold text-blue-400 text-[10.5px]">
                        {scrim.pp}
                      </div>

                      <div className="col-span-2 text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[11px]">
                          {scrim.tp} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-1.5 text-center text-[9px] text-zinc-500 font-medium">
              💡 Tap any tournament row above to inspect its match-by-match breakdown below
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scrims or tournaments..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
            />
          </div>
          {onOpenAddTournament && (
            <button
              onClick={() => {
                triggerClose();
                onOpenAddTournament();
              }}
              className="px-3 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1 active:scale-95 transition-all whitespace-nowrap shadow-md"
            >
              <span>+ Tournament</span>
            </button>
          )}
        </div>

        {/* Scrims Count & Standings List */}
        <div className="mt-4 mb-2 flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-zinc-400">
            All Scrims ({filteredScrims.length})
          </div>
          <div className="text-[10px] font-bold text-zinc-500">
            Tap scrim to expand match breakdown
          </div>
        </div>

        {/* List of All Scrims with Expandable Match Breakdown */}
        <div className="space-y-3 pb-2">
          {filteredScrims.length > 0 ? (
            filteredScrims.map((scrim, idx) => {
              const isExpanded = !!expandedScrimIds[scrim.id];

              // Highlighting styles
              let cardBorderClass = 'border-white/10 glass-card';
              let badgeElement = null;

              if (scrim.isTop) {
                cardBorderClass = 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/25 via-[#101915] to-[#0c0c10] shadow-[0_0_20px_rgba(16,185,129,0.15)]';
                badgeElement = (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm">
                    <Crown className="w-2.5 h-2.5 text-emerald-400" />
                    <span>TOP SCRIM</span>
                  </span>
                );
              } else if (scrim.isLowest) {
                cardBorderClass = 'border-red-500/60 bg-gradient-to-br from-red-950/25 via-[#1a0e10] to-[#0c0c10] shadow-[0_0_20px_rgba(239,68,68,0.15)]';
                badgeElement = (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 shadow-sm">
                    <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
                    <span>LOWEST</span>
                  </span>
                );
              }

              return (
                <div
                  key={scrim.id}
                  id={`scrim-card-${scrim.id}`}
                  className={`rounded-2xl border transition-all overflow-hidden ${cardBorderClass}`}
                >
                  {/* Scrim Header Row (Clickable to toggle expand) */}
                  <div
                    onClick={() => toggleExpand(scrim.id)}
                    className="p-3.5 cursor-pointer hover:bg-white/[0.02] flex items-center justify-between gap-3 select-none"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold text-zinc-500">#{idx + 1}</span>
                        {badgeElement}
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                          {scrim.matchesCount} {scrim.matchesCount === 1 ? 'Match' : 'Matches'}
                        </span>
                        {scrim.booyahCount > 0 && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                            <Trophy className="w-2.5 h-2.5" />
                            <span>{scrim.booyahCount} Booyah</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-black text-white tracking-tight leading-tight truncate">
                        {scrim.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span>{scrim.date}</span>
                        </span>
                        {scrim.notes && (
                          <span className="truncate max-w-[160px] text-zinc-500 italic">
                            • {scrim.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scrim Quick Points Pill (KP / PP / TP) */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-center">
                        {/* KP */}
                        <div className="px-2 py-1 rounded-xl bg-red-500/10 border border-red-500/20 min-w-[36px]">
                          <div className="text-xs font-black text-red-400 leading-tight">
                            {scrim.kp}
                          </div>
                          <div className="text-[7.5px] font-extrabold text-zinc-400 uppercase">
                            KP
                          </div>
                        </div>

                        {/* PP */}
                        <div className="px-2 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 min-w-[36px]">
                          <div className="text-xs font-black text-blue-400 leading-tight">
                            {scrim.pp}
                          </div>
                          <div className="text-[7.5px] font-extrabold text-zinc-400 uppercase">
                            PP
                          </div>
                        </div>

                        {/* TP (Prominent) */}
                        <div
                          className={`px-2.5 py-1 rounded-xl border min-w-[42px] ${
                            scrim.isTop
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                              : scrim.isLowest
                              ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <div className="text-sm font-black leading-tight">
                            {scrim.tp}
                          </div>
                          <div className="text-[7.5px] font-black uppercase tracking-wider">
                            TP
                          </div>
                        </div>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDABLE MATCH-BY-MATCH BREAKDOWN */}
                  {isExpanded && (
                    <div className="p-3 bg-black/50 border-t border-white/10 animate-fade-in-smooth space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400 px-1">
                        <span>Match-by-Match Breakdown</span>
                        <span>KP (1 pt) + PP = TP</span>
                      </div>

                      {scrim.matches && scrim.matches.length > 0 ? (
                        <div className="space-y-1.5">
                          {scrim.matches.map((m) => (
                            <div
                              key={m.id}
                              className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                                m.placement === 1
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                                  : 'bg-white/[0.02] border-white/5 text-zinc-300'
                              }`}
                            >
                              {/* Match # & Map */}
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                                  <img
                                    src={mapThumbnails[m.map] || ASSETS.maps.BERMUDA}
                                    alt={m.map}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-white text-[11px] leading-tight truncate">
                                    Match #{m.matchNumber} • {m.map}
                                  </div>
                                  <div className="text-[9px] text-zinc-500">
                                    {m.time ? `${m.time}` : `${m.date || 'Scrim Match'}`}
                                  </div>
                                </div>
                              </div>

                              {/* Placement Badge */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div
                                  className={`px-2 py-0.5 rounded-lg font-black text-[10px] flex items-center gap-1 border ${
                                    m.placement === 1
                                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-sm'
                                      : m.placement === 2
                                      ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                                      : m.placement === 3
                                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                      : 'bg-white/5 text-zinc-400 border-white/10'
                                  }`}
                                >
                                  <span>#{m.placement}</span>
                                  {m.placement === 1 && (
                                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                                  )}
                                </div>

                                {/* Match KP, PP, TP */}
                                <div className="flex items-center gap-1.5 text-right font-bold text-[11px]">
                                  <span className="text-red-400 font-extrabold" title="Kill Points">
                                    {m.kp}K
                                  </span>
                                  <span className="text-zinc-600">+</span>
                                  <span className="text-blue-400 font-extrabold" title="Placement Points">
                                    {m.pp}P
                                  </span>
                                  <span className="text-zinc-600">=</span>
                                  <span className="text-amber-400 font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                                    {m.tp} pts
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Scrim Total Summary Row */}
                          <div className="p-2 rounded-xl bg-black/70 border border-white/15 flex items-center justify-between gap-2 text-xs font-black">
                            <span className="text-zinc-300 uppercase tracking-wider text-[10px]">
                              Scrim Overall Total ({scrim.matches.length} Matches)
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-red-400 font-extrabold">{scrim.kp} KP</span>
                              <span className="text-zinc-600">+</span>
                              <span className="text-blue-400 font-extrabold">{scrim.pp} PP</span>
                              <span className="text-zinc-600">=</span>
                              <span className="text-amber-300 font-black px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40">
                                {scrim.tp} Total Pts
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-center">
                          <p className="text-xs text-zinc-400">
                            No individual matches recorded yet for this scrim.
                          </p>
                          {onOpenAddMatch && (
                            <button
                              onClick={() => {
                                triggerClose();
                                onOpenAddMatch();
                              }}
                              className="mt-2 text-[10px] font-black text-red-400 hover:text-red-300 underline"
                            >
                              + Add Match to this Scrim
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-6 rounded-2xl glass-card border border-white/10 text-center">
              <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-300">No scrims found</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {searchQuery ? 'Try clearing your search query' : 'Record your first tournament or scrim using the + button.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
