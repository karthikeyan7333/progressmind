import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Habit } from '../types';
import { getMonthCalendarGrid, getTodayKey } from '../services/streaks';

interface HabitCalendarProps {
  habit: Habit;
  completedDates: string[];
  onToggleDate: (dateKey: string) => void;
}

export const HabitCalendar: React.FC<HabitCalendarProps> = ({
  habit,
  completedDates,
  onToggleDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const completedSet = new Set(completedDates || []);
  const todayKey = getTodayKey();
  const grid = getMonthCalendarGrid(currentYear, currentMonth);

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div id="habit-history-section" className="mb-6">
      {/* Header matching Screenshot 3: History & Month Year */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xl font-bold text-white tracking-tight">History</h2>
        <div className="flex items-center gap-1 text-zinc-300">
          <button
            id="cal-prev-month-btn"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-1 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium">{monthName}</span>
          <button
            id="cal-next-month-btn"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-1 hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="w-full bg-[#18181B] border border-zinc-800/60 rounded-3xl p-4 sm:p-5 shadow-md">
        {/* Day of week headers: M T W T F S S */}
        <div className="grid grid-cols-7 gap-1 text-center mb-3">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
            <span key={idx} className="text-xs font-semibold text-zinc-400">
              {day}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-2 sm:gap-y-2.5 gap-x-0.5 sm:gap-x-1 text-center">
          {grid.map((cell) => {
            const isCompleted = completedSet.has(cell.key);
            const isToday = cell.key === todayKey;

            return (
              <div key={cell.key} className="flex items-center justify-center">
                <button
                  id={`cal-day-btn-${cell.key}`}
                  onClick={() => onToggleDate(cell.key)}
                  style={{
                    backgroundColor: isCompleted ? habit.color : 'transparent',
                  }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    isCompleted
                      ? 'text-white font-bold shadow-xs'
                      : isToday
                      ? 'text-cyan-400 ring-2 ring-cyan-500/80 font-bold'
                      : cell.isCurrentMonth
                      ? 'text-zinc-300 hover:bg-zinc-800/60'
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {cell.dayNumber}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
