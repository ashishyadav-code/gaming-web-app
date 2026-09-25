import React from 'react';
import { Search, Bell, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';

interface Props {
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onUserClick?: () => void;
  showRoleToggle?: boolean;
}

export const Header: React.FC<Props> = ({ onSearchClick, onNotificationsClick, onUserClick, showRoleToggle = true }) => {
  const { isIGL, isMaster, user, openLoginModal } = useAuth();

  return (
    <header className="px-5 pt-4 pb-2 flex items-center justify-between relative z-20">
      {/* Brand Logo & Name */}
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

      {/* Right Actions & User Badge */}
      <div className="flex items-center gap-2">
        {showRoleToggle && (
          <button
            onClick={onUserClick || openLoginModal}
            title="Click to view profile, switch player or sign out"
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isMaster
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                : isIGL
                ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isMaster ? (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
                <span className="font-extrabold text-[11px]">{user?.userId || 'ASHISH'}</span>
              </>
            ) : isIGL ? (
              <>
                <Shield className="w-3.5 h-3.5 text-blue-600 fill-blue-600/20" />
                <span>IGL</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.userId || 'Sign In'}</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onSearchClick}
          className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition-transform"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onNotificationsClick}
          className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-slate-600 relative hover:bg-white active:scale-95 transition-transform"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        </button>
      </div>
    </header>
  );
};
