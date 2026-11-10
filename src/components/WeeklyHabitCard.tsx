import React from 'react';
import { Check } from 'lucide-react';
import { Habit } from '../types';
import { getHabitFrequencyLabel, getWeekDates } from '../services/streaks';

interface WeeklyHabitCardProps {
  habit: Habit;
  completedDates: string[];
  referenceDate?: Date;
  onToggleDay: (dateKey: string) => void;
  onOpenDetail: () => void;
}

export const WeeklyHabitCard: React.FC<WeeklyHabitCardProps> = ({
  habit,
  completedDates,
  referenceDate,
  onToggleDay,
  onOpenDetail,
}) => {
  const completedSet = new Set(completedDates || []);
  const weekDays = getWeekDates(referenceDate);
  const frequencyLabel = getHabitFrequencyLabel(habit);

  return (
    <div
      id={`habit-weekly-${habit.id}`}
      style={{ backgroundColor: habit.color }}
      className="w-full rounded-2xl p-4 sm:p-5 text-white shadow-md transition-all select-none"
    >
      {/* Top row: Emoji + Title on left, Frequency on right */}
      <div 
        onClick={onOpenDetail}
        className="flex items-center justify-between cursor-pointer mb-4 sm:mb-5 group gap-2"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <span className="text-xl leading-none shrink-0">{habit.emoji}</span>
          <span className="text-lg sm:text-xl font-medium tracking-tight group-hover:underline truncate">
            {habit.title}
          </span>
        </div>
        <span className="text-xs sm:text-sm font-normal text-white/80 shrink-0">
          {frequencyLabel}
        </span>
      </div>

      {/* Days row: Mon Tue Wed Thu Fri Sat Sun */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center">
        {weekDays.map((day) => {
          const isDone = completedSet.has(day.key);
          return (
            <div key={day.key} className="flex flex-col items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-normal text-white/70">
                {day.label}
              </span>
              <button
                id={`weekly-day-btn-${habit.id}-${day.key}`}
                onClick={() => onToggleDay(day.key)}
                aria-label={`${day.label} completion for ${habit.title}`}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-150 ${
                  isDone
                    ? 'bg-white/25 text-white border border-white/40 shadow-xs'
                    : 'border-2 border-white/20 hover:border-white/40 bg-black/10'
                }`}
              >
                {isDone && <Check size={15} strokeWidth={2.8} className="sm:w-4 sm:h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
