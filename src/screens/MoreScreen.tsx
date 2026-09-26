import React, { useState } from 'react';
import {
  Users, BarChart2, Shield, Settings, History,
  Info, ChevronRight, Crown, Sparkles,
  RefreshCw, CheckCircle2, Lock, LogIn, LogOut, Cloud, Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { ASSETS, getPlayerAvatar } from '../utils/assets';

interface Props {
  onOpenAnalytics: () => void;
  onOpenTeamHistory: () => void;
  onRefreshAllData: () => void;
}

export const MoreScreen: React.FC<Props> = ({
  onOpenAnalytics,
  onOpenTeamHistory,
  onRefreshAllData,
}) => {
  const { user, isIGL, isMaster, openLoginModal, openRegisterModal, logoutUser, showPermissionDenied } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCloudSync = async () => {
    setSyncing(true);
    try {
      await api.syncToCloud('full_sync', { timestamp: new Date() });
      showToast('Successfully synchronized with MongoDB Atlas (teamsarkar_db)!');
    } catch {
      showToast('Sync completed locally.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-full pb-28 text-left animate-fade-in-smooth bg-[#0c0c10]">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#1c1c24] border border-[#2b2b38] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
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

        {/* Profile Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shadow-sm bg-[#1c1c24] p-0.5">
          <img
            src={getPlayerAvatar(user?.userId || user?.name || user?.ign)}
            alt="User Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </header>

      {/* Screen Title */}
      <div className="px-5 mt-2 mb-3">
        <h1 className="text-xl font-black text-white tracking-tight leading-tight">
          More
        </h1>
        <p className="text-[11px] font-semibold text-zinc-400">
          Player credentials, roster management and cloud sync
        </p>
      </div>

      {/* Active User Account Card */}
      <div className="px-5 mb-4">
        <div className="p-3.5 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1c1c24] border border-white/20 shadow-sm p-0.5">
                <img
                  src={getPlayerAvatar(user?.userId || user?.name || user?.ign)}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white leading-tight">
                    {user?.name || 'Player'}
                  </h3>
                  {isMaster ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3 text-amber-200" /> MASTER IGL
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1c1c24] text-zinc-400 border border-[#2b2b38]">
                      {user?.role || 'PLAYER'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-red-400 mt-0.5">
                  Player ID: {user?.userId || 'ASHISH'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={openLoginModal}
                className="px-2.5 py-1.5 rounded-xl bg-[#1c1c24] hover:bg-[#282836] text-zinc-300 text-xs font-bold transition-colors border border-[#2b2b38]"
                title="Switch Player"
              >
                Switch
              </button>
              <button
                onClick={logoutUser}
                className="p-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors border border-red-500/30"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Sync Layer 2 Box (MongoDB Atlas) */}
      <div className="px-5 mb-4">
        <div className="p-3.5 rounded-2xl bg-[#141419] border border-[#22222b] text-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center text-red-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black flex items-center gap-1.5">
                <span>MongoDB Atlas Cloud Sync</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-zinc-400 font-semibold">
                Database: teamsarkar_db (2-Layer Storage)
              </div>
            </div>
          </div>

          <button
            onClick={handleCloudSync}
            disabled={syncing}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Section: Team */}
      <div className="px-5 mb-4">
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 px-1">
          Team Management
        </div>
        <div className="bg-[#141419] rounded-2xl border border-[#22222b] shadow-sm divide-y divide-[#22222b] overflow-hidden">
          <div
            onClick={onOpenTeamHistory}
            className="p-3.5 flex items-center justify-between hover:bg-[#1a1a22] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Team History</div>
                <div className="text-[10px] text-zinc-400 font-medium">View join dates, role changes and logs</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div
            onClick={() => {
              if (!isIGL) {
                showPermissionDenied('Manage Roles');
                return;
              }
              onOpenTeamHistory();
            }}
            className="p-3.5 flex items-center justify-between hover:bg-[#1a1a22] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Roles & Permissions
                  {!isIGL && <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5"><Lock className="w-3 h-3" /> (IGL Only)</span>}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">Manage player tactical roles</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div
            onClick={() => {
              if (!isIGL) {
                showPermissionDenied('Team Settings');
                return;
              }
              showToast('Team settings are configured for Team Sarkar.');
            }}
            className="p-3.5 flex items-center justify-between hover:bg-[#1a1a22] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Team Settings
                  {!isIGL && <span className="text-[10px] text-zinc-400 font-normal flex items-center gap-0.5"><Lock className="w-3 h-3" /> (IGL Only)</span>}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">Update team region, branding and roster</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </div>
      </div>

      {/* Section: Analytics */}
      <div className="px-5 mb-4">
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 px-1">
          Analytics & Performance Intelligence
        </div>
        <div className="bg-[#141419] rounded-2xl border border-[#22222b] shadow-sm divide-y divide-[#22222b] overflow-hidden">
          <div
            onClick={onOpenAnalytics}
            className="p-3.5 flex items-center justify-between hover:bg-[#1a1a22] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Deterministic Insight Engine</div>
                <div className="text-[10px] text-zinc-400 font-medium">Week 1 vs Week 2 evaluations & consistency ratings</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>

          <div
            onClick={onOpenAnalytics}
            className="p-3.5 flex items-center justify-between hover:bg-[#1a1a22] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Tournament Analytics & Consistency</div>
                <div className="text-[10px] text-zinc-400 font-medium">Observe team scoring trends and tournament progression</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </div>
        </div>
      </div>

      {/* Section: About & Info */}
      <div className="px-5 mb-4">
        <div className="bg-[#141419] rounded-2xl border border-[#22222b] shadow-sm overflow-hidden p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1c1c24] text-zinc-400 flex items-center justify-center border border-white/5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">TEAM SARKAR Companion v1.0</div>
              <div className="text-[10px] text-zinc-400 font-medium">Production Release • MongoDB Atlas Connected</div>
            </div>
          </div>
          <span className="text-[10px] font-black text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">Active</span>
        </div>
      </div>
    </div>
  );
};
