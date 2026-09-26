import React from 'react';
import { Gamepad2, Trophy, Users, FileText, X, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'practice' | 'tournament' | 'player' | 'note' | 'match') => void;
}

export const ActionSheetModal: React.FC<Props> = ({ isOpen, onClose, onSelectAction }) => {
  const { isIGL, showPermissionDenied } = useAuth();

  if (!isOpen) return null;

  const handleAction = (action: 'practice' | 'tournament' | 'player' | 'note' | 'match', actionTitle: string) => {
    if (!isIGL) {
      showPermissionDenied(actionTitle);
      return;
    }
    onClose();
    onSelectAction(action);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fade-in-smooth">
      {/* Tap backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Card */}
      <div className="bg-[#121217] rounded-t-[32px] p-5 max-w-md w-full mx-auto shadow-2xl border-t border-white/10 pb-7 animate-slide-up-smooth relative text-left">
        {/* Pull bar handle */}
        <div className="w-10 h-1 bg-[#2e2e3a] rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-black tracking-tight text-white">
            Add New
          </h2>
          <p className="text-xs font-medium text-zinc-400">
            Select an action to record to team history
          </p>
        </div>

        {/* 2x2 Action Tiles Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* 1. Add Practice */}
          <div
            onClick={() => handleAction('practice', 'Add Practice')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[140px] ${
              isIGL
                ? 'bg-[#181820] hover:bg-[#20202c] border-[#282836] hover:border-red-500/35 active:scale-95 shadow-sm'
                : 'bg-[#15151c] border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-red-500" />
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#20202a] text-zinc-400">
                    <Lock className="w-2.5 h-2.5" /> IGL
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-white text-xs leading-tight mb-0.5">
                Add Practice
              </h3>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                Record scrim practice with team performance.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-500 pt-1">
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Map</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Kills</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Rank</span>
            </div>
          </div>

          {/* 2. Add Tournament */}
          <div
            onClick={() => handleAction('tournament', 'Add Tournament')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[140px] ${
              isIGL
                ? 'bg-[#181820] hover:bg-[#20202c] border-[#282836] hover:border-amber-500/35 active:scale-95 shadow-sm'
                : 'bg-[#15151c] border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#20202a] text-zinc-400">
                    <Lock className="w-2.5 h-2.5" /> IGL
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-white text-xs leading-tight mb-0.5">
                Add Tournament
              </h3>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                Create new official cup & tournament matches.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-500 pt-1">
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Name</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Date</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Cup</span>
            </div>
          </div>

          {/* 3. Add Player */}
          <div
            onClick={() => handleAction('player', 'Add Player')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[140px] ${
              isIGL
                ? 'bg-[#181820] hover:bg-[#20202c] border-[#282836] hover:border-red-500/35 active:scale-95 shadow-sm'
                : 'bg-[#15151c] border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-red-500" />
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#20202a] text-zinc-400">
                    <Lock className="w-2.5 h-2.5" /> IGL
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-white text-xs leading-tight mb-0.5">
                Add Player
              </h3>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                Recruit player and assign official roster role.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-500 pt-1">
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Name</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Role</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Join</span>
            </div>
          </div>

          {/* 4. Add IGL Note */}
          <div
            onClick={() => handleAction('note', 'Add IGL Note')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[140px] ${
              isIGL
                ? 'bg-[#181820] hover:bg-[#20202c] border-[#282836] hover:border-purple-500/35 active:scale-95 shadow-sm'
                : 'bg-[#15151c] border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#20202a] text-zinc-400">
                    <Lock className="w-2.5 h-2.5" /> IGL
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-white text-xs leading-tight mb-0.5">
                Add IGL Note
              </h3>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                Log feedback, player notes, or strat guidelines.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-500 pt-1">
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Team</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Date</span>
              <span className="px-1.5 py-0.5 rounded bg-[#20202a] border border-[#2b2b38]">Notes</span>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#1c1c24] hover:bg-[#242430] border border-[#282836] text-zinc-300 hover:text-white font-extrabold text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};
