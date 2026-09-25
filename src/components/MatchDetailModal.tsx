import React, { useState } from 'react';
import { X, Trash2, Swords, MessageSquare } from 'lucide-react';
import { Match } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS, getMapImage, getAvatarImage } from '../utils/assets';

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
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-base font-black leading-none">#1</span>
          <span className="text-xs">👑</span>
        </div>
      );
    }
    if (placement === 2) {
      return (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-base font-black leading-none">#2</span>
          <span className="text-[10px] font-bold text-slate-400">🥈</span>
        </div>
      );
    }
    if (placement === 3) {
      return (
        <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 border border-orange-200 shadow-sm flex flex-col items-center justify-center">
          <span className="text-base font-black leading-none">#3</span>
          <span className="text-[10px] font-bold text-orange-400">🥉</span>
        </div>
      );
    }
    return (
      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
        <span className="text-base font-black leading-none">#{placement}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in-smooth overflow-y-auto">
      <div className="bg-white rounded-[32px] p-5 max-w-md w-full shadow-2xl border border-slate-100 text-left relative my-6 max-h-[92vh] overflow-y-auto animate-slide-up-smooth">
        {/* Top Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-500 hover:bg-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Map Header Card */}
        <div className="relative w-full h-32 rounded-3xl overflow-hidden mb-4 shadow-sm border border-slate-100">
          <img
            src={mapImages[match.map] || ASSETS.maps.BERMUDA}
            alt={match.map}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
            <div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                match.type === 'Tournament' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
              }`}>
                {match.type}
              </span>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm mt-1">
                {match.map}
              </h2>
            </div>
            <div className="text-right text-xs font-semibold text-slate-200">
              <div>{match.date}</div>
              <div className="text-[11px] text-slate-300">{match.time}</div>
            </div>
          </div>
        </div>

        {/* Overview Row */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {getPlacementBadge(match.placement)}
            <div>
              <div className="text-xs text-slate-500 font-bold">
                {match.tournament_name || (match.type === 'Practice' ? 'Practice Match' : 'Tournament Match')}
              </div>
              <div className="text-sm font-extrabold text-slate-800">
                {match.placement === 1 ? 'Victory Booyah!' : `Finished Rank #${match.placement}`}
              </div>
            </div>
          </div>

          <div className="text-right pr-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase">Squad Eliminations</div>
            <div className="text-xl font-black text-blue-600 leading-none">
              {match.team_kills} Kills
            </div>
          </div>
        </div>

        {/* Player Breakdown */}
        <div className="mb-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 px-1">
            Player Contributions (4 Members)
          </h3>
          <div className="space-y-2">
            {match.player_stats.map((p) => (
              <div key={p.id || p.player_id} className="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                    <img
                      src={p.player_avatar || ASSETS.avatars.ash}
                      alt={p.player_name || 'Player'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      {p.player_name}
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        {p.player_role || 'Rusher'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Survival: {p.survival_percent || 65}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400">KILLS</div>
                    <div className="text-sm font-black text-blue-600">{p.kills}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400">AST</div>
                    <div className="text-xs font-bold text-slate-600">{p.assists}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        {match.notes && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Match Observation</span>
            </div>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              "{match.notes}"
            </p>
          </div>
        )}

        {/* Delete Match Button (IGL Only) */}
        {isIGL && (
          <div className="pt-2 border-t border-slate-100">
            {deleteConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  Confirm Delete Match
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="py-2 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Match Record</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
