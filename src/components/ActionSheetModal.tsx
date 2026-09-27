import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Users, FileText, X, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'match' | 'tournament' | 'player' | 'note') => void;
}

export const ActionSheetModal: React.FC<Props> = ({ isOpen, onClose, onSelectAction }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !shouldRender) return null;

  const triggerClose = (afterClose?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      if (afterClose) afterClose();
    }, 220);
  };

  const handleAction = (action: 'match' | 'tournament' | 'player' | 'note', actionTitle: string) => {
    if (!isIGL) {
      showPermissionDenied(actionTitle);
      return;
    }
    triggerClose(() => onSelectAction(action));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
    >
      {/* Tap backdrop to close */}
      <div className="flex-1" onClick={() => triggerClose()} />

      {/* Bottom Sheet Card */}
      <div
        className={`glass-sheet rounded-t-[32px] p-5 max-w-md w-full mx-auto shadow-2xl border-t border-white/10 pb-7 relative text-left transition-all ${
          isClosing ? 'animate-slide-down-smooth' : 'animate-slide-up-smooth'
        }`}
      >
        {/* Pull bar handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-between">
            <span>Add New</span>
            <span className="text-[10px] uppercase font-bold text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
              Quick Action
            </span>
          </h2>
          <p className="text-xs font-medium text-zinc-400">
            Select an action to record to team history
          </p>
        </div>

        {/* 2x2 Action Tiles Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* 1. Add Match */}
          <div
            onClick={() => handleAction('match', 'Add Match')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[144px] ${
              isIGL
                ? 'glass-card hover:border-red-500/40 hover:shadow-lg active:scale-95'
                : 'bg-[#15151c]/70 border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                  <Swords className="w-5 h-5" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-red-400" />
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#20202a] text-zinc-400">
                    <Lock className="w-2.5 h-2.5" /> IGL
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-white text-xs leading-tight mb-0.5">
                Add Match
              </h3>
              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                Record tournament match kills and placement.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-400 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Map</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Kills</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Rank</span>
            </div>
          </div>

          {/* 2. Add Tournament */}
          <div
            onClick={() => handleAction('tournament', 'Add Tournament')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[144px] ${
              isIGL
                ? 'glass-card hover:border-amber-500/40 hover:shadow-lg active:scale-95'
                : 'bg-[#15151c]/70 border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-amber-400" />
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
                Log upcoming cups, scrim leagues, and schedules.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-400 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Name</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Status</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Date</span>
            </div>
          </div>

          {/* 3. Add Player */}
          <div
            onClick={() => handleAction('player', 'Add Player')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[144px] ${
              isIGL
                ? 'glass-card hover:border-blue-500/40 hover:shadow-lg active:scale-95'
                : 'bg-[#15151c]/70 border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Users className="w-5 h-5" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-blue-400" />
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
                Register new teammates with roles and IGNs.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-400 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Name</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Role</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Join</span>
            </div>
          </div>

          {/* 4. Add IGL Note */}
          <div
            onClick={() => handleAction('note', 'Add IGL Note')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[144px] ${
              isIGL
                ? 'glass-card hover:border-purple-500/40 hover:shadow-lg active:scale-95'
                : 'bg-[#15151c]/70 border-[#22222b] text-zinc-500'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
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

            <div className="flex items-center gap-1 text-[8.5px] font-semibold text-zinc-400 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Team</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Date</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">Notes</span>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => triggerClose()}
          className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-extrabold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};
