import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight, User, ShieldCheck, History as HistoryIcon, Lock } from 'lucide-react';
import { Player } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';

interface Props {
  onSelectPlayer: (player: Player) => void;
  onOpenAddPlayer: () => void;
}

export const PlayersScreen: React.FC<Props> = ({ onSelectPlayer, onOpenAddPlayer }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [tab, setTab] = useState<'Active' | 'Inactive' | 'History'>('Active');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await api.getPlayers(tab === 'History' ? undefined : (tab as any));
      setPlayers(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, [tab]);

  const roleColors: Record<string, string> = {
    'Rusher': 'bg-rose-50 text-rose-500 border-rose-100',
    'Primary Rusher': 'bg-rose-50 text-rose-500 border-rose-100',
    '2nd Rusher': 'bg-blue-50 text-blue-500 border-blue-100',
    'Secondary Rusher': 'bg-blue-50 text-blue-500 border-blue-100',
    'Naider': 'bg-purple-50 text-purple-500 border-purple-100',
    'Assaulter': 'bg-amber-50 text-amber-600 border-amber-100',
  };

  const activeCount = players.filter((p) => p.status === 'Active').length;
  const inactiveCount = players.filter((p) => p.status === 'Inactive').length;

  return (
    <div className="min-h-full pb-28 text-left">
      {/* Top Header */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
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

        <button className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-sm flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition-transform">
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Screen Title */}
      <div className="px-5 mt-2 mb-3">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          Players
        </h1>
        <p className="text-xs font-semibold text-slate-500">
          Team members and their performance
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div className="px-5 mb-4">
        <div className="glass-pill p-1 rounded-2xl flex items-center justify-between border border-white/80 shadow-sm">
          <button
            onClick={() => setTab('Active')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'Active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            onClick={() => setTab('Inactive')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'Inactive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Inactive ({inactiveCount})
          </button>

          <button
            onClick={() => setTab('History')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'History'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Player List */}
      <div className="px-5 space-y-3.5">
        {players.length === 0 ? (
          <div className="p-8 text-center bg-white/70 rounded-3xl border border-slate-200">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700">No players found in this category.</div>
          </div>
        ) : (
          players.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p)}
              className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-white/80 shadow-soft-card cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            >
              {/* Top Row: Avatar, Name, Role badge, Join date, Chevron */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 p-0.5">
                      <img
                        src={p.avatar_url || ASSETS.avatars.ash}
                        alt={p.player_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    {p.status === 'Active' && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                        {p.player_name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${roleColors[p.team_role] || 'bg-slate-50 text-slate-600'}`}>
                        {p.team_role}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Joined {p.joined_at}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300" />
              </div>

              {/* 4-Metric Row: K/D, Avg DMG, Matches, Survival */}
              <div className="pt-2.5 border-t border-slate-100 grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-xs font-black text-slate-900">{p.kd !== undefined && p.kd !== null ? p.kd : '0.0'}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">K/D</div>
                </div>
                <div>
                  <div className="text-xs font-black text-blue-600">{p.avg_damage || 0}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Avg DMG</div>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">{p.matches_count || 0}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Matches</div>
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-600">{p.survival_rate || 0}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Survival</div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Add Player Dashed Button (Matching Screenshot Section 13) */}
        <div
          onClick={() => {
            if (!isIGL) {
              showPermissionDenied('Add Player');
              return;
            }
            onOpenAddPlayer();
          }}
          className={`p-4 rounded-3xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all active:scale-98 ${
            isIGL
              ? 'border-blue-300 bg-blue-50/40 hover:bg-blue-50/80 text-blue-600'
              : 'border-slate-300 bg-slate-50/40 hover:bg-slate-100 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isIGL ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'
            }`}>
              {isIGL ? <Plus className="w-5 h-5 stroke-[2.5]" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">
                Add Player
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                Add new player to the team (IGL Only)
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
