export type RepeatType = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: string; // e.g. '#24656D' (teal), '#9A5826' (orange/brown), etc.
  repeatType: RepeatType;
  selectedDays: number[]; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat, 6 = Sun
  reminderEnabled: boolean;
  goalEnabled: boolean;
  routineId: string | null;
  createdAt: string; // ISO date string
}

export interface JournalNote {
  id: string;
  title: string;
  content: string;
  habitId?: string | null;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Routine {
  id: string;
  name: string;
  habitIds: string[];
  createdAt: string;
}

export type CompletionsMap = Record<string, string[]>; // habitId -> array of 'YYYY-MM-DD' dates

export type TabType = 'today' | 'weekly' | 'monthly';

export type MainNavTab = 'habits' | 'analytics' | 'routines';

export interface HabitStats {
  score: number; // percentage 0-100
  total: number;
  bestStreak: number;
  currentStreak: number;
}
