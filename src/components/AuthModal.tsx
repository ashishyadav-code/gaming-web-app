import React, { useState } from 'react';
import { X, Lock, User as UserIcon, Mail, ShieldCheck, Check, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { loginUser } = useAuth();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-smooth">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-left relative overflow-hidden animate-slide-up-smooth">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
              Team Sarkar Roster Portal
            </div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              {mode === 'login' ? 'Player Sign In' : 'Register New Player'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl mt-4">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Register Player
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isMasterInput && (
          <div className="mt-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Master ID Detected: Full IGL / Admin privileges active!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Player ID / Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. ASHISH800 or ASH"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name / Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ashish Yadav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tactical Esports Role
                </label>
                <select
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Rusher">Rusher</option>
                  <option value="2nd Rusher">2nd Rusher</option>
                  <option value="Naider">Naider</option>
                  <option value="Assaulter">Assaulter</option>
                  <option value="Sniper">Sniper</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="player@teamsarkar.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-9 pr-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2.5 pl-9 pr-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-btn-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering...' : 'Register Player'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
