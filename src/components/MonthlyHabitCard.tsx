import React from 'react';
import { Check, ChevronRight, Calendar } from 'lucide-react';
import { Habit } from '../types';
import { isMonthlyHabitCompletedInMonth } from '../services/streaks';

interface MonthlyHabitCardProps {
  habit: Habit;
  completedDates: string[];
  onToggleMonthly: () => void;
  onOpenDetail: () => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MonthlyHabitCard: React.FC<MonthlyHabitCardProps> = ({
  habit,
  completedDates,
  onToggleMonthly,
  onOpenDetail,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentMonthName = today.toLocaleDateString('en-US', { month: 'long' });

  const isDone = isMonthlyHabitCompletedInMonth(completedDates || [], currentYear, currentMonth);

  return (
    <div
      id={`habit-monthly-${habit.id}`}
      style={{ backgroundColor: habit.color }}
      className={`group relative w-full rounded-2xl p-4 sm:p-5 text-white transition-all duration-200 select-none shadow-md ${
        isDone ? 'ring-2 ring-white/30' : 'hover:brightness-105'
      }`}
    >
      {/* Top Header Row: Emoji + Title + Detail Arrow */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div
          onClick={onOpenDetail}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0 flex-1 group"
        >
          <span className="text-xl sm:text-2xl leading-none shrink-0">{habit.emoji}</span>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-medium tracking-tight group-hover:underline truncate">
              {habit.title}
            </h3>
            <p className="text-xs text-white/75 flex items-center gap-1 font-normal">
              <Calendar size={12} className="shrink-0" />
              <span>1 time a month</span>
            </p>
          </div>
        </div>

        <button
          id={`monthly-detail-btn-${habit.id}`}
          onClick={onOpenDetail}
          aria-label={`View details for ${habit.title}`}
          className="p-1 text-white/60 hover:text-white transition-colors shrink-0"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Main Status & Completion Action Row */}
      <div className="bg-black/20 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 mb-3 border border-white/10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold tracking-tight">
              {currentMonthName} {currentYear}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                isDone
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/15 text-white/90'
              }`}
            >
              {isDone ? '1 / 1 (100%)' : '0 / 1 (0%)'}
            </span>
          </div>
          <p className="text-xs text-white/70">
            {isDone ? `Completed for ${currentMonthName}` : `Not yet completed for ${currentMonthName}`}
          </p>
        </div>

        {/* Complete Toggle Button */}
        <button
          id={`monthly-check-btn-${habit.id}`}
          onClick={onToggleMonthly}
          aria-label={isDone ? `Mark ${habit.title} incomplete for ${currentMonthName}` : `Mark ${habit.title} complete for ${currentMonthName}`}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 shrink-0 ${
            isDone
              ? 'bg-white text-black hover:bg-zinc-100 shadow-sm'
              : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${
              isDone ? 'bg-black text-white' : 'border border-white/60'
            }`}
          >
            {isDone && <Check size={11} strokeWidth={3.5} />}
          </div>
          <span>{isDone ? 'Completed' : 'Complete'}</span>
        </button>
      </div>

      {/* 12-Month Year Progress Track */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[10px] text-white/70 mb-1.5 px-0.5">
          <span>{currentYear} Monthly History</span>
          <span>
            {MONTH_NAMES.filter((_, idx) =>
              isMonthlyHabitCompletedInMonth(completedDates || [], currentYear, idx)
            ).length}{' '}
            / 12 months
          </span>
        </div>
        <div className="grid grid-cols-12 gap-1 text-center">
          {MONTH_NAMES.map((name, idx) => {
            const completed = isMonthlyHabitCompletedInMonth(completedDates || [], currentYear, idx);
            const isCurrent = idx === currentMonth;

            return (
              <div
                key={name}
                className="flex flex-col items-center gap-1"
                title={`${name} ${currentYear}: ${completed ? 'Completed' : 'Not completed'}`}
              >
                <div
                  className={`w-full h-2 rounded-full transition-colors ${
                    completed
                      ? 'bg-white shadow-xs'
                      : isCurrent
                      ? 'bg-white/30 ring-1 ring-white/70'
                      : 'bg-black/20'
                  }`}
                />
                <span
                  className={`text-[9px] font-medium ${
                    isCurrent ? 'text-white font-bold' : 'text-white/60'
                  }`}
                >
                  {name.charAt(0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
