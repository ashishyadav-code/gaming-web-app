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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/40 backdrop-blur-sm animate-fade-in-smooth">
      {/* Tap backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet Card with Spring Slide-up Animation */}
      <div className="bg-white/95 backdrop-blur-xl rounded-t-[36px] p-6 max-w-md w-full mx-auto shadow-2xl border-t border-white/80 pb-8 animate-slide-up-smooth relative">
        {/* Pull bar handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="mb-5 text-left">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Add New
          </h2>
          <p className="text-sm font-medium text-slate-500">
            What do you want to add?
          </p>
        </div>

        {/* 2x2 Action Tiles Grid */}
        <div className="grid grid-cols-2 gap-3.5 mb-6">
          {/* 1. Add Practice */}
          <div
            onClick={() => handleAction('practice', 'Add Practice')}
            className={`p-3.5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
              isIGL
                ? 'bg-blue-50/50 hover:bg-blue-50/90 border-blue-100 hover:border-blue-200 active:scale-95 shadow-sm'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                  <Gamepad2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    <Lock className="w-3 h-3" /> IGL Only
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">
                Add Practice
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                Record a practice match with team stats.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">🗺 Map</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">⚔ Kills</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">🏆 Rank</span>
            </div>
          </div>

          {/* 2. Add Tournament */}
          <div
            onClick={() => handleAction('tournament', 'Add Tournament')}
            className={`p-3.5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
              isIGL
                ? 'bg-amber-50/50 hover:bg-amber-50/90 border-amber-100 hover:border-amber-200 active:scale-95 shadow-sm'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                  <Trophy className="w-6 h-6 stroke-[2.2]" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    <Lock className="w-3 h-3" /> IGL Only
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">
                Add Tournament
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                Create a new tournament and add matches.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">📄 Name</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">📅 Date</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">🏆 Cup</span>
            </div>
          </div>

          {/* 3. Add Player */}
          <div
            onClick={() => handleAction('player', 'Add Player')}
            className={`p-3.5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
              isIGL
                ? 'bg-purple-50/50 hover:bg-purple-50/90 border-purple-100 hover:border-purple-200 active:scale-95 shadow-sm'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                  <Users className="w-6 h-6 stroke-[2.2]" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-purple-500" />
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    <Lock className="w-3 h-3" /> IGL Only
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">
                Add Player
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                Add new player to the team with role.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">👤 Name</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">🛡 Role</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">📅 Date</span>
            </div>
          </div>

          {/* 4. Add Note */}
          <div
            onClick={() => handleAction('note', 'Add Note')}
            className={`p-3.5 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
              isIGL
                ? 'bg-emerald-50/50 hover:bg-emerald-50/90 border-emerald-100 hover:border-emerald-200 active:scale-95 shadow-sm'
                : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <FileText className="w-6 h-6 stroke-[2.2]" />
                </div>
                {isIGL ? (
                  <ChevronRight className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    <Lock className="w-3 h-3" /> IGL Only
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">
                Add Note
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                Add team note, strategy or important update.
              </p>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-500 pt-1">
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">👥 Team</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">📅 Today</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-100">💬 Note</span>
            </div>
          </div>
        </div>

        {/* Quick Direct Add Match */}
        <div className="mb-6">
          <button
            onClick={() => handleAction('match', 'Add Match')}
            className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
              isIGL
                ? 'bg-blue-600 text-white border-blue-500 shadow-btn-glow hover:bg-blue-700'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Quick Match Entry (Fast IGL Logging)
            </span>
            {isIGL ? <span>+ Add Match &rarr;</span> : <span className="flex items-center gap-1 text-[10px]"><Lock className="w-3 h-3" /> IGL Only</span>}
          </button>
        </div>

        {/* Circular Blue Close Button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-transform active:scale-90 shadow-sm"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
