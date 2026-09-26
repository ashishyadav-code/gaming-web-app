import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { ASSETS } from '../utils/assets';

interface Props {
  selectedDate?: string;
  onDateClick?: () => void;
}

export const HeroBanner: React.FC<Props> = ({ selectedDate = '26 Sept 2026', onDateClick }) => {
  return (
    <div className="px-5 my-2">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-soft-card border border-white/10 bg-[#0d0d12] group">
        {/* Artwork Background */}
        <img
          src={ASSETS.heroBanner}
          alt="Team Sarkar Hero Banner"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = ASSETS.heroHeader;
          }}
        />

        {/* Gradient Overlay for high readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090c]/95 via-[#0e0e14]/75 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative p-3.5 z-10 flex items-center justify-between gap-2">
          {/* Quote */}
          <div className="min-w-0 pr-2">
            <h2 className="text-white font-extrabold text-[15px] leading-snug tracking-tight drop-shadow-sm truncate">
              Discipline Today
            </h2>
            <p className="text-zinc-400 font-medium text-[12px] leading-tight truncate">
              Domination Tomorrow.
            </p>
            <div className="w-8 h-0.5 bg-red-500 rounded-full mt-1.5" />
          </div>

          {/* Date Capsule Button */}
          <div className="flex-shrink-0">
            <button
              onClick={onDateClick}
              type="button"
              className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 shadow-sm flex items-center gap-1.5 text-white text-xs font-bold hover:bg-black/70 hover:border-red-500/40 active:scale-95 transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="whitespace-nowrap tracking-tight">{selectedDate}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
