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
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center p-0.5 bg-[#14141a] border border-white/10">
          <img
            src={ASSETS.logo}
            alt="Team Sarkar Logo"
            className="w-full h-full object-contain filter drop-shadow"
          />
        </div>
        <div>
          <div className="text-[10px] tracking-[0.2em] font-black text-zinc-400 uppercase leading-none">
            Team
          </div>
          <div className="text-base font-black tracking-tight text-white leading-tight">
            SARKAR
          </div>
          <div className="text-[9px] tracking-widest font-bold text-red-500 uppercase leading-none">
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
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                : isIGL
                ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                : 'bg-[#181822] text-zinc-300 border border-[#2b2b3a] hover:bg-[#222230]'
            }`}
          >
            {isMaster ? (
              <>
                <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-500/20" />
                <span className="font-extrabold text-[11px]">{user?.userId === 'ASHISH800' ? 'ASHISH' : (user?.userId || 'ASHISH')}</span>
              </>
            ) : isIGL ? (
              <>
                <Shield className="w-3.5 h-3.5 text-red-400 fill-red-500/20" />
                <span>IGL</span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>{user?.userId || 'Sign In'}</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onSearchClick}
          className="w-9 h-9 rounded-full bg-[#15151c] border border-white/10 shadow-sm flex items-center justify-center text-zinc-300 hover:bg-[#202029] active:scale-95 transition-transform"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onNotificationsClick}
          className="w-9 h-9 rounded-full bg-[#15151c] border border-white/10 shadow-sm flex items-center justify-center text-zinc-300 relative hover:bg-[#202029] active:scale-95 transition-transform"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#15151c] animate-pulse" />
        </button>
      </div>
    </header>
  );
};
