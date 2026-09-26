import React from 'react';
import { X, History } from 'lucide-react';
import { Player } from '../types';
import { getPlayerAvatar } from '../utils/assets';

import { api } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  players?: Player[];
}

export const TeamHistoryModal: React.FC<Props> = ({ isOpen, onClose, players: initialPlayers }) => {
  const [players, setPlayers] = React.useState<Player[]>(initialPlayers || []);

  React.useEffect(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      setPlayers(initialPlayers);
    } else if (isOpen) {
      api.getPlayers().then(setPlayers).catch(() => {});
    }
  }, [isOpen, initialPlayers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-md w-full shadow-2xl border border-[#22222b] text-left relative my-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                Official Records
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Team Sarkar History
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-[#2b2b38] text-xs">
            <div className="font-bold text-white">Team Founded</div>
            <div className="text-zinc-400 mt-0.5">18 Sept 2026 • Free Fire South Asia Competitive Division</div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2 px-1">
              Roster & Role Evolution Logs
            </h3>

            <div className="space-y-2.5">
              {players.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-[#1c1c24] border border-[#2b2b38] shadow-sm text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-[#141419] border border-white/15">
                        <img src={getPlayerAvatar(p.player_name || p.team_role || p.avatar_url)} alt={p.player_name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-extrabold text-white">{p.player_name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      Joined {p.joined_at}
                    </span>
                  </div>

                  {/* Role history list */}
                  <div className="space-y-1.5 pl-3 border-l-2 border-red-500/40 ml-3">
                    {p.role_history && p.role_history.length > 0 ? (
                      p.role_history.map((rh, i) => (
                        <div key={i} className="text-[11px]">
                          <div className="font-bold text-zinc-200">
                            {rh.role} <span className="text-[10px] text-zinc-400 font-normal">({rh.started_at} {rh.ended_at ? `– ${rh.ended_at}` : '– Active'})</span>
                          </div>
                          {rh.notes && <div className="text-[10px] text-zinc-400">{rh.notes}</div>}
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-zinc-400 font-medium">
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
