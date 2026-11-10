import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardTodayProps {
  habit: Habit;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onOpenDetail: () => void;
}

export const HabitCardToday: React.FC<HabitCardTodayProps> = ({
  habit,
  isCompleted,
  onToggleComplete,
  onOpenDetail,
}) => {
  return (
    <div
      id={`habit-today-${habit.id}`}
      style={{ backgroundColor: habit.color }}
      className={`group relative w-full rounded-2xl p-5 text-white transition-all duration-200 select-none shadow-md ${
        isCompleted ? 'ring-2 ring-white/30' : 'hover:brightness-105'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Click habit area to toggle completion */}
        <button
          id={`toggle-complete-btn-${habit.id}`}
          onClick={onToggleComplete}
          className="flex-1 flex items-center gap-3 text-left py-1"
        >
          <span className="text-xl leading-none">{habit.emoji}</span>
          <span className="text-xl font-medium tracking-tight text-white">{habit.title}</span>
        </button>

        {/* Right side actions: completion checkmark and detail arrow */}
        <div className="flex items-center gap-2">
          <button
            id={`check-today-btn-${habit.id}`}
            onClick={onToggleComplete}
            aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-white text-black shadow-xs'
                : 'bg-white/15 text-white/50 hover:bg-white/25 hover:text-white'
            }`}
          >
            {isCompleted && <Check size={16} strokeWidth={3} />}
          </button>

          <button
            id={`open-detail-btn-${habit.id}`}
            onClick={onOpenDetail}
            aria-label={`Open details for ${habit.title}`}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
