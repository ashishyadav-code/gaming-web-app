import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Check, Clock } from 'lucide-react';
import { getTodayDateString, getYesterdayDateString } from '../utils/dateUtils';

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
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
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

  const triggerClose = (afterClose?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      if (afterClose) afterClose();
    }, 200);
  };

  const quickDates = [
    { label: `Today • ${todayStr}`, value: todayStr, subtitle: 'Current Day Activity' },
    { label: `Yesterday • ${yesterdayStr}`, value: yesterdayStr, subtitle: 'Previous Tournament Scrims' },
    { label: '25 Sept 2026', value: '25 Sept 2026', subtitle: 'Regional Stage Matches' },
    { label: 'Show All Dates (Full History)', value: 'All', subtitle: 'Overall Season Performance' },
  ];

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDate.trim()) {
      triggerClose(() => onSelectDate(customDate.trim()));
    }
  };

  const handleSelect = (val: string) => {
    triggerClose(() => onSelectDate(val));
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
    >
      <div className="absolute inset-0" onClick={() => triggerClose()} />

      <div
        className={`glass-sheet rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-white/10 text-left relative overflow-hidden transition-all ${
          isClosing ? 'animate-modal-pop-out' : 'animate-modal-pop-in'
        }`}
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
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
            onClick={() => triggerClose()}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Dates */}
        <div className="mt-3.5 space-y-2 relative z-10">
          {quickDates.map((item) => {
            const isSelected = selectedDate === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleSelect(item.value)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-red-500/15 border-red-500/40 text-white shadow-sm'
                    : 'glass-card border-white/5 text-zinc-300 hover:text-white hover:border-white/20'
                }`}
              >
                <div>
                  <div className="text-xs font-black flex items-center gap-1.5">
                    {item.label}
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {item.subtitle}
                  </span>
                </div>
                {isSelected ? (
                  <Check className="w-4 h-4 text-red-400 flex-shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Date Input */}
        <form onSubmit={handleApplyCustom} className="mt-4 pt-3 border-t border-white/10 relative z-10">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Or Enter Specific Date
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              placeholder={`e.g. ${todayStr}`}
              className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-all font-semibold"
            />
            <button
              type="submit"
              disabled={!customDate.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-black rounded-xl active:scale-95 transition-all shadow-sm"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
