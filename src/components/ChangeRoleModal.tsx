import React, { useState } from 'react';
import { X, ShieldCheck, Check, History, ShieldAlert } from 'lucide-react';
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
    'Sniper / Support',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-left relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                IGL Role Reassignment
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Change Role: {player.player_name}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
          <History className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
          <div>
            <span className="font-bold">Historical Audit Preserved: </span>
            The current role ({player.team_role}) will be archived with effective dates so historical match records remain consistent.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Active Role</label>
            <div className="py-2 px-3 rounded-2xl bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
              {player.team_role}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Assigned Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              required
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            <label className="text-xs font-bold text-slate-700 block mb-1">Reason / Tactical Adjustment Note</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Swapped to Primary Rusher for compound assault pacing."
              className="w-full p-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newRole}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-btn-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Update Role & Log History</span>
          </button>
        </form>
      </div>
    </div>
  );
};
