import React, { useState } from 'react';
import { X, Users, Check, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPlayerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [playerName, setPlayerName] = useState('');
  const [ign, setIgn] = useState('');
  const [teamRole, setTeamRole] = useState('Rusher');
  const [joinedAt, setJoinedAt] = useState('25 Sept 2026');
  const [avatarUrl, setAvatarUrl] = useState(ASSETS.avatars.ash);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIGL) {
      showPermissionDenied('Add Player');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createPlayer({
        player_name: playerName.trim().toUpperCase(),
        ign: ign.trim() || `SRK•${playerName.trim().toUpperCase()}`,
        team_role: teamRole,
        joined_at: joinedAt,
        avatar_url: avatarUrl,
        status: 'Active',
      });
      setIsSubmitting(false);
      setPlayerName('');
      setIgn('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to add player.');
    }
  };

  const roles = [
    'Rusher',
    '2nd Rusher',
    'Naider',
    'Assaulter',
    'Sniper',
    'Support',
  ];

  const avatars = [
    { label: 'Red / Ash', url: ASSETS.avatars.ash },
    { label: 'Blue / Kai', url: ASSETS.avatars.kai },
    { label: 'Purple / Vex', url: ASSETS.avatars.vex },
    { label: 'Yellow / Zoro', url: ASSETS.avatars.zoro },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-left relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
                IGL Roster Management
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Add Team Member
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Player Callout Name</label>
            <input
              type="text"
              required
              placeholder="e.g. SHADOW"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">In-Game Name (IGN)</label>
            <input
              type="text"
              placeholder="e.g. SRK•SHADOW⚡"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Tactical Role</label>
            <select
              value={teamRole}
              onChange={(e) => setTeamRole(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Avatar Aura</label>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av.url}
                  onClick={() => setAvatarUrl(av.url)}
                  className={`p-1 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    avatarUrl === av.url ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/20' : 'border-slate-200'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-10 h-10 rounded-full object-cover" />
                  <span className="text-[9px] font-bold text-slate-600 truncate max-w-full">
                    {av.label.split('/')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Join Date</label>
            <input
              type="text"
              required
              value={joinedAt}
              onChange={(e) => setJoinedAt(e.target.value)}
              className="w-full py-2 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none text-center"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Add to Roster</span>
          </button>
        </form>
      </div>
    </div>
  );
};
