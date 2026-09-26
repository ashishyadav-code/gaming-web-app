import React, { useState } from 'react';
import { X, FileText, Check, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddNoteModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { isIGL, showPermissionDenied } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Strategy');
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIGL) {
      showPermissionDenied('Add Note');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createNote({
        title: title.trim() || undefined,
        category,
        note: noteText.trim(),
      });
      setIsSubmitting(false);
      setTitle('');
      setNoteText('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to add note.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#22222b] text-left relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                Team Strategy & Log
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Add IGL Note
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
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Bermuda Blue Zone Plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="Strategy">Strategy</option>
              <option value="Individual Feedback">Individual Feedback</option>
              <option value="Discipline">Discipline</option>
              <option value="Tactical Observation">Tactical Observation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Note Details</label>
            <textarea
              required
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write directives for team members..."
              className="w-full p-2.5 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-medium text-white placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSubmitting ? 'Saving...' : 'Save Directive Note'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
