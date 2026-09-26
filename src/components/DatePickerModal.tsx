import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DatePickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  const [customDate, setCustomDate] = useState('');

  if (!isOpen) return null;

  const quickDates = [
    { label: 'Today • 26 Sept 2026', value: '26 Sept 2026', badge: '3 Matches' },
    { label: 'Yesterday • 25 Sept 2026', value: '25 Sept 2026', badge: '0 Matches' },
    { label: 'Show All Dates (Full History)', value: 'All', badge: '3 Matches' },
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDate.trim()) {
      onSelectDate(customDate.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in-smooth">
      <div className="bg-[#141419] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#22222b] text-left relative overflow-hidden animate-slide-up-smooth">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22222b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">
                Filter Matches & Insights
              </span>
              <h2 className="text-base font-black text-white leading-tight">
                Select Date
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#282836] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Date List */}
        <div className="mt-3.5 space-y-2">
          {quickDates.map((item) => {
            const isSelected = selectedDate === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onSelectDate(item.value);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'border-red-500 bg-red-500/15 ring-2 ring-red-500/20 shadow-sm'
                    : 'border-[#282836] hover:border-zinc-500 bg-[#1c1c24]'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-white leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                    {item.badge}
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-zinc-500">&rarr;</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Date Input */}
        <form onSubmit={handleApplyCustom} className="mt-3.5 pt-3 border-t border-[#22222b]">
          <label className="text-xs font-bold text-zinc-300 block mb-1.5">
            Or Type Custom Date / Month:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 26 Sept 2026"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="flex-1 py-2 px-3 rounded-xl border border-[#2b2b38] bg-[#1c1c24] text-xs font-semibold text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="py-2 px-3.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.35)] hover:bg-red-700"
            >
              Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
