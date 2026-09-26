import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight, User, Lock } from 'lucide-react';
import { Player } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS, getPlayerAvatar } from '../utils/assets';

interface Props {
  onSelectPlayer: (player: Player) => void;
  onOpenAddPlayer: () => void;
}

export const PlayersScreen: React.FC<Props> = ({ onSelectPlayer, onOpenAddPlayer }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [tab, setTab] = useState<'Active' | 'Inactive' | 'History'>('Active');
  const [players, setPlayers] = useState<Player[]>([]);
  const [, setLoading] = useState(true);

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
    'Rusher': 'bg-red-500/15 text-red-400 border-red-500/30',
    'Primary Rusher': 'bg-red-500/15 text-red-400 border-red-500/30',
    '2nd Rusher': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Secondary Rusher': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Naider': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'Assaulter': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Sniper': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };

  const activeCount = players.filter((p) => p.status === 'Active').length;
  const inactiveCount = players.filter((p) => p.status === 'Inactive').length;

  return (
    <div className="min-h-full pb-28 text-left bg-[#0c0c10]">
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

        <button className="w-9 h-9 rounded-full bg-[#15151c] border border-white/10 shadow-sm flex items-center justify-center text-zinc-300 hover:bg-[#202029] active:scale-95 transition-transform">
          <Search className="w-4 h-4" />
        </button>
      </header>

      {/* Screen Title */}
      <div className="px-5 mt-2 mb-3">
        <h1 className="text-xl font-black text-white tracking-tight leading-tight">
          Players
        </h1>
        <p className="text-[11px] font-semibold text-zinc-400">
          Official squad roster and combat metrics
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div className="px-5 mb-4">
        <div className="p-1 rounded-2xl flex items-center justify-between bg-[#141419] border border-[#22222b] shadow-sm">
          <button
            onClick={() => setTab('Active')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'Active'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            onClick={() => setTab('Inactive')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'Inactive'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Inactive ({inactiveCount})
          </button>

          <button
            onClick={() => setTab('History')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'History'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Player List */}
      <div className="px-5 space-y-3">
        {players.length === 0 ? (
          <div className="p-8 text-center bg-[#141419] rounded-2xl border border-[#22222b]">
            <User className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-zinc-300">No players found in this category.</div>
          </div>
        ) : (
          players.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p)}
              className="p-3.5 rounded-2xl bg-[#141419] border border-[#22222b] shadow-sm cursor-pointer hover:border-red-500/35 transition-all active:scale-[0.99]"
            >
              {/* Top Row: Avatar, Name, Role badge, Join date, Chevron */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-sm bg-[#1c1c24] p-0.5">
                      <img
                        src={getPlayerAvatar(p.player_name || p.team_role || p.avatar_url)}
                        alt={p.player_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    {p.status === 'Active' && (
                      <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#141419]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black text-white tracking-tight leading-tight">
                        {p.player_name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${roleColors[p.team_role] || 'bg-[#1c1c24] text-zinc-400 border-[#2a2a38]'}`}>
                        {p.team_role}
                      </span>
                    </div>
                    <div className="text-[10px] font-medium text-zinc-500 mt-0.5">
                      Joined {p.joined_at}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>

              {/* 3-Metric Clean Row (Damage and Survival removed) */}
              <div className="pt-2 border-t border-[#22222b] grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs font-black text-red-500">{p.total_kills || 0}</div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase">Kills</div>
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-200">{p.matches_count || 0}</div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase">Matches</div>
                </div>
                <div>
                  <div className="text-xs font-black text-amber-400">{p.kd !== undefined && p.kd !== null ? p.kd : '0.0'}</div>
                  <div className="text-[9px] font-bold text-zinc-500 uppercase">K/D</div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Add Player Dashed Button */}
        <div
          onClick={() => {
            if (!isIGL) {
              showPermissionDenied('Add Player');
              return;
            }
            onOpenAddPlayer();
          }}
          className={`p-3.5 rounded-2xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all active:scale-98 ${
            isIGL
              ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400'
              : 'border-[#22222b] bg-[#141419]/50 hover:bg-[#141419] text-zinc-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isIGL ? 'bg-red-500/20 text-red-400' : 'bg-[#1c1c24] text-zinc-500'
            }`}>
              {isIGL ? <Plus className="w-4 h-4 stroke-[2.5]" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">
                Add Player
              </div>
              <div className="text-[10px] font-semibold text-zinc-500">
                Add new player to the team (IGL Only)
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </div>
      </div>
    </div>
  );
};
