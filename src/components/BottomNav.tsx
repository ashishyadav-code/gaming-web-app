import React from 'react';
import { Home, Swords, Users, BarChart3, Plus } from 'lucide-react';

export type NavTab = 'home' | 'matches' | 'players' | 'insights';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onPlusClick: () => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange, onPlusClick }) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-40 pointer-events-none">
      <nav className="pointer-events-auto bg-[#131318]/92 backdrop-blur-2xl rounded-full px-5 py-2 shadow-2xl flex items-center justify-between border border-white/10">
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home' ? 'text-red-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'home' ? 'bg-red-500/15' : ''}`}>
            <Home className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-semibold leading-none">Home</span>
        </button>

        {/* Matches */}
        <button
          onClick={() => onTabChange('matches')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'matches' ? 'text-red-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'matches' ? 'bg-red-500/15' : ''}`}>
            <Swords className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-semibold leading-none">Matches</span>
        </button>

        {/* Central Plus Button (Visible to ALL users) */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={onPlusClick}
            aria-label="Add New"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white flex items-center justify-center shadow-[0_0_22px_rgba(239,68,68,0.55)] hover:scale-105 active:scale-95 transition-all p-3 border-4 border-[#0c0c10]"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Players */}
        <button
          onClick={() => onTabChange('players')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'players' ? 'text-red-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'players' ? 'bg-red-500/15' : ''}`}>
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-semibold leading-none">Players</span>
        </button>

        {/* Insights */}
        <button
          onClick={() => onTabChange('insights')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'insights' ? 'text-red-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'insights' ? 'bg-red-500/15' : ''}`}>
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-semibold leading-none">Insights</span>
        </button>
      </nav>
    </div>
  );
};
