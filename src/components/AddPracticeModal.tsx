import React, { useState } from 'react';
import { X, Gamepad2, Check, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPracticeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [date, setDate] = useState('25 Sept 2026');
  const [duration, setDuration] = useState(90);
  const [focus, setFocus] = useState('Rush, Rotation, Grenades, Communication');
  const [notes, setNotes] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [positiveObservations, setPositiveObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIGL) {
      showPermissionDenied('Add Practice');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createPracticeSession({
        date,
        duration_minutes: Number(duration),
        focus: focus.trim(),
        notes: notes.trim() || undefined,
        mistakes: mistakes.trim() || undefined,
        positive_observations: positiveObservations.trim() || undefined,
      });
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to save practice session.');
    }
  };

  const focusPresets = [
    'Rush & Entry',
    'Rotation & Zone 4',
    'Grenade Utilities',
    'Late Game Crossfire',
    'Drop Contests',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-left relative my-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                IGL Training System
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Add Practice Session
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Session Date</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Mins)</label>
              <input
                type="number"
                min="10"
                step="5"
                required
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                className="w-full py-2 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Practice Focus</label>
            <input
              type="text"
              required
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Rush, Rotation, Grenades, Communication"
              className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {focusPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setFocus(preset)}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mistakes to Fix</label>
            <textarea
              rows={2}
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
              placeholder="e.g. Lost man early on bridge cross; bad gloo wall timing."
              className="w-full p-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Positive Observations</label>
            <textarea
              rows={2}
              value={positiveObservations}
              onChange={(e) => setPositiveObservations(e.target.value)}
              placeholder="e.g. Trade kills under 1.5 seconds; clean compound breaches."
              className="w-full p-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-btn-glow hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save Practice Session</span>
          </button>
        </form>
      </div>
    </div>
  );
};
