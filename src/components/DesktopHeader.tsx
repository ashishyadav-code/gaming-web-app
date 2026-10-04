import React from 'react';
import { Calendar, Bell, Search, Shield, User as UserIcon } from 'lucide-react';
import { NavTab } from './BottomNav';
import { useAuth } from '../context/AuthContext';
import { getTodayDateString } from '../utils/dateUtils';

interface Props {
  activeTab: NavTab;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onOpenAccount: () => void;
}

export const DesktopHeader: React.FC<Props> = ({
  activeTab,
  onSearchClick,
  onNotificationsClick,
  onOpenAccount,
}) => {
  const { user, isMaster, isIGL, openLoginModal } = useAuth();

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    home: { title: 'COMMAND CENTER', subtitle: 'Live Scrims Standings & Team Telemetry' },
    matches: { title: 'TOURNAMENT MATCHES', subtitle: 'Detailed Match Logs & Scoring Breakdowns' },
    players: { title: 'SQUAD ROSTER', subtitle: 'Active Lineup, Player Roles & Combat Stats' },
    insights: { title: 'COMBAT TELEMETRY', subtitle: 'Performance Analytics & Performance Curve' },
  };

  const current = titles[activeTab] || titles.home;

  return (
    <header className="hidden md:flex items-center justify-between px-8 py-3.5 border-b border-white/10 glass-panel sticky top-0 z-20 shadow-xl">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-base font-black text-white tracking-wider uppercase leading-tight">
          {current.title}
        </h1>
        <p className="text-[11px] font-semibold text-zinc-400 leading-none mt-0.5">
          {current.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card border border-white/15 text-xs font-bold text-zinc-300 shadow-md">
          <Calendar className="w-3.5 h-3.5 text-red-500" />
          <span>{getTodayDateString()}</span>
        </div>

        {/* Search */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-btn border border-white/15 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/35 transition-all shadow-md active:scale-95"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span>Search...</span>
        </button>

        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="w-9 h-9 rounded-xl glass-btn border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white hover:border-red-500/50 relative transition-all shadow-md active:scale-95"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-black/60 animate-pulse" />
        </button>

        {/* User Badge */}
        <button
          onClick={onOpenAccount || openLoginModal}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all glass-btn shadow-md active:scale-95 ${
            isMaster
              ? 'border-amber-500/40 text-amber-300 hover:border-amber-400'
              : isIGL
              ? 'border-red-500/40 text-red-300 hover:border-red-400'
              : 'border-white/15 text-zinc-300 hover:border-white/30'
          }`}
        >
          {isMaster ? (
            <>
              <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-500/20" />
              <span>{user?.name || user?.userId || 'ASHISH'} (IGL)</span>
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
      </div>
    </header>
  );
};
