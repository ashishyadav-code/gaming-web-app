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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-smooth">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center relative overflow-hidden animate-slide-up-smooth">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          IGL Permission Required
        </h3>

        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          <span className="font-semibold text-slate-700">{actionName}</span> is restricted to the team IGL or Master Admin (<span className="font-bold text-slate-800">ASHISH800</span>). Players have read-only access to match stats and analytics.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              openLoginModal();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-btn-glow hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign in as IGL / ASHISH800
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
