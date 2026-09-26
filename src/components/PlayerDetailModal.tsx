import React, { useState, useEffect } from 'react';
import { X, Activity, History, Swords } from 'lucide-react';
import { Player, PlayerProgressDetail } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getPlayerAvatar } from '../utils/assets';

interface Props {
  player: Player | null;
  onClose: () => void;
  onOpenChangeRole: (player: Player) => void;
}

export const PlayerDetailModal: React.FC<Props> = ({ player, onClose, onOpenChangeRole }) => {
  const { isIGL } = useAuth();
  const [detail, setDetail] = useState<PlayerProgressDetail | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    if (player) {
      setLoading(true);
      api.getPlayerDetail(player.id)
        .then((data) => {
          setDetail(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [player]);

  if (!player) return null;

  const roleColors: Record<string, string> = {
    'Rusher': 'bg-red-500/15 text-red-400 border-red-500/30',
    'Primary Rusher': 'bg-red-500/15 text-red-400 border-red-500/30',
    '2nd Rusher': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Secondary Rusher': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'Naider': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'Assaulter': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Sniper': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in-smooth overflow-y-auto">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#22222b] text-left relative my-6 max-h-[92vh] overflow-y-auto animate-slide-up-smooth">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-3.5 mb-4 pt-1">
          <div className="relative">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-md bg-[#1c1c24]">
              <img
                src={getPlayerAvatar(player.player_name || player.team_role || player.avatar_url)}
                alt={player.player_name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#141419]" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                {player.player_name}
              </h2>
              {player.ign && (
                <span className="text-[10px] font-bold text-zinc-400 bg-[#1c1c24] border border-[#2b2b38] px-1.5 py-0.5 rounded">
                  {player.ign}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${roleColors[player.team_role] || 'bg-[#1c1c24] text-zinc-400'}`}>
                {player.team_role}
              </span>

              {isIGL ? (
                <button
                  onClick={() => onOpenChangeRole(player)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 underline"
                >
                  Change Role &rarr;
                </button>
              ) : (
                <span className="text-[10px] text-zinc-500 font-semibold">
                  (IGL Assigned)
                </span>
              )}
            </div>

            <div className="text-[10px] text-zinc-500 font-medium mt-1">
              Joined {player.joined_at} • {player.matches_count} Matches
            </div>
          </div>
        </div>

        {/* Core Performance Grid (Damage and Survival removed) */}
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          <div className="p-2 rounded-xl bg-[#1c1c24] border border-[#2b2b38] text-center">
            <div className="text-sm font-black text-red-500">{player.total_kills || 0}</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase">Total Kills</div>
          </div>
          <div className="p-2 rounded-xl bg-[#1c1c24] border border-[#2b2b38] text-center">
            <div className="text-sm font-black text-zinc-200">{player.matches_count || 0}</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase">Matches</div>
          </div>
          <div className="p-2 rounded-xl bg-[#1c1c24] border border-[#2b2b38] text-center">
            <div className="text-sm font-black text-amber-400">{player.kd !== undefined && player.kd !== null ? player.kd : '0.0'}</div>
            <div className="text-[9px] font-bold text-zinc-500 uppercase">K/D</div>
          </div>
        </div>

        {/* Progress Comparison Card */}
        {detail && (
          detail.recent_match_performances && detail.recent_match_performances.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-[#1a1215] border border-red-500/20 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  Performance Progress (7D vs Prev 7D)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                  (detail.kills_change_pct || 0) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {(detail.kills_change_pct || 0) >= 0 ? `+${detail.kills_change_pct || 0}%` : `${detail.kills_change_pct || 0}%`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[9px] font-bold text-zinc-500 uppercase">Fragging Shift</div>
                  <div className="font-black text-white text-xs">
                    {detail.prev_seven_day_avg_kills || 0} &rarr; {detail.seven_day_avg_kills || 0}
                  </div>
                  <div className="text-[9px] text-zinc-400 font-semibold">
                    Avg Kills per match
                  </div>
                </div>

                <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[9px] font-bold text-zinc-500 uppercase">Consistency Rating</div>
                  <div className="font-black text-white text-xs">
                    {detail.consistency_score || 0}%
                  </div>
                  <div className="text-[9px] text-red-400 font-bold">
                    {detail.variance_rating || 'N/A'}
                  </div>
                </div>
              </div>

              {detail.observations && detail.observations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                  {detail.observations.map((obs, i) => (
                    <p key={i} className="text-[10px] font-medium text-zinc-300 leading-snug">
                      • {obs}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#1c1c24] border border-[#2b2b38] mb-3.5 text-center">
              <p className="text-xs font-bold text-zinc-400">No match records logged for this player</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Combat telemetry will activate once matches are played</p>
            </div>
          )
        )}

        {/* Role History Timeline */}
        <div className="mb-3.5">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Role Evolution & History
            </h3>
          </div>

          <div className="p-3 bg-[#1c1c24] rounded-xl border border-[#2b2b38] space-y-2">
            {player.role_history && player.role_history.length > 0 ? (
              player.role_history.map((rh, idx) => (
                <div key={rh.id || idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{rh.role}</span>
                      <span className="text-[9px] text-zinc-500 font-semibold">
                        {rh.started_at} {rh.ended_at ? `– ${rh.ended_at}` : '– Present'}
                      </span>
                    </div>
                    {rh.notes && (
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                        {rh.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-zinc-500 text-center py-1">
                {player.team_role} since {player.joined_at}
              </div>
            )}
          </div>
        </div>

        {/* Recent Matches Table */}
        {detail && detail.recent_match_performances.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 px-1">
              Recent Matches
            </h3>
            <div className="space-y-1.5">
              {detail.recent_match_performances.slice(0, 4).map((m, i) => (
                <div key={i} className="p-2 rounded-xl bg-[#1c1c24] border border-[#2b2b38] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      m.placement === 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-[#252532] text-zinc-300'
                    }`}>
                      #{m.placement}
                    </span>
                    <span className="font-extrabold text-white">{m.map}</span>
                    <span className="text-[9px] text-zinc-500">({m.type})</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-red-400 flex items-center gap-1 font-black">
                      <Swords className="w-3.5 h-3.5 text-red-500" />
                      {m.kills} Kills
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
