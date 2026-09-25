import React, { useState, useEffect } from 'react';
import { X, History, Calendar, ShieldCheck, User } from 'lucide-react';
import { Player } from '../types';
import { api } from '../api/client';
import { ASSETS } from '../utils/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamHistoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getPlayers()
        .then((data) => {
          setPlayers(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[32px] p-5 max-w-md w-full shadow-2xl border border-slate-100 text-left relative my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600">
                Audit Trail
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Team Sarkar History
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div className="font-bold text-slate-800">Team Founded</div>
            <div className="text-slate-500 mt-0.5">18 Sept 2026 • Free Fire South Asia Competitive Division</div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 px-1">
              Roster & Role Evolution Logs
            </h3>

            <div className="space-y-3">
              {players.map((p) => (
                <div key={p.id} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border">
                        <img src={p.avatar_url || ASSETS.avatars.ash} alt={p.player_name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-extrabold text-slate-900">{p.player_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Joined {p.joined_at}
                    </span>
                  </div>

                  {/* Role history list */}
                  <div className="space-y-1.5 pl-3 border-l-2 border-blue-200 ml-3">
                    {p.role_history && p.role_history.length > 0 ? (
                      p.role_history.map((rh, i) => (
                        <div key={i} className="text-[11px]">
                          <div className="font-bold text-slate-800">
                            {rh.role} <span className="text-[10px] text-slate-400 font-normal">({rh.started_at} {rh.ended_at ? `– ${rh.ended_at}` : '– Active'})</span>
                          </div>
                          {rh.notes && <div className="text-[10px] text-slate-500">{rh.notes}</div>}
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-600 font-medium">
                        {p.team_role} since {p.joined_at}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
