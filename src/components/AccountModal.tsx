import React, { useState, useEffect } from 'react';
import { X, Shield, LogOut, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPlayerAvatar } from '../utils/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const AccountModal: React.FC<Props> = ({ isOpen, onClose, onOpenLogin }) => {
  const { user, isIGL, isMaster, logoutUser } = useAuth();
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
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !shouldRender) return null;

  const triggerClose = (afterClose?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      if (afterClose) afterClose();
    }, 200);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}>
      <div className={`glass-sheet rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-white/10 text-left relative overflow-hidden transition-all ${isClosing ? 'animate-fade-out-smooth' : 'animate-slide-up-smooth'}`}>
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider block leading-none">
                Player Account
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Profile & Access
              </h2>
            </div>
          </div>
          <button
            onClick={() => triggerClose()}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Card */}
        <div className="my-4 p-3.5 rounded-2xl glass-card border border-white/10 flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-sm bg-[#121217] flex-shrink-0">
            <img
              src={getPlayerAvatar(user?.userId || user?.name || user?.ign)}
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white truncate">
                {user?.userId || 'ASHISH'}
              </h3>
              {isMaster && (
                <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  MASTER IGL
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 font-medium truncate">
              {user?.email || 'ashish@teamsarkar.com'}
            </p>
            <div className="text-[10px] font-bold text-red-400 mt-0.5">
              Role: {isIGL ? 'IGL (Full Admin Access)' : 'Player (View Only)'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-4 relative z-10">
          <button
            type="button"
            onClick={() => triggerClose(() => onOpenLogin())}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md shadow-red-950/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Player / Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              logoutUser();
              triggerClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-400 font-extrabold text-xs border border-red-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Footer with App Version */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-bold relative z-10">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Connected to Render DB
          </span>
          <span className="text-[10px] font-mono text-zinc-500">v2.0-esports</span>
        </div>
      </div>
    </div>
  );
};
