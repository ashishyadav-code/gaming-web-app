import React from 'react';
import { Home, Swords, Users, BarChart3, Plus, Trophy, UserPlus, Shield, LogOut } from 'lucide-react';
import { NavTab } from './BottomNav';
import { useAuth } from '../context/AuthContext';
import { ASSETS, getPlayerAvatar } from '../utils/assets';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddMatch: () => void;
  onOpenAddTournament: () => void;
  onOpenAddPlayer: () => void;
  onOpenAccount: () => void;
}

export const DesktopSidebar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenAddMatch,
  onOpenAddTournament,
  onOpenAddPlayer,
  onOpenAccount,
}) => {
  const { user, isMaster, isIGL, logoutUser } = useAuth();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'matches', label: 'Matches', icon: Swords },
    { id: 'players', label: 'Roster & Team', icon: Users },
    { id: 'insights', label: 'Performance', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0c0c11]/95 backdrop-blur-2xl border-r border-[#1a1a24] h-screen sticky top-0 z-30 select-none justify-between p-5">
      {/* Top Branding & Nav */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center p-1 bg-white/[0.05] border border-white/15 shadow-lg shadow-red-950/40">
            <img
              src={ASSETS.logo}
              alt="Team Sarkar Logo"
              className="w-full h-full object-contain filter drop-shadow hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.25em] font-black text-zinc-400 uppercase leading-none">
              Team
            </div>
            <div className="text-lg font-black tracking-tight text-white leading-tight">
              SARKAR
            </div>
            <div className="text-[9.5px] tracking-widest font-black text-red-500 uppercase leading-none">
              FF ESPORTS HUB
            </div>
          </div>
        </div>

        {/* Live DB Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB Atlas</span>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-300 uppercase">ONLINE</span>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3 mb-2">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-extrabold uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions (Command Center) */}
        <div className="space-y-2 pt-2 border-t border-[#1a1a24]">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-3 mb-1">
            Quick Actions
          </div>
          <button
            onClick={onOpenAddMatch}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 hover:text-white text-xs font-bold transition-all active:scale-98"
          >
            <Plus className="w-4 h-4 text-red-400" />
            <span>Record Match</span>
          </button>
          <button
            onClick={onOpenAddTournament}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all active:scale-98"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>New Scrim / Cup</span>
          </button>
          <button
            onClick={onOpenAddPlayer}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-zinc-400" />
            <span>Add Player</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile Section */}
      <div className="pt-4 border-t border-[#1a1a24]">
        <div
          onClick={onOpenAccount}
          className="p-2.5 rounded-2xl bg-[#141419] border border-white/10 hover:border-red-500/40 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-[#1c1c24]">
              <img
                src={getPlayerAvatar(user?.ign || 'HASHIRAMA 777')}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-white truncate flex items-center gap-1">
                <span>{user?.name || user?.userId || 'ASHISH'}</span>
                {isMaster && <Shield className="w-3 h-3 text-amber-400 fill-amber-400/20" />}
              </div>
              <div className="text-[10px] font-bold text-red-400 truncate">
                {isMaster ? 'Master IGL • Sniper' : isIGL ? 'Team IGL' : 'Squad Player'}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              logoutUser();
            }}
            title="Sign Out"
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
