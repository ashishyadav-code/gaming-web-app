import React, { useState } from 'react';
import { X, ShieldCheck, Check, ShieldAlert } from 'lucide-react';
import { Player } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSuccess: () => void;
}

export const ChangeRoleModal: React.FC<Props> = ({ isOpen, onClose, player, onSuccess }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [newRole, setNewRole] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !player) return null;

  const roles = [
    'Primary Rusher',
    'Secondary Rusher',
    'Rusher',
    '2nd Rusher',
    'Naider',
    'Assaulter',
    'Sniper',
    'Support',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIGL) {
      showPermissionDenied('Change Player Role');
      return;
    }

    if (!newRole || newRole === player.team_role) {
      setErrorMsg('Please select a different role.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.updatePlayerRole(player.id, newRole, reason.trim() || undefined);
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to update player role.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#22222b] text-left relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                IGL Authority
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Update Player Role
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          <div className="p-3 bg-[#1c1c24] rounded-xl border border-[#2b2b38] text-xs">
            <div className="text-[10px] text-zinc-500 font-bold uppercase">Target Player</div>
            <div className="font-extrabold text-white text-sm mt-0.5">{player.player_name}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Current Role: <span className="font-bold text-red-400">{player.team_role}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">New Assigned Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">-- Choose New Role --</option>
              {roles.map((r) => (
                <option key={r} value={r} disabled={r === player.team_role}>
                  {r} {r === player.team_role ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Reason for Role Change</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Swapped to sniper for Kalahari high ground strat."
              className="w-full p-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-medium text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'Updating...' : 'Confirm Role Evolution'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
