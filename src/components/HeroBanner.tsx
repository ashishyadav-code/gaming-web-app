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
    <div className="px-5 my-2">
      <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-white/10 group shadow-lg shadow-black/40">
        {/* Artwork Background */}
        <img
          src={ASSETS.heroBanner}
          alt="Team Sarkar Hero Banner"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = ASSETS.heroHeader;
          }}
        />

        {/* Gradient Overlay for high readability & glassy sheen */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c12]/98 via-[#0e0e16]/95 to-red-950/60 pointer-events-none" />

        {/* Content */}
        <div className="relative p-3.5 z-10 flex items-center justify-between gap-2">
          {/* Logo Crest & Quote */}
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden p-1 glass-card border border-white/20 flex-shrink-0 flex items-center justify-center shadow-md">
              <img
                src={ASSETS.teamSarkarLogo || ASSETS.logo}
                alt="Team Sarkar"
                className="w-full h-full object-contain filter drop-shadow"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== ASSETS.legacyLogo && ASSETS.legacyLogo) {
                    target.src = ASSETS.legacyLogo;
                  } else {
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<span class="text-xs font-black text-red-500 tracking-wider">SRK</span>';
                  }
                }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-extrabold text-[15px] leading-snug tracking-tight drop-shadow-sm truncate">
                Discipline Today
              </h2>
              <p className="text-zinc-400 font-medium text-[12px] leading-tight truncate">
                Domination Tomorrow.
              </p>
              <div className="w-8 h-0.5 bg-red-500 rounded-full mt-1.5" />
            </div>
          </div>

          {/* Date Capsule Button */}
          <div className="flex-shrink-0">
            <button
              onClick={onDateClick}
              type="button"
              className="px-3.5 py-1.5 rounded-full glass-btn border border-white/20 shadow-md flex items-center gap-1.5 text-white text-xs font-bold hover:border-red-500/50 active:scale-95 transition-all"
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
