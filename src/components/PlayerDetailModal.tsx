import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus, ShieldCheck, History, Activity, Calendar, ShieldAlert } from 'lucide-react';
import { Player, PlayerProgressDetail } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';

interface Props {
  player: Player | null;
  onClose: () => void;
  onOpenChangeRole: (player: Player) => void;
}

export const PlayerDetailModal: React.FC<Props> = ({ player, onClose, onOpenChangeRole }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [detail, setDetail] = useState<PlayerProgressDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
    'Rusher': 'bg-rose-50 text-rose-600 border-rose-200',
    'Primary Rusher': 'bg-rose-50 text-rose-600 border-rose-200',
    '2nd Rusher': 'bg-blue-50 text-blue-600 border-blue-200',
    'Secondary Rusher': 'bg-blue-50 text-blue-600 border-blue-200',
    'Naider': 'bg-purple-50 text-purple-600 border-purple-200',
    'Assaulter': 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[32px] p-5 max-w-md w-full shadow-2xl border border-slate-100 text-left relative my-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-4 pt-1">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-100">
              <img
                src={player.avatar_url || ASSETS.avatars.ash}
                alt={player.player_name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {player.player_name}
              </h2>
              {player.ign && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {player.ign}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${roleColors[player.team_role] || 'bg-slate-100 text-slate-600'}`}>
                {player.team_role}
              </span>

              {isIGL ? (
                <button
                  onClick={() => onOpenChangeRole(player)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                >
                  Change Role &rarr;
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold">
                  (IGL Assigned)
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-medium mt-1">
              Joined {player.joined_at} • {player.matches_count} Matches
            </div>
          </div>
        </div>

        {/* Core Performance Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-base font-black text-slate-900">{player.kd !== undefined && player.kd !== null ? player.kd : '0.0'}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">K/D</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-base font-black text-blue-600">{player.avg_damage || 0}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Avg DMG</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-base font-black text-slate-900">{player.total_kills || 0}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Kills</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="text-base font-black text-emerald-600">{player.survival_rate || 0}%</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Survival</div>
          </div>
        </div>

        {/* Progress Comparison Card (Section 14 & 21) */}
        {detail && (
          detail.recent_match_performances && detail.recent_match_performances.length > 0 ? (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Performance Progress (7D vs Prev 7D)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  (detail.damage_change_pct || 0) >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {(detail.damage_change_pct || 0) >= 0 ? `+${detail.damage_change_pct || 0}%` : `${detail.damage_change_pct || 0}%`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2 bg-white/80 rounded-2xl border border-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Damage Shift</div>
                  <div className="font-black text-slate-800 text-sm">
                    {detail.prev_seven_day_avg_damage || 0} &rarr; {detail.seven_day_avg_damage || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Avg DMG per match
                  </div>
                </div>

                <div className="p-2 bg-white/80 rounded-2xl border border-white">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Consistency Rating</div>
                  <div className="font-black text-slate-800 text-sm">
                    {detail.consistency_score || 0}%
                  </div>
                  <div className="text-[10px] text-blue-600 font-bold">
                    {detail.variance_rating || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Observations bullet list */}
              {detail.observations && detail.observations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-blue-200/50 space-y-1">
                  {detail.observations.map((obs, i) => (
                    <p key={i} className="text-[11px] font-medium text-slate-700 leading-snug">
                      • {obs}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 mb-4 text-center">
              <p className="text-xs font-bold text-slate-500">No match records logged for this player</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Combat telemetry will activate once matches are played</p>
            </div>
          )
        )}

        {/* Role History Timeline (Section 15) */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Role Evolution & History
            </h3>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
            {player.role_history && player.role_history.length > 0 ? (
              player.role_history.map((rh, idx) => (
                <div key={rh.id || idx} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rh.role}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {rh.started_at} {rh.ended_at ? `– ${rh.ended_at}` : '– Present'}
                      </span>
                    </div>
                    {rh.notes && (
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {rh.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-1">
                {player.team_role} since {player.joined_at}
              </div>
            )}
          </div>
        </div>

        {/* Recent Matches Table */}
        {detail && detail.recent_match_performances.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 px-1">
              Recent Matches
            </h3>
            <div className="space-y-1.5">
              {detail.recent_match_performances.slice(0, 4).map((m, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      m.placement === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      #{m.placement}
                    </span>
                    <span className="font-extrabold text-slate-800">{m.map}</span>
                    <span className="text-[10px] text-slate-400">({m.type})</span>
                  </div>
                  <div className="flex items-center gap-3 font-semibold text-slate-700">
                    <span>⚔ {m.kills} K</span>
                    <span className="text-blue-600">🔥 {m.damage} DMG</span>
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
