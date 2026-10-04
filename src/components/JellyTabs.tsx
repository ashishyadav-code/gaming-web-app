import React, { useState, useEffect } from 'react';

export interface JellyTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
}

interface JellyTabsProps<T extends string = string> {
  tabs: readonly T[] | T[] | JellyTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
  pillClassName?: string;
  tabClassName?: string;
  activeTextClassName?: string;
  inactiveTextClassName?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function JellyTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  pillClassName = '',
  tabClassName = '',
  activeTextClassName = 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]',
  inactiveTextClassName = 'text-zinc-400 hover:text-zinc-200',
  orientation = 'horizontal',
}: JellyTabsProps<T>) {
  // Normalize tabs to items
  const tabList: JellyTabItem<T>[] = tabs.map((t) => {
    if (typeof t === 'string') {
      return { id: t as T, label: t };
    }
    return t as JellyTabItem<T>;
  });

  const activeIndex = Math.max(0, tabList.findIndex((t) => t.id === activeTab));
  const [prevIndex, setPrevIndex] = useState(activeIndex);
  const [jellyDir, setJellyDir] = useState<'right' | 'left' | 'down' | 'up' | null>(null);
  const [jellyKey, setJellyKey] = useState(0);

  const handleTabClick = (tabId: T, index: number) => {
    if (tabId === activeTab) return;
    if (orientation === 'vertical') {
      setJellyDir(index > activeIndex ? 'down' : 'up');
    } else {
      setJellyDir(index > activeIndex ? 'right' : 'left');
    }
    setJellyKey((k) => k + 1);
    setPrevIndex(activeIndex);
    onChange(tabId);
  };

  useEffect(() => {
    if (activeIndex !== prevIndex) {
      if (orientation === 'vertical') {
        setJellyDir(activeIndex > prevIndex ? 'down' : 'up');
      } else {
        setJellyDir(activeIndex > prevIndex ? 'right' : 'left');
      }
      setJellyKey((k) => k + 1);
      setPrevIndex(activeIndex);
    }
  }, [activeIndex, orientation, prevIndex]);

  const count = tabList.length;
  const stepPercent = count > 0 ? 100 / count : 100;

  if (orientation === 'vertical') {
    return (
      <div className={`relative flex flex-col p-1 rounded-2xl glass-card border border-white/10 ${className}`}>
        {/* Sliding Jelly Pill (Vertical) */}
        <div
          className="absolute left-1 right-1 pointer-events-none transform-gpu will-change-[top]"
          style={{
            top: `calc(${activeIndex * stepPercent}% + 4px)`,
            height: `calc(${stepPercent}% - 8px)`,
            transition: 'top var(--jelly-slide-speed, 0.42s) var(--jelly-ease, cubic-bezier(0.22, 1, 0.36, 1))',
          }}
        >
          <div
            key={jellyKey}
            className={`w-full h-full rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 shadow-[0_0_24px_rgba(239,68,68,0.65)] border border-red-400/40 relative overflow-hidden transform-gpu ${
              jellyDir === 'down' ? 'animate-jelly-down' : jellyDir === 'up' ? 'animate-jelly-up' : ''
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none" />
          </div>
        </div>

        {tabList.map((item, idx) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id, idx)}
              className={`relative z-10 w-full py-2 px-3 rounded-xl text-xs font-black transition-colors duration-200 select-none flex items-center justify-between active:scale-98 ${
                isActive ? activeTextClassName : inactiveTextClassName
              } ${tabClassName}`}
            >
              <div className="flex items-center gap-2">{item.label}</div>
              {item.badge && <span>{item.badge}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // Horizontal Jelly Tabs
  return (
    <div
      className={`relative p-1 rounded-2xl flex items-center glass-pill border border-white/15 shadow-xl backdrop-blur-2xl select-none ${pillClassName} ${className}`}
    >
      {/* Sliding Jelly Pill (Horizontal) */}
      <div
        className="absolute top-1 bottom-1 pointer-events-none transform-gpu will-change-[left]"
        style={{
          left: `calc(${activeIndex * stepPercent}% + 4px)`,
          width: `calc(${stepPercent}% - 8px)`,
          transition: 'left var(--jelly-slide-speed, 0.42s) var(--jelly-ease, cubic-bezier(0.22, 1, 0.36, 1))',
        }}
      >
        <div
          key={jellyKey}
          className={`w-full h-full rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 shadow-[0_0_24px_rgba(239,68,68,0.65)] border border-red-400/40 relative overflow-hidden transform-gpu ${
            jellyDir === 'right' ? 'animate-jelly-right' : jellyDir === 'left' ? 'animate-jelly-left' : ''
          }`}
        >
          {/* Specular gloss highlight */}
          <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/35 to-transparent rounded-t-xl pointer-events-none" />
          {/* Subtle flare */}
          <div className="absolute -right-1 -top-1 w-6 h-6 bg-red-300/40 rounded-full blur-sm pointer-events-none" />
        </div>
      </div>

      {tabList.map((item, idx) => {
        const isActive = item.id === activeTab;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabClick(item.id, idx)}
            className={`relative z-10 flex-1 py-1.5 md:py-2 px-2 rounded-xl text-xs md:text-sm font-black transition-colors duration-200 select-none flex items-center justify-center gap-1.5 active:scale-95 ${
              isActive ? activeTextClassName : inactiveTextClassName
            } ${tabClassName}`}
          >
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}
