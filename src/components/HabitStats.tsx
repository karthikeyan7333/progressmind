import React from 'react';
import { HabitStats as StatsType } from '../types';

interface HabitStatsProps {
  stats: StatsType;
}

export const HabitStats: React.FC<HabitStatsProps> = ({ stats }) => {
  return (
    <div 
      id="habit-stats-card"
      className="w-full bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4 my-4 shadow-md"
    >
      <div className="grid grid-cols-4 gap-2 text-center">
        {/* Score */}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white tracking-tight">
            {stats.score}%
          </span>
          <span className="text-xs font-normal text-zinc-400 mt-1">
            Score
          </span>
        </div>

        {/* Total */}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white tracking-tight">
            {stats.total}
          </span>
          <span className="text-xs font-normal text-zinc-400 mt-1">
            Total
          </span>
        </div>

        {/* Best Streak */}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white tracking-tight">
            {stats.bestStreak}
          </span>
          <span className="text-xs font-normal text-zinc-400 mt-1">
            Best Streak
          </span>
        </div>

        {/* Current Streak */}
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white tracking-tight">
            {stats.currentStreak}
          </span>
          <span className="text-xs font-normal text-zinc-400 mt-1">
            Streak
          </span>
        </div>
      </div>
    </div>
  );
};
