import React from 'react';
import { LayoutGrid, Plus, BookOpen } from 'lucide-react';
import { TabType } from '../types';

interface TopBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCreateHabit: () => void;
  onOpenJournal: () => void;
  onOpenRoutines: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateHabit,
  onOpenJournal,
  onOpenRoutines,
}) => {
  return (
    <header className="pt-4 pb-2 px-5">
      {/* Top action icons matching Screenshot 1 & 2 */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="top-routines-btn"
          onClick={onOpenRoutines}
          aria-label="Open Routines"
          className="text-white hover:text-zinc-300 p-1.5 -ml-1.5 rounded-lg transition-colors"
        >
          <LayoutGrid size={22} strokeWidth={2} />
        </button>

        <div className="flex items-center gap-4">
          <button
            id="top-add-habit-btn"
            onClick={onOpenCreateHabit}
            aria-label="Create Habit"
            className="text-white hover:text-zinc-300 p-1.5 rounded-lg transition-colors"
          >
            <Plus size={24} strokeWidth={2.2} />
          </button>
          <button
            id="top-journal-btn"
            onClick={onOpenJournal}
            aria-label="Open Journal"
            className="text-white hover:text-zinc-300 p-1.5 -mr-1.5 rounded-lg transition-colors"
          >
            <BookOpen size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Habits</h1>

      {/* Exactly three tabs: Today | Weekly | Monthly */}
      <div className="flex items-center gap-3">
        <button
          id="tab-today-btn"
          onClick={() => onTabChange('today')}
          className={`text-base font-semibold px-4 py-1.5 rounded-full transition-all duration-150 ${
            activeTab === 'today'
              ? 'bg-[#1C1C1E] text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Today
        </button>
        <button
          id="tab-weekly-btn"
          onClick={() => onTabChange('weekly')}
          className={`text-base font-semibold px-4 py-1.5 rounded-full transition-all duration-150 ${
            activeTab === 'weekly'
              ? 'bg-[#1C1C1E] text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Weekly
        </button>
        <button
          id="tab-monthly-btn"
          onClick={() => onTabChange('monthly')}
          className={`text-base font-semibold px-4 py-1.5 rounded-full transition-all duration-150 ${
            activeTab === 'monthly'
              ? 'bg-[#1C1C1E] text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Monthly
        </button>
      </div>
    </header>
  );
};
