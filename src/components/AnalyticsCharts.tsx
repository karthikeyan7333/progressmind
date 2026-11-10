import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Habit, CompletionsMap } from '../types';
import { formatDateKey, getTodayKey, isHabitScheduledForDate, isMonthlyHabitCompletedInMonth } from '../services/streaks';

interface AnalyticsChartsProps {
  habits: Habit[];
  completions: CompletionsMap;
  selectedHabitId: string | 'all';
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  habits,
  completions,
  selectedHabitId,
}) => {
  const activeHabits = selectedHabitId === 'all' 
    ? habits 
    : habits.filter((h) => h.id === selectedHabitId);

  const today = new Date();
  const todayKey = getTodayKey();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // 1. Overall Trend Data (Past 30 days score progression)
  const trendData: { dateLabel: string; score: number }[] = [];
  
  for (let i = 28; i >= 0; i -= 4) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    let totalScheduled = 0;
    let totalCompleted = 0;

    // Check up to date d over previous 7 days window
    const windowStart = new Date(d);
    windowStart.setDate(windowStart.getDate() - 6);

    const runner = new Date(windowStart);
    while (runner <= d) {
      const k = formatDateKey(runner);
      activeHabits.forEach((h) => {
        if (h.repeatType === 'daily') {
          totalScheduled += 1;
          const userCompletions = completions[h.id] || [];
          if (userCompletions.includes(k)) {
            totalCompleted += 1;
          }
        } else if (h.repeatType === 'weekly') {
          if (isHabitScheduledForDate(h, runner)) {
            totalScheduled += 1;
            const userCompletions = completions[h.id] || [];
            if (userCompletions.includes(k)) {
              totalCompleted += 1;
            }
          }
        }
      });
      runner.setDate(runner.getDate() + 1);
    }

    // Monthly habits in the window
    activeHabits.forEach((h) => {
      if (h.repeatType === 'monthly') {
        totalScheduled += 1;
        const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const userCompletions = completions[h.id] || [];
        const isDone = userCompletions.some((c) => c.startsWith(prefix) && c <= formatDateKey(d));
        if (isDone) {
          totalCompleted += 1;
        }
      }
    });

    const score = totalScheduled > 0
      ? Math.min(100, Math.round((totalCompleted / totalScheduled) * 100))
      : 0;
    const dateLabel = `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
    trendData.push({ dateLabel, score });
  }

  // 2. Weekly Bar Graph (Mon to Sun of current week)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const day = today.getDay(); // 0 is Sun
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  let weeklyTotal = 0;
  const weeklyData = dayLabels.map((lbl, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const key = formatDateKey(d);

    let count = 0;
    activeHabits.forEach((h) => {
      const userCompletions = completions[h.id] || [];
      if (userCompletions.includes(key)) {
        count += 1;
      }
    });

    weeklyTotal += count;
    return {
      day: lbl,
      completed: count,
    };
  });

  // 3. Monthly Bar Graph (Weeks of Current Month)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthlyData: { label: string; count: number }[] = [];
  let monthlyTotal = 0;

  // Group month into 4 or 5 weeks
  const weekRanges = [
    { label: 'W1', start: 1, end: 7 },
    { label: 'W2', start: 8, end: 14 },
    { label: 'W3', start: 15, end: 21 },
    { label: 'W4', start: 22, end: Math.min(28, daysInMonth) },
  ];
  if (daysInMonth > 28) {
    weekRanges.push({ label: 'W5', start: 29, end: daysInMonth });
  }

  weekRanges.forEach((range) => {
    let weekCount = 0;
    for (let d = range.start; d <= range.end; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const k = formatDateKey(dateObj);
      activeHabits.forEach((h) => {
        const userCompletions = completions[h.id] || [];
        if (userCompletions.includes(k)) {
          weekCount += 1;
        }
      });
    }
    monthlyTotal += weekCount;
    monthlyData.push({
      label: range.label,
      count: weekCount,
    });
  });

  // 4. Heatmap Data (Current Month with correct weekday start offset)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;

  interface HeatmapCell {
    dayNum: number;
    dateKey: string;
    completedCount: number;
    scheduledCount: number;
    isScheduled: boolean;
    isCompleted: boolean;
    isToday: boolean;
  }

  const heatmapDays: HeatmapCell[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dateKey = formatDateKey(dateObj);
    const isToday = dateKey === todayKey;

    let completedCount = 0;
    let scheduledCount = 0;
    let isScheduled = false;
    let isCompleted = false;

    if (selectedHabitId !== 'all') {
      const singleHabit = activeHabits[0];
      if (singleHabit) {
        if (singleHabit.repeatType === 'monthly') {
          isScheduled = true;
          isCompleted = isMonthlyHabitCompletedInMonth(completions[singleHabit.id] || [], currentYear, currentMonth);
          scheduledCount = 1;
          completedCount = isCompleted ? 1 : 0;
        } else {
          isScheduled = isHabitScheduledForDate(singleHabit, dateObj);
          isCompleted = (completions[singleHabit.id] || []).includes(dateKey);
          scheduledCount = isScheduled ? 1 : 0;
          completedCount = isCompleted ? 1 : 0;
        }
      }
    } else {
      activeHabits.forEach((h) => {
        if (h.repeatType === 'monthly') {
          const userCompletions = completions[h.id] || [];
          if (userCompletions.includes(dateKey)) {
            completedCount += 1;
          }
          scheduledCount += 1;
        } else {
          const sched = isHabitScheduledForDate(h, dateObj);
          if (sched) {
            scheduledCount += 1;
          }
          const userCompletions = completions[h.id] || [];
          if (userCompletions.includes(dateKey)) {
            completedCount += 1;
          }
        }
      });
      isScheduled = scheduledCount > 0;
      isCompleted = completedCount > 0;
    }

    heatmapDays.push({
      dayNum: d,
      dateKey,
      completedCount,
      scheduledCount,
      isScheduled,
      isCompleted,
      isToday,
    });
  }

  // Trailing offset to complete the 7-column grid
  const trailingOffset = (7 - ((startOffset + daysInMonth) % 7)) % 7;

  const primaryColor = selectedHabitId !== 'all' 
    ? (habits.find(h => h.id === selectedHabitId)?.color || '#2563EB')
    : '#2563EB';

  return (
    <div id="analytics-charts-container" className="space-y-5 pb-8">
      {/* 1. Overall Completion Trend */}
      <div className="bg-[#18181B] border border-zinc-800/60 rounded-3xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-300">Average Score of Habits</h3>
          <span className="text-xs text-zinc-500 font-medium">Trend</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fill: '#71717A', fontSize: 10 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fill: '#71717A', fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272A',
                  borderColor: '#3F3F46',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(val: any) => [`${val}%`, 'Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke={primaryColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#analyticsTrendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Weekly Completion Bar Graph */}
      <div className="bg-[#18181B] border border-zinc-800/60 rounded-3xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-zinc-300">Habits completed</h3>
          <span className="text-xs text-zinc-500 font-medium">This Week</span>
        </div>
        <div className="mb-3">
          <span className="text-2xl font-bold text-white">{weeklyTotal}</span>
          <span className="text-xs text-zinc-500 ml-2">Total completed</span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#71717A', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#71717A', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272A',
                  borderColor: '#3F3F46',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(val: any) => [val, 'Completed']}
              />
              <Bar 
                dataKey="completed" 
                fill={primaryColor} 
                radius={[6, 6, 0, 0]} 
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Monthly Completion Graph */}
      <div className="bg-[#18181B] border border-zinc-800/60 rounded-3xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-zinc-300">Habits completed</h3>
          <span className="text-xs text-zinc-500 font-medium">
            {today.toLocaleDateString('en-US', { month: 'short' })}
          </span>
        </div>
        <div className="mb-3">
          <span className="text-2xl font-bold text-white">{monthlyTotal}</span>
          <span className="text-xs text-zinc-500 ml-2">Monthly total</span>
        </div>

        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#71717A', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#71717A', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272A',
                  borderColor: '#3F3F46',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(val: any) => [val, 'Completed']}
              />
              <Bar 
                dataKey="count" 
                fill="#3B82F6" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Habit Completion Heatmap */}
      <div className="bg-[#18181B] border border-zinc-800/60 rounded-3xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-300">Habit heatmap</h3>
          <span className="text-xs text-zinc-500 font-medium">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Heatmap Grid with correct weekday alignment */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-xs font-semibold text-zinc-500 mb-1">
              {d}
            </span>
          ))}

          {/* Leading blank offset cells for start of month */}
          {Array.from({ length: startOffset }).map((_, idx) => (
            <div
              key={`heatmap-blank-prev-${idx}`}
              className="w-full aspect-square rounded-lg bg-zinc-900/20 border border-zinc-800/20"
              aria-hidden="true"
            />
          ))}

          {/* Current Month Days */}
          {heatmapDays.map((item) => {
            let bgColor = '#27272A';
            let textColor = 'text-zinc-400';

            if (selectedHabitId !== 'all') {
              if (item.isCompleted) {
                bgColor = primaryColor;
                textColor = 'text-white font-bold';
              } else if (!item.isScheduled) {
                bgColor = '#18181B';
                textColor = 'text-zinc-600';
              }
            } else {
              if (item.completedCount > 0) {
                const ratio = item.scheduledCount > 0 ? item.completedCount / item.scheduledCount : 1;
                bgColor = ratio < 0.5 ? '#1D4ED8' : '#3B82F6';
                textColor = 'text-white font-semibold';
              }
            }

            return (
              <div
                key={item.dateKey}
                style={{ backgroundColor: bgColor }}
                title={`${item.dateKey}: ${item.completedCount} completed`}
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs transition-transform hover:scale-105 select-none ${textColor} ${
                  item.isToday ? 'ring-2 ring-white/60 font-bold' : ''
                }`}
              >
                {item.dayNum}
              </div>
            );
          })}

          {/* Trailing blank cells to complete the 7-column grid */}
          {Array.from({ length: trailingOffset }).map((_, idx) => (
            <div
              key={`heatmap-blank-next-${idx}`}
              className="w-full aspect-square rounded-lg bg-zinc-900/20 border border-zinc-800/20"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

