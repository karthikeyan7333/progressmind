import { Habit, CompletionsMap, JournalNote, Routine } from '../types';
import { formatDateKey, getTodayKey } from './streaks';

const HABITS_KEY = 'habits_app_habits';
const COMPLETIONS_KEY = 'habits_app_completions';
const NOTES_KEY = 'habits_app_notes';
const ROUTINES_KEY = 'habits_app_routines';

// Initial seed data matching the reference screenshots
const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit_gym_1',
    emoji: '💪',
    title: 'Gym',
    description: 'Strength training and cardio workout',
    color: '#24656D', // Teal from screenshot
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: true,
    goalEnabled: false,
    routineId: 'routine_morning',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'habit_learn_2',
    emoji: '📚',
    title: 'Learn',
    description: 'Read 20 pages or practice coding',
    color: '#9A5826', // Orange/Amber from screenshot
    repeatType: 'weekly',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: false,
    goalEnabled: false,
    routineId: 'routine_morning',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'habit_review_3',
    emoji: '📊',
    title: 'Monthly Project Review',
    description: 'Review monthly progress and set goals',
    color: '#34526B',
    repeatType: 'monthly',
    selectedDays: [],
    reminderEnabled: false,
    goalEnabled: false,
    routineId: null,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'routine_morning',
    name: 'Morning Routine',
    habitIds: ['habit_gym_1', 'habit_learn_2'],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// Helper to seed recent completions for realistic UI
function getInitialCompletions(): CompletionsMap {
  const today = new Date();
  const gymCompletions: string[] = [];
  const learnCompletions: string[] = [];

  // Seed completions for today and previous days
  const todayKey = getTodayKey();
  gymCompletions.push(todayKey); // Gym completed today as shown in Screenshot 2: "1 completed"

  // Learn completed across the week as in Screenshot 1
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = formatDateKey(d);
    learnCompletions.push(k);
    if (i % 2 === 0 || i === 0) {
      gymCompletions.push(k);
    }
  }

  return {
    habit_gym_1: Array.from(new Set(gymCompletions)),
    habit_learn_2: Array.from(new Set(learnCompletions)),
  };
}

export function loadHabits(): Habit[] {
  try {
    const data = localStorage.getItem(HABITS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load habits from localStorage', e);
  }
  // Save initial seed
  saveHabits(INITIAL_HABITS);
  return INITIAL_HABITS;
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('Failed to save habits to localStorage', e);
  }
}

export function loadCompletions(): CompletionsMap {
  try {
    const data = localStorage.getItem(COMPLETIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load completions', e);
  }
  const initial = getInitialCompletions();
  saveCompletions(initial);
  return initial;
}

export function saveCompletions(completions: CompletionsMap): void {
  try {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
  } catch (e) {
    console.error('Failed to save completions', e);
  }
}

export function loadNotes(): JournalNote[] {
  try {
    const data = localStorage.getItem(NOTES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load notes', e);
  }
  return [];
}

export function saveNotes(notes: JournalNote[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}

export function loadRoutines(): Routine[] {
  try {
    const data = localStorage.getItem(ROUTINES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load routines', e);
  }
  saveRoutines(INITIAL_ROUTINES);
  return INITIAL_ROUTINES;
}

export function saveRoutines(routines: Routine[]): void {
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines));
  } catch (e) {
    console.error('Failed to save routines', e);
  }
}
