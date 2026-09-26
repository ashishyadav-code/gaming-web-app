import React, { useState } from 'react';
import { X, Lock, User as UserIcon, Mail, ShieldCheck, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { loginUser, user } = useAuth();
  const canClose = !!user;
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamRole, setTeamRole] = useState('Rusher');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await api.loginWithCredentials(userId.trim(), password);
        loginUser(res.user, res.access_token);
      } else {
        const res = await api.registerUser({
          userId: userId.trim(),
          name: name.trim() || userId.trim(),
          email: email.trim() || undefined,
          password: password,
          teamRole: teamRole,
        });
        loginUser(res.user, res.access_token);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const isMasterInput = ['ashish', 'ashish800', 'ashish8006'].includes(userId.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-smooth">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#22222b] text-left relative overflow-hidden animate-slide-up-smooth">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b]">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
              Team Sarkar Roster Portal
            </div>
            <h2 className="text-lg font-black text-white leading-tight">
              {mode === 'login' ? 'Player Sign In' : 'Register New Player'}
            </h2>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#1c1c24] border border-[#282836] rounded-xl mt-3.5">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'register' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register Player
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isMasterInput && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Master ID Detected: Full IGL / Admin privileges active!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3">
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Player ID / Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. ASHISH or HASHIRAMA"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full py-2 pl-9 pr-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-bold text-white focus:outline-none focus:border-red-500"
              />
              <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Full Name / Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ashish Yadav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Tactical Esports Role
                </label>
                <select
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Rusher">Rusher</option>
                  <option value="Primary Rusher">Primary Rusher</option>
                  <option value="2nd Rusher">2nd Rusher</option>
                  <option value="Naider">Naider</option>
                  <option value="Assaulter">Assaulter</option>
                  <option value="Sniper">Sniper</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="player@teamsarkar.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 pl-9 pr-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                  />
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 pl-9 pr-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:outline-none focus:border-red-500"
              />
              <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Registering...' : 'Register Player'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
