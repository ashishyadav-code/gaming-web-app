import React, { useState } from 'react';
import { X, Trash2, Crown, Swords, MessageSquare, Award } from 'lucide-react';
import { Match } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS, getPlayerAvatar } from '../utils/assets';
import { calculateMatchPoints } from '../utils/points';

interface Props {
  match: Match | null;
  onClose: () => void;
  onDeleted: () => void;
}

export const MatchDetailModal: React.FC<Props> = ({ match, onClose, onDeleted }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!match) return null;

  const points = calculateMatchPoints(match.placement, match.team_kills);

  const handleDelete = async () => {
    if (!isIGL) {
      showPermissionDenied('Delete Match');
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteMatch(match.id);
      setIsDeleting(false);
      onDeleted();
      onClose();
    } catch {
      setIsDeleting(false);
    }
  };

  const mapImages: Record<string, string> = {
    BERMUDA: ASSETS.maps.BERMUDA,
    NEXTERRA: ASSETS.maps.NEXTERRA,
    KALAHARI: ASSETS.maps.KALAHARI,
    ALPINE: ASSETS.maps.ALPINE,
    PURGATORY: ASSETS.maps.PURGATORY,
  };

  const getPlacementBadge = (placement: number) => {
    if (placement === 1) {
      return (
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm flex flex-col items-center justify-center">
          <span className="text-base font-black leading-none">#1</span>
          <Crown className="w-3.5 h-3.5 mt-0.5 text-amber-400" />
        </div>
      );
    }
    if (placement === 2) {
      return (
        <div className="w-12 h-12 rounded-xl bg-slate-500/20 text-slate-300 border border-slate-500/40 shadow-sm flex items-center justify-center font-black text-sm">
          #2
        </div>
      );
    }
    if (placement === 3) {
      return (
        <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm flex items-center justify-center font-black text-sm">
          #3
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-xl bg-[#1c1c24] text-zinc-400 border border-[#2b2b38] shadow-sm flex items-center justify-center font-black text-sm">
        #{placement}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in-smooth overflow-y-auto">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#22222b] text-left relative my-6 max-h-[92vh] overflow-y-auto animate-slide-up-smooth">
        {/* Top Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#1c1c24] border border-white/10 shadow-sm flex items-center justify-center text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Map Header Card */}
        <div className="relative w-full h-32 rounded-2xl overflow-hidden mb-3.5 shadow-sm border border-white/10">
          <img
            src={mapImages[match.map] || ASSETS.maps.BERMUDA}
            alt={match.map}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14]/90 via-[#0e0e14]/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500 text-black">
                Tournament Match
              </span>
              <h2 className="text-xl font-black tracking-tight drop-shadow-sm mt-1">
                {match.map}
              </h2>
            </div>
            <div className="text-right text-xs font-semibold text-zinc-300">
              <div>{match.date}</div>
              <div className="text-[11px] text-zinc-400">{match.time}</div>
            </div>
          </div>
        </div>

        {/* Overview Row */}
        <div className="p-3.5 rounded-xl bg-[#1c1c24] border border-[#2b2b38] flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            {getPlacementBadge(match.placement)}
            <div>
              <div className="text-xs text-zinc-400 font-bold truncate max-w-[150px]">
                {match.tournament_name || 'Tournament Match'}
              </div>
              <div className="text-sm font-extrabold text-white">
                {match.placement === 1 ? 'Victory Booyah!' : `Finished Rank #${match.placement}`}
              </div>
              <div className="text-[11px] font-bold text-amber-400">
                {points.placementPts} Placement Pts
              </div>
            </div>
          </div>

          <div className="text-right pr-1">
            <div className="text-[9.5px] font-extrabold text-zinc-500 uppercase">Total Points</div>
            <div className="text-2xl font-black text-amber-400 leading-none">
              {points.totalPts} <span className="text-xs font-bold text-zinc-400">PTS</span>
            </div>
            <div className="text-[10px] font-bold text-red-500 mt-0.5">
              {match.team_kills} Kills ({points.killPts} pts)
            </div>
          </div>
        </div>

        {/* Player Breakdown (Kills Only) */}
        <div className="mb-3.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 px-1">
            Player Contributions ({match.player_stats?.length || 4} Members)
          </h3>
          <div className="space-y-1.5">
            {(match.player_stats || []).map((p) => (
              <div key={p.id || p.player_id} className="p-2.5 rounded-xl bg-[#1c1c24] border border-[#2b2b38] shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-[#121217] flex-shrink-0">
                    <img
                      src={getPlayerAvatar(p.player_name || p.player_role || p.player_avatar)}
                      alt={p.player_name || 'Player'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      {p.player_name}
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded-md bg-[#22222e] text-zinc-400">
                        {p.player_role || 'Rusher'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-red-500">
                    {p.kills} Kills
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400">
                    {p.kills} Pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Notes */}
        {match.notes && (
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-[#2b2b38] mb-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-400 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-red-400" />
              <span>IGL Notes:</span>
            </div>
            <p className="text-zinc-200 leading-relaxed">{match.notes}</p>
          </div>
        )}

        {/* Delete button (IGL Only) */}
        {isIGL && (
          <div className="pt-2">
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Match Log
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#1c1c24] text-zinc-400 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
