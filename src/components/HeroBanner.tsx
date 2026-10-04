import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { ASSETS } from '../utils/assets';
import { getTodayDateString } from '../utils/dateUtils';
import { JellyTabs } from './JellyTabs';

interface Props {
  selectedDate?: string;
  onDateClick?: () => void;
  period?: 'Today' | '7D' | '15D' | '20D';
  onPeriodChange?: (period: 'Today' | '7D' | '15D' | '20D') => void;
}

const PERIOD_OPTIONS = ['Today', '7D', '15D', '20D'] as const;

export const HeroBanner: React.FC<Props> = ({
  selectedDate = getTodayDateString(),
  onDateClick,
  period = 'Today',
  onPeriodChange,
}) => {
  return (
    <div className="px-5 pt-2 pb-6">
      {/* Relative container that allows the attached bottom panel to hang outside */}
      <div className="relative w-full">
        {/* Banner Card: Slim, compact height with overflow-hidden for artwork */}
        <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-white/15 shadow-xl shadow-black/80 h-[105px] sm:h-[115px] md:h-[120px]">
          {/* Background Image: Cropped to slim panoramic strip */}
          <img
            src={ASSETS.headerLogo || ASSETS.heroBanner}
            alt="Team Sarkar Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-[center_36%] pointer-events-none select-none"
          />

          {/* Tactical Dark Gradient: Fully masks the image's baked text on the left so there is ZERO double-text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090d] via-[#09090d] via-38% to-transparent pointer-events-none" />

          {/* Content Container (Top-aligned so text never collides with bottom panel) */}
          <div className="relative z-10 w-full h-full px-5 sm:px-6 pt-3 flex items-start justify-between">
            {/* Left: Bold Slogan & Red Bar */}
            <div className="min-w-0 pr-2">
              <h2 className="text-white font-black text-sm sm:text-base md:text-lg leading-tight tracking-tight drop-shadow-md truncate">
                Discipline Today
              </h2>
              <p className="text-zinc-400 font-bold text-[11px] sm:text-xs md:text-sm leading-tight truncate mt-0.5">
                Domination Tomorrow.
              </p>
              <div className="w-8 h-1 bg-red-600 rounded-full mt-1.5 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            </div>

            {/* Right: Date Capsule Button & Subtitle */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {onDateClick && (
                <button
                  onClick={onDateClick}
                  type="button"
                  className="px-2.5 sm:px-3 py-1 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-md border border-white/20 hover:border-red-500/60 shadow-lg flex items-center gap-1.5 text-white text-[10px] sm:text-xs font-bold active:scale-95 transition-all"
                  title="Filter by date"
                >
                  <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-400 flex-shrink-0" />
                  <span className="whitespace-nowrap tracking-tight">{selectedDate}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                </button>
              )}

              <span className="text-[9.5px] sm:text-[11px] text-zinc-400 font-medium italic hidden sm:inline-block drop-shadow-sm">
                &ldquo;Same Squad. Higher Standards.&rdquo;
              </span>
            </div>
          </div>
        </div>

        {/* Attached Period Switcher Panel: EXACTLY IN THE MIDDLE horizontally (center of banner) and vertically (across bottom border line) */}
        {onPeriodChange && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 w-[92%] sm:w-auto max-w-sm sm:max-w-md">
            <JellyTabs
              tabs={PERIOD_OPTIONS}
              activeTab={period}
              onChange={onPeriodChange}
              pillClassName="min-w-[280px] sm:min-w-[340px] bg-[#111118]/95 border border-white/20 shadow-2xl backdrop-blur-2xl"
              tabClassName="py-1 px-3 text-[11px] sm:text-xs font-black"
            />
          </div>
        )}
      </div>
    </div>
  );
};
