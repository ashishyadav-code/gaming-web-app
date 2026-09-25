import React, { useState } from 'react';
import { X, Calendar, Check, Filter } from 'lucide-react';

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
    { label: 'Today • 25 Sept 2026', value: '25 Sept 2026', badge: '3 Matches' },
    { label: 'Yesterday • 24 Sept 2026', value: '24 Sept 2026', badge: '4 Matches' },
    { label: '23 Sept 2026', value: '23 Sept 2026', badge: '1 Match' },
    { label: '22 Sept 2026', value: '22 Sept 2026', badge: '1 Match' },
    { label: '21 Sept 2026', value: '21 Sept 2026', badge: '3 Matches' },
    { label: 'Show All Dates (Full History)', value: 'All', badge: '12 Matches' },
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDate.trim()) {
      onSelectDate(customDate.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-smooth">
      <div className="bg-white rounded-[32px] p-5 max-w-sm w-full shadow-2xl border border-slate-100 text-left relative overflow-hidden animate-slide-up-smooth">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                Filter Matches & Insights
              </span>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Select Date
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Date List */}
        <div className="mt-4 space-y-2">
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
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {item.badge}
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">&rarr;</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Date Input */}
        <form onSubmit={handleApplyCustom} className="mt-4 pt-3 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Or Type Custom Date / Month:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 25 Sept 2026"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="flex-1 py-2 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="py-2 px-3.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-btn-glow hover:bg-blue-700"
            >
              Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
