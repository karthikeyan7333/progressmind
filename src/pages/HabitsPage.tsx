import React, { useState } from 'react';
import { MoreHorizontal, Calendar } from 'lucide-react';
import { Habit, CompletionsMap, TabType } from '../types';
import { TopBar } from '../components/TopBar';
import { HabitCardToday } from '../components/HabitCardToday';
import { WeeklyHabitCard } from '../components/WeeklyHabitCard';
import { MonthlyHabitCard } from '../components/MonthlyHabitCard';
import { EmptyState } from '../components/EmptyState';
import {
  getTodayKey,
  isHabitScheduledForDate,
  isHabitCompletedToday,
  isMonthlyHabitCompletedInMonth,
} from '../services/streaks';

interface HabitsPageProps {
  habits: Habit[];
  completions: CompletionsMap;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onToggleHabitDate: (habitId: string, dateKey: string) => void;
  onOpenHabitDetail: (habitId: string) => void;
  onOpenCreateHabit: () => void;
  onOpenJournal: () => void;
  onOpenRoutines: () => void;
  onMarkAllToday: () => void;
  onResetToday: () => void;
}

export const HabitsPage: React.FC<HabitsPageProps> = ({
  habits,
  completions,
  activeTab,
  onTabChange,
  onToggleHabitDate,
  onOpenHabitDetail,
  onOpenCreateHabit,
  onOpenJournal,
  onOpenRoutines,
  onMarkAllToday,
  onResetToday,
}) => {
  const [showTodayMenu, setShowTodayMenu] = useState(false);
  const today = new Date();
  const todayKey = getTodayKey();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const currentMonthName = today.toLocaleDateString('en-US', { month: 'long' });
  const currentMonthYear = `${currentMonthName} ${currentYear}`;

  // 1. TODAY TAB FILTER: Daily & Weekly scheduled today ONLY (Monthly NEVER in Today)
  const scheduledTodayHabits = habits.filter(
    (h) => h.repeatType !== 'monthly' && isHabitScheduledForDate(h, today)
  );

  const completedCountToday = scheduledTodayHabits.filter((h) =>
    isHabitCompletedToday(h, completions[h.id] || [], today)
  ).length;
  const totalToday = scheduledTodayHabits.length;
  const todayProgressPercent =
    totalToday > 0 ? Math.min(100, Math.round((completedCountToday / totalToday) * 100)) : 0;

  // 2. WEEKLY TAB FILTER: Daily & Weekly habits ONLY (Monthly NEVER in Weekly)
  const weeklyHabits = habits.filter((h) => h.repeatType !== 'monthly');

  // 3. MONTHLY TAB FILTER: Monthly repeat habits ONLY
  const monthlyHabits = habits.filter((h) => h.repeatType === 'monthly');

  const completedMonthlyCount = monthlyHabits.filter((h) =>
    isMonthlyHabitCompletedInMonth(completions[h.id] || [], currentYear, currentMonthIndex)
  ).length;
  const totalMonthly = monthlyHabits.length;
  const rawMonthlyPercent = totalMonthly > 0 ? (completedMonthlyCount / totalMonthly) * 100 : 0;
  const formattedMonthlyPercent =
    totalMonthly > 0
      ? Number.isInteger(rawMonthlyPercent)
        ? `${rawMonthlyPercent}%`
        : `${rawMonthlyPercent.toFixed(1)}%`
      : '0%';

  return (
    <div id="habits-page" className="w-full min-h-screen bg-black text-white pb-24">
      {/* Top Bar with title, tabs, and action icons */}
      <TopBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenCreateHabit={onOpenCreateHabit}
        onOpenJournal={onOpenJournal}
        onOpenRoutines={onOpenRoutines}
      />

      {/* Main Content Area */}
      <main className="px-5 pt-4">
        {habits.length === 0 ? (
          <EmptyState
            id="empty-habits"
            title="No Habits Yet"
            description="Create your first habit to begin your daily journey"
            buttonText="Add Habit"
            onAction={onOpenCreateHabit}
          />
        ) : (
          <>
            {/* ================= TODAY TAB ================= */}
            {activeTab === 'today' && (
              <div id="tab-content-today" className="space-y-4">
                {/* Progress Bar */}
                <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${todayProgressPercent}%` }}
                    className="bg-[#EF5D5D] h-full transition-all duration-300 rounded-full"
                  />
                </div>

                {/* Progress info row: "X completed" & "..." menu */}
                <div className="relative flex items-center justify-between text-zinc-400 text-sm mb-4 px-0.5">
                  <span className="font-normal text-zinc-300">
                    {completedCountToday} of {totalToday} completed
                  </span>

                  <button
                    id="today-options-menu-btn"
                    onClick={() => setShowTodayMenu((prev) => !prev)}
                    aria-label="Today Options"
                    className="p-1 hover:text-white transition-colors rounded-lg"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {/* Dropdown Menu */}
                  {showTodayMenu && (
                    <div className="absolute right-0 top-8 z-30 bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-2 shadow-2xl min-w-[160px] text-xs">
                      <button
                        onClick={() => {
                          onMarkAllToday();
                          setShowTodayMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                      >
                        Complete all today
                      </button>
                      <button
                        onClick={() => {
                          onResetToday();
                          setShowTodayMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors font-medium"
                      >
                        Reset today
                      </button>
                    </div>
                  )}
                </div>

                {/* Today Habit Cards - Show ONLY Daily and scheduled Weekly habits */}
                {scheduledTodayHabits.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-[#18181B] border border-zinc-800/60 rounded-3xl my-2">
                    <p className="text-zinc-300 font-medium text-sm mb-1">No habits scheduled for today</p>
                    <p className="text-zinc-500 text-xs mb-3">
                      All your active habits are scheduled for other weekdays or are monthly goals.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onTabChange('weekly')}
                        className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors"
                      >
                        View Weekly Schedule
                      </button>
                      {monthlyHabits.length > 0 && (
                        <button
                          onClick={() => onTabChange('monthly')}
                          className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-colors"
                        >
                          View Monthly Goals
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {scheduledTodayHabits.map((habit) => {
                      const isCompleted = isHabitCompletedToday(
                        habit,
                        completions[habit.id] || [],
                        today
                      );
                      return (
                        <HabitCardToday
                          key={habit.id}
                          habit={habit}
                          isCompleted={isCompleted}
                          onToggleComplete={() => onToggleHabitDate(habit.id, todayKey)}
                          onOpenDetail={() => onOpenHabitDetail(habit.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= WEEKLY TAB ================= */}
            {activeTab === 'weekly' && (
              <div id="tab-content-weekly" className="space-y-4 pt-1">
                {weeklyHabits.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-[#18181B] border border-zinc-800/60 rounded-3xl my-2">
                    <p className="text-zinc-300 font-medium text-sm mb-1">No daily or weekly habits</p>
                    <p className="text-zinc-500 text-xs mb-3">
                      Create daily habits or habits with specific weekday schedules.
                    </p>
                    <button
                      onClick={onOpenCreateHabit}
                      className="px-4 py-2 bg-[#EF5D5D] hover:bg-[#E04D4D] text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      Add Habit
                    </button>
                  </div>
                ) : (
                  weeklyHabits.map((habit) => (
                    <WeeklyHabitCard
                      key={habit.id}
                      habit={habit}
                      completedDates={completions[habit.id] || []}
                      onToggleDay={(dateKey) => onToggleHabitDate(habit.id, dateKey)}
                      onOpenDetail={() => onOpenHabitDetail(habit.id)}
                    />
                  ))
                )}
              </div>
            )}

            {/* ================= MONTHLY TAB ================= */}
            {activeTab === 'monthly' && (
              <div id="tab-content-monthly" className="space-y-4">
                {/* Dynamic Month Header & Overall Monthly Progress */}
                <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4 sm:p-5 shadow-md">
                  {/* Dynamic Month and Year */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {currentMonthYear}
                        </h2>
                        <p className="text-xs text-zinc-400">Monthly Habit Session</p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {formattedMonthlyPercent}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#27272A] h-2 rounded-full overflow-hidden mb-2">
                    <div
                      style={{ width: `${rawMonthlyPercent}%` }}
                      className="bg-[#EF5D5D] h-full transition-all duration-300 rounded-full"
                    />
                  </div>

                  {/* Monthly Completion Count Indicator */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-0.5">
                    <span className="font-medium text-zinc-300">
                      {completedMonthlyCount} of {totalMonthly} completed
                    </span>
                    <span>1 target per month</span>
                  </div>
                </div>

                {/* Monthly Habit List */}
                {monthlyHabits.length === 0 ? (
                  <div className="text-center py-12 px-6 bg-[#18181B] border border-zinc-800/60 rounded-3xl my-2">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                      📊
                    </div>
                    <h3 className="text-white font-medium text-base mb-1">No monthly habits yet</h3>
                    <p className="text-zinc-400 text-xs max-w-xs mx-auto mb-4">
                      Monthly habits have 1 completion target per calendar month and help you track monthly reviews, goals, and habits.
                    </p>
                    <button
                      id="create-monthly-habit-btn"
                      onClick={onOpenCreateHabit}
                      className="px-4 py-2 bg-[#EF5D5D] hover:bg-[#E04D4D] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      Create Monthly Habit
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {monthlyHabits.map((habit) => (
                      <MonthlyHabitCard
                        key={habit.id}
                        habit={habit}
                        completedDates={completions[habit.id] || []}
                        onToggleMonthly={() => onToggleHabitDate(habit.id, todayKey)}
                        onOpenDetail={() => onOpenHabitDetail(habit.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
