import { Habit, HabitStats } from '../types';

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD to Date object at local midnight
 */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date key YYYY-MM-DD
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Safely normalize selectedDays from any stored format (array of numbers, day names, etc.)
 * 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
 */
export function normalizeSelectedDays(days: any): number[] {
  if (!days || !Array.isArray(days) || days.length === 0) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const dayNameMap: Record<string, number> = {
    mon: 0, monday: 0, '0': 0,
    tue: 1, tuesday: 1, '1': 1,
    wed: 2, wednesday: 2, '2': 2,
    thu: 3, thursday: 3, '3': 3,
    fri: 4, friday: 4, '4': 4,
    sat: 5, saturday: 5, '5': 5,
    sun: 6, sunday: 6, '6': 6,
  };
  const result: number[] = [];
  days.forEach((d) => {
    if (typeof d === 'number' && d >= 0 && d <= 6) {
      result.push(d);
    } else if (typeof d === 'string') {
      const lower = d.toLowerCase().trim();
      if (dayNameMap[lower] !== undefined) {
        result.push(dayNameMap[lower]);
      } else if (!isNaN(Number(lower))) {
        const num = Number(lower);
        if (num >= 0 && num <= 6) result.push(num);
      }
    }
  });
  return result.length > 0
    ? Array.from(new Set(result)).sort((a, b) => a - b)
    : [0, 1, 2, 3, 4, 5, 6];
}

/**
 * Check if a date falls on an active scheduled day for a habit
 * - Daily: scheduled every day (Mon-Sun)
 * - Weekly: scheduled ONLY on habit.selectedDays (0=Mon, 1=Tue, ..., 6=Sun)
 * - Monthly: active throughout the month
 */
export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  if (!habit) return false;
  if (habit.repeatType === 'daily') {
    return true;
  }
  if (habit.repeatType === 'weekly') {
    const dayOfWeek = (date.getDay() + 6) % 7; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
    const selected = normalizeSelectedDays(habit.selectedDays);
    return selected.includes(dayOfWeek);
  }
  if (habit.repeatType === 'monthly') {
    return false;
  }
  return false;
}

/**
 * Check if a monthly habit has at least 1 completion in the specified month
 */
export function isMonthlyHabitCompletedInMonth(
  completedDates: string[],
  year: number,
  monthIndex: number
): boolean {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  return (completedDates || []).some((d) => d.startsWith(prefix));
}

/**
 * Check if a habit is completed for today / current period
 */
export function isHabitCompletedToday(
  habit: Habit,
  completedDates: string[],
  referenceDate: Date = new Date()
): boolean {
  const todayKey = formatDateKey(referenceDate);
  if (habit.repeatType === 'monthly') {
    return isMonthlyHabitCompletedInMonth(
      completedDates,
      referenceDate.getFullYear(),
      referenceDate.getMonth()
    );
  }
  return (completedDates || []).includes(todayKey);
}

/**
 * Calculate weekly progress for a habit for the week containing referenceDate
 * Expected:
 * - Daily: 7 (or number of selected days)
 * - Weekly: number of selected weekdays in the week (e.g. 2 for Tue+Fri)
 * - Monthly: 1
 * Progress: completed scheduled / expected scheduled * 100
 */
export function calculateWeeklyHabitProgress(
  habit: Habit,
  completedDates: string[],
  referenceDate: Date = new Date()
): { completed: number; expected: number; percentage: number } {
  const completedSet = new Set(completedDates || []);
  const current = new Date(referenceDate);
  const day = current.getDay(); // 0 is Sun
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  if (habit.repeatType === 'monthly') {
    const isDone = isMonthlyHabitCompletedInMonth(
      completedDates,
      current.getFullYear(),
      current.getMonth()
    );
    return {
      completed: isDone ? 1 : 0,
      expected: 1,
      percentage: isDone ? 100 : 0,
    };
  }

  if (habit.repeatType === 'weekly') {
    const selected = normalizeSelectedDays(habit.selectedDays);
    const expected = selected.length;
    let completed = 0;

    selected.forEach((dayIdx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + dayIdx);
      const key = formatDateKey(d);
      if (completedSet.has(key)) {
        completed += 1;
      }
    });

    const percentage = expected > 0 ? Math.min(100, Math.round((completed / expected) * 100)) : 0;
    return { completed, expected, percentage };
  }

  // Daily
  const expected = 7;
  let completed = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = formatDateKey(d);
    if (completedSet.has(key)) {
      completed += 1;
    }
  }

  const percentage = Math.min(100, Math.round((completed / expected) * 100));
  return { completed, expected, percentage };
}

/**
 * Calculate monthly progress for a habit for the specified year and monthIndex
 * Expected:
 * - Daily: number of days in the month (e.g. 31 for August)
 * - Weekly: number of selected weekdays occurring in that month (e.g. 4 Tuesdays + 4 Fridays = 8)
 * - Monthly: 1
 */
export function calculateMonthlyHabitProgress(
  habit: Habit,
  completedDates: string[],
  year: number,
  monthIndex: number
): { completed: number; expected: number; percentage: number } {
  const completedSet = new Set(completedDates || []);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  if (habit.repeatType === 'monthly') {
    const isDone = isMonthlyHabitCompletedInMonth(completedDates, year, monthIndex);
    return {
      completed: isDone ? 1 : 0,
      expected: 1,
      percentage: isDone ? 100 : 0,
    };
  }

  if (habit.repeatType === 'weekly') {
    const selected = normalizeSelectedDays(habit.selectedDays);
    let expected = 0;
    let completed = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, monthIndex, d);
      const dayOfWeek = (dateObj.getDay() + 6) % 7;
      if (selected.includes(dayOfWeek)) {
        expected += 1;
        const key = formatDateKey(dateObj);
        if (completedSet.has(key)) {
          completed += 1;
        }
      }
    }

    const percentage = expected > 0 ? Math.min(100, Math.round((completed / expected) * 100)) : 0;
    return { completed, expected, percentage };
  }

  // Daily
  const expected = daysInMonth;
  let completed = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const key = formatDateKey(dateObj);
    if (completedSet.has(key)) {
      completed += 1;
    }
  }

  const percentage = expected > 0 ? Math.min(100, Math.round((completed / expected) * 100)) : 0;
  return { completed, expected, percentage };
}

/**
 * Get human readable frequency string
 */
export function getHabitFrequencyLabel(habit: Habit): string {
  if (habit.repeatType === 'daily') {
    return 'Everyday';
  }
  if (habit.repeatType === 'weekly') {
    const days = normalizeSelectedDays(habit.selectedDays);
    if (days.length === 7) return 'Everyday (7 days/wk)';
    if (days.length === 5 && !days.includes(5) && !days.includes(6)) {
      return 'Weekdays (5 days/wk)';
    }
    if (days.length === 2 && days.includes(5) && days.includes(6)) {
      return 'Weekends (2 days/wk)';
    }
    const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (days.length === 1) {
      return `Every ${dayFull[days[0]]}`;
    }
    if (days.length === 2) {
      return `${dayShort[days[0]]} & ${dayShort[days[1]]} (${days.length} days/wk)`;
    }
    if (days.length <= 3) {
      const names = days.map((d) => dayShort[d]).join(', ');
      return `${names} (${days.length} days/wk)`;
    }
    return `${days.length} days a week`;
  }
  if (habit.repeatType === 'monthly') {
    return '1 time a month';
  }
  return 'Everyday';
}

/**
 * Calculate accurate habit statistics based on habit type (Daily, Weekly, Monthly)
 */
export function calculateHabitStats(habit: Habit, completedDates: string[]): HabitStats {
  const completedList = completedDates || [];
  const completedSet = new Set(completedList);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatDateKey(today);

  // 1. MONTHLY HABIT
  if (habit.repeatType === 'monthly') {
    const completedMonths = new Set<string>();
    completedList.forEach((k) => {
      const monthPrefix = k.slice(0, 7); // YYYY-MM
      completedMonths.add(monthPrefix);
    });
    const total = completedMonths.size;

    const currentMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const isCurrentMonthCompleted = completedMonths.has(currentMonthPrefix);
    const score = isCurrentMonthCompleted ? 100 : 0;

    let currentStreak = 0;
    let bestStreak = 0;

    if (total > 0) {
      let checkYear = today.getFullYear();
      let checkMonth = today.getMonth();

      if (!isCurrentMonthCompleted) {
        checkMonth -= 1;
        if (checkMonth < 0) {
          checkMonth = 11;
          checkYear -= 1;
        }
      }

      while (true) {
        const prefix = `${checkYear}-${String(checkMonth + 1).padStart(2, '0')}`;
        if (completedMonths.has(prefix)) {
          currentStreak += 1;
          checkMonth -= 1;
          if (checkMonth < 0) {
            checkMonth = 11;
            checkYear -= 1;
          }
        } else {
          break;
        }
      }

      const sortedMonths = Array.from(completedMonths).sort();
      let tempStreak = 0;
      let prevYear = -1;
      let prevMonth = -1;

      sortedMonths.forEach((mStr) => {
        const [y, m] = mStr.split('-').map(Number);
        if (prevYear === -1) {
          tempStreak = 1;
        } else {
          const expectedMonth = (prevMonth % 12) + 1;
          const expectedYear = prevMonth === 12 ? prevYear + 1 : prevYear;
          if (y === expectedYear && m === expectedMonth) {
            tempStreak += 1;
          } else {
            tempStreak = 1;
          }
        }
        prevYear = y;
        prevMonth = m;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      });
      bestStreak = Math.max(bestStreak, currentStreak);
    }

    return {
      score,
      total,
      bestStreak,
      currentStreak,
    };
  }

  // 2. WEEKLY HABIT
  if (habit.repeatType === 'weekly') {
    const selectedDays = normalizeSelectedDays(habit.selectedDays);

    let total = 0;
    completedList.forEach((k) => {
      const d = parseDateKey(k);
      const dayOfWeek = (d.getDay() + 6) % 7;
      if (selectedDays.includes(dayOfWeek)) {
        total += 1;
      }
    });

    if (total === 0 && completedList.length === 0) {
      return { score: 0, total: 0, bestStreak: 0, currentStreak: 0 };
    }

    // Weekly progress score for current week
    const weekProgress = calculateWeeklyHabitProgress(habit, completedList, today);
    const score = weekProgress.percentage;

    // Calculate streaks across scheduled days
    let bestStreak = 0;
    let currentStreak = 0;

    const sortedCompletions = Array.from(completedSet).sort();
    const firstDate = sortedCompletions.length > 0 ? parseDateKey(sortedCompletions[0]) : new Date(today);
    firstDate.setHours(0, 0, 0, 0);

    const runner = new Date(firstDate);
    let tempStreak = 0;

    while (runner <= today) {
      const dayOfWeek = (runner.getDay() + 6) % 7;
      const isScheduled = selectedDays.includes(dayOfWeek);
      const k = formatDateKey(runner);
      const isDone = completedSet.has(k);

      if (isScheduled) {
        if (isDone) {
          tempStreak += 1;
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak;
          }
        } else if (runner.getTime() !== today.getTime()) {
          tempStreak = 0;
        }
      }
      runner.setDate(runner.getDate() + 1);
    }

    let checkDate = new Date(today);
    const todayDayOfWeek = (today.getDay() + 6) % 7;
    const todayScheduled = selectedDays.includes(todayDayOfWeek);

    if (todayScheduled && !completedSet.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (checkDate >= firstDate) {
      const dayOfWeek = (checkDate.getDay() + 6) % 7;
      const isScheduled = selectedDays.includes(dayOfWeek);
      const k = formatDateKey(checkDate);

      if (isScheduled) {
        if (completedSet.has(k)) {
          currentStreak += 1;
        } else {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    bestStreak = Math.max(bestStreak, currentStreak);

    return {
      score,
      total,
      bestStreak,
      currentStreak,
    };
  }

  // 3. DAILY HABIT
  const total = completedSet.size;
  if (total === 0) {
    return { score: 0, total: 0, bestStreak: 0, currentStreak: 0 };
  }

  const sortedDates = Array.from(completedSet).sort();
  const firstDate = parseDateKey(sortedDates[0]);
  firstDate.setHours(0, 0, 0, 0);

  let bestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;
  const runner = new Date(firstDate);

  while (runner <= today) {
    const key = formatDateKey(runner);
    if (completedSet.has(key)) {
      tempStreak += 1;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else if (runner.getTime() !== today.getTime()) {
      tempStreak = 0;
    }
    runner.setDate(runner.getDate() + 1);
  }

  let checkDate = new Date(today);
  if (!completedSet.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (checkDate >= firstDate) {
    const key = formatDateKey(checkDate);
    if (completedSet.has(key)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  // Score in current week
  const weekProgress = calculateWeeklyHabitProgress(habit, completedList, today);
  const score = weekProgress.percentage;

  return {
    score,
    total,
    bestStreak,
    currentStreak,
  };
}

/**
 * Get 7 days for the current or specified week (Monday to Sunday)
 */
export function getWeekDates(referenceDate: Date = new Date()): {
  date: Date;
  key: string;
  dayIndex: number;
  label: string;
  shortName: string;
}[] {
  const current = new Date(referenceDate);
  const day = current.getDay(); // 0 is Sun
  const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
  const monday = new Date(current);
  monday.setDate(current.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shortLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      key: formatDateKey(d),
      dayIndex: i,
      label: dayLabels[i],
      shortName: shortLabels[i],
    };
  });
}

/**
 * Get days for a calendar month grid (Monday aligned)
 */
export function getMonthCalendarGrid(year: number, monthIndex: number): {
  date: Date;
  key: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  const todayKey = getTodayKey();

  const startDay = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  const grid: {
    date: Date;
    key: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const d = new Date(year, monthIndex - 1, dayNum);
    grid.push({
      date: d,
      key: formatDateKey(d),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: formatDateKey(d) === todayKey,
    });
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, monthIndex, dayNum);
    grid.push({
      date: d,
      key: formatDateKey(d),
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: formatDateKey(d) === todayKey,
    });
  }

  const remaining = (7 - (grid.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, monthIndex + 1, i);
    grid.push({
      date: d,
      key: formatDateKey(d),
      dayNumber: i,
      isCurrentMonth: false,
      isToday: formatDateKey(d) === todayKey,
    });
  }

  return grid;
}

/**
 * Generate historical score data points for a habit
 */
export function getHabitScoreHistory(habit: Habit, completedDates: string[]): { label: string; score: number }[] {
  const completedSet = new Set(completedDates || []);
  if (completedSet.size === 0) return [];

  const points: { label: string; score: number }[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i * 8);
    
    let scheduled = 0;
    let completed = 0;
    const check = new Date(d);
    check.setDate(check.getDate() - 14);

    while (check <= d) {
      const k = formatDateKey(check);
      if (isHabitScheduledForDate(habit, check)) {
        scheduled += 1;
        if (completedSet.has(k)) completed += 1;
      }
      check.setDate(check.getDate() + 1);
    }

    const score = scheduled > 0 ? Math.min(100, Math.round((completed / scheduled) * 100)) : 0;
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    points.push({
      label: `${day} ${monthShort}`,
      score,
    });
  }

  return points;
}


