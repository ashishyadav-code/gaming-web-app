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
  const [date, setDate] = useState('26 Sept 2026');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#22222b] text-left relative my-6 max-h-[92vh] overflow-y-auto animate-slide-up-smooth">
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                Scrim Logistics
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Log Practice Session
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Session Date</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Duration (Min)</label>
              <input
                type="number"
                min="10"
                required
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Tactical Focus</label>
            <input
              type="text"
              required
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {focusPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setFocus(preset)}
                  className="px-2 py-0.5 rounded-lg bg-[#1c1c24] hover:bg-[#252532] border border-[#2b2b38] text-[9.5px] font-bold text-zinc-400 hover:text-white"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">IGL Session Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on aggressive double-rush and zone control."
              className="w-full p-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-medium text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Common Mistakes Observed</label>
            <textarea
              rows={2}
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
              placeholder="e.g. Overextending without gloo walls."
              className="w-full p-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-medium text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Positive Highlights</label>
            <textarea
              rows={2}
              value={positiveObservations}
              onChange={(e) => setPositiveObservations(e.target.value)}
              placeholder="e.g. Great comms on clutch situations."
              className="w-full p-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-medium text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'Saving...' : 'Save Practice Session'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
