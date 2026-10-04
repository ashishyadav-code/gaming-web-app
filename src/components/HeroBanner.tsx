import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { ASSETS } from '../utils/assets';
import { getTodayDateString } from '../utils/dateUtils';

interface Props {
  selectedDate?: string;
  onDateClick?: () => void;
}

export const HeroBanner: React.FC<Props> = ({
  selectedDate = getTodayDateString(),
  onDateClick
}) => {
  return (
    <div className="px-5 my-2.5">
      <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-white/15 group shadow-xl shadow-black/60 aspect-[3/1] sm:aspect-[3.6/1] min-h-[110px] sm:min-h-[140px] flex items-center">
        {/* Crisp Esports Header Poster */}
        <img
          src={ASSETS.headerLogo || ASSETS.heroBanner}
          alt="Team Sarkar Hero Banner"
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none select-none"
        />

        {/* Subtle Edge Vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Date Filter Capsule Button */}
        {onDateClick && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
            <button
              onClick={onDateClick}
              type="button"
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 hover:border-red-500/60 shadow-lg flex items-center gap-1.5 text-white text-[10.5px] sm:text-xs font-bold active:scale-95 transition-all"
              title="Filter by date"
            >
              <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-red-400 flex-shrink-0" />
              <span className="whitespace-nowrap tracking-tight">{selectedDate}</span>
              <ChevronRight className="w-3 h-3 text-zinc-400 flex-shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
