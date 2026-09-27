import React, { useState, useEffect } from 'react';
import { X, Users, Check, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ASSETS } from '../utils/assets';
import { getTodayDateString } from '../utils/dateUtils';

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
  const [joinedAt, setJoinedAt] = useState(() => getTodayDateString());
  const [avatarUrl, setAvatarUrl] = useState(ASSETS.avatars.hashirama);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setJoinedAt(getTodayDateString());
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !shouldRender) return null;

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

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
      triggerClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to add player.');
    }
  };

  const roles = [
    'Rusher',
    'Primary Rusher',
    '2nd Rusher',
    'Naider',
    'Assaulter',
    'Sniper',
    'Support',
  ];

  const avatars = [
    { label: 'Itachi', url: ASSETS.avatars.itachi },
    { label: 'Tufan', url: ASSETS.avatars.tufan },
    { label: 'Pandit', url: ASSETS.avatars.pandit },
    { label: 'Hashirama', url: ASSETS.avatars.hashirama },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto ${isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}>
      <div className={`glass-sheet rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-white/10 text-left relative max-h-[92vh] overflow-y-auto transition-all ${isClosing ? 'animate-fade-out-smooth' : 'animate-slide-up-smooth'}`}>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                Squad Roster
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Add Team Player
              </h2>
            </div>
          </div>
          <button
            onClick={triggerClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Player Real / Official Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ITACHI"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              In-Game Name (IGN)
            </label>
            <input
              type="text"
              placeholder="e.g. SRK•ITACHI777"
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Assigned Tactical Role
            </label>
            <select
              value={teamRole}
              onChange={(e) => setTeamRole(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Select Official Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map((av) => (
                <button
                  type="button"
                  key={av.url}
                  onClick={() => setAvatarUrl(av.url)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    avatarUrl === av.url ? 'border-red-500 bg-red-500/20 ring-2 ring-red-500/30' : 'border-white/10 bg-black/40'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-9 h-9 rounded-full object-cover" />
                  <span className="text-[9px] font-bold text-zinc-300 truncate max-w-full">
                    {av.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Join Date
            </label>
            <input
              type="text"
              required
              value={joinedAt}
              onChange={(e) => setJoinedAt(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-white/10 bg-black/40 text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'Registering...' : 'Register Official Player'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
