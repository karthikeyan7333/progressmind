import React from 'react';
import { BarChart2, LayoutGrid } from 'lucide-react';
import { MainNavTab } from '../types';

interface BottomNavigationProps {
  currentTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onChangeTab,
}) => {
  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-zinc-900 max-w-md mx-auto"
    >
      <div className="flex items-center justify-around pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] px-6">
        {/* Habits Tab icon - two rounded vertical rectangles icon */}
        <button
          id="nav-habits-btn"
          onClick={() => onChangeTab('habits')}
          aria-label="Habits"
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-colors min-w-[48px] min-h-[44px] ${
            currentTab === 'habits' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center gap-[3px]">
            <div className={`w-2 h-4 rounded-xs border-2 ${currentTab === 'habits' ? 'border-white bg-white/20' : 'border-zinc-500'}`} />
            <div className={`w-2 h-4 rounded-xs border-2 ${currentTab === 'habits' ? 'border-white bg-white/20' : 'border-zinc-500'}`} />
          </div>
        </button>

        {/* Analytics Tab icon */}
        <button
          id="nav-analytics-btn"
          onClick={() => onChangeTab('analytics')}
          aria-label="Analytics"
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-colors min-w-[48px] min-h-[44px] ${
            currentTab === 'analytics' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BarChart2 size={22} strokeWidth={currentTab === 'analytics' ? 2.5 : 2} />
        </button>

        {/* Routines Tab icon */}
        <button
          id="nav-routines-btn"
          onClick={() => onChangeTab('routines')}
          aria-label="Routines"
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl transition-colors min-w-[48px] min-h-[44px] ${
            currentTab === 'routines' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <LayoutGrid size={22} strokeWidth={currentTab === 'routines' ? 2.5 : 2} />
        </button>
      </div>
    </nav>
  );
};
