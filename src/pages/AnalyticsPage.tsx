import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Habit, CompletionsMap } from '../types';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { EmptyState } from '../components/EmptyState';

interface AnalyticsPageProps {
  habits: Habit[];
  completions: CompletionsMap;
  initialSelectedHabitId?: string | 'all';
  onBack: () => void;
  onOpenCreateHabit: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  habits,
  completions,
  initialSelectedHabitId = 'all',
  onBack,
  onOpenCreateHabit,
}) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string | 'all'>(
    initialSelectedHabitId
  );

  return (
    <div id="analytics-page" className="w-full min-h-screen bg-black text-white pb-24">
      {/* Top Header matching Screenshot 8 */}
      <header className="pt-4 pb-2 px-5">
        <div className="flex items-center mb-3">
          <button
            id="analytics-back-btn"
            onClick={onBack}
            aria-label="Go back"
            className="text-white hover:text-zinc-300 p-1.5 -ml-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white tracking-tight mb-4">Analytics</h1>

        {/* Filter Tabs matching Screenshot 8: All habits | Gym | Learn */}
        {habits.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              id="filter-all-habits-btn"
              onClick={() => setSelectedHabitId('all')}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full shrink-0 transition-all ${
                selectedHabitId === 'all'
                  ? 'bg-[#1C1C1E] text-white shadow-sm ring-1 ring-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              All habits
            </button>
            {habits.map((h) => (
              <button
                key={h.id}
                id={`filter-habit-${h.id}-btn`}
                onClick={() => setSelectedHabitId(h.id)}
                className={`text-sm font-semibold px-4 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all ${
                  selectedHabitId === h.id
                    ? 'bg-[#1C1C1E] text-white shadow-sm ring-1 ring-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>{h.emoji}</span>
                <span>{h.title}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="px-5 pt-2">
        {habits.length === 0 ? (
          <EmptyState
            id="empty-analytics"
            title="No Analytics Yet"
            description="Create and complete habits to see detailed progress and charts"
            buttonText="Create Habit"
            onAction={onOpenCreateHabit}
          />
        ) : (
          <AnalyticsCharts
            habits={habits}
            completions={completions}
            selectedHabitId={selectedHabitId}
          />
        )}
      </main>
    </div>
  );
};
