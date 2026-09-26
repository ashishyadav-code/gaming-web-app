import React from 'react';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export const PermissionModal: React.FC<Props> = ({ isOpen, onClose, actionName = 'This action' }) => {
  const { openLoginModal } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-smooth">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#22222b] text-center relative overflow-hidden animate-slide-up-smooth">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-white mb-1.5">
          IGL Permission Required
        </h3>

        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          <span className="font-bold text-white">{actionName}</span> is restricted to the team IGL or Master Admin (<span className="font-bold text-red-400">ASHISH</span> / <span className="font-bold text-red-400">HASHIRAMA 777</span>). Players have read-only access to match stats and telemetry.
        </p>

        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              openLoginModal();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            Sign in as IGL / ASHISH
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl bg-[#1c1c24] hover:bg-[#282836] text-zinc-400 hover:text-white font-bold text-xs transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
