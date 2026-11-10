import { useState, useEffect } from 'react';
import { Habit, CompletionsMap, JournalNote, Routine, TabType, MainNavTab } from './types';
import {
  loadHabits,
  saveHabits,
  loadCompletions,
  saveCompletions,
  loadNotes,
  saveNotes,
  loadRoutines,
  saveRoutines,
} from './services/storage';
import { getTodayKey, isHabitScheduledForDate } from './services/streaks';

import { HabitsPage } from './pages/HabitsPage';
import { HabitDetailPage } from './pages/HabitDetailPage';
import { CreateEditHabitPage } from './pages/CreateEditHabitPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { JournalPage } from './pages/JournalPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { BottomNavigation } from './components/BottomNavigation';

type ViewMode =
  | 'habits'
  | 'habit_detail'
  | 'create_habit'
  | 'edit_habit'
  | 'analytics'
  | 'journal'
  | 'routines';

export default function App() {
  // Persistent State
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [completions, setCompletions] = useState<CompletionsMap>(() => loadCompletions());
  const [notes, setNotes] = useState<JournalNote[]>(() => loadNotes());
  const [routines, setRoutines] = useState<Routine[]>(() => loadRoutines());

  // Navigation State
  const [view, setView] = useState<ViewMode>('habits');
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [mainNavTab, setMainNavTab] = useState<MainNavTab>('habits');

  // Contextual Selection State
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [journalHabitFilter, setJournalHabitFilter] = useState<string | null>(null);
  const [analyticsHabitFilter, setAnalyticsHabitFilter] = useState<string | 'all'>('all');

  // Synchronize to localStorage
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveCompletions(completions);
  }, [completions]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  // Handle Habit completion toggling for any date
  const handleToggleHabitDate = (habitId: string, dateKey: string) => {
    const habit = habits.find((h) => h.id === habitId);
    setCompletions((prev) => {
      const currentList = prev[habitId] || [];
      if (habit?.repeatType === 'monthly') {
        const monthPrefix = dateKey.slice(0, 7);
        const hasMonthCompletion = currentList.some((d) => d.startsWith(monthPrefix));
        const updatedList = hasMonthCompletion
          ? currentList.filter((d) => !d.startsWith(monthPrefix))
          : [...currentList, dateKey];
        return { ...prev, [habitId]: updatedList };
      } else {
        const isCompleted = currentList.includes(dateKey);
        const updatedList = isCompleted
          ? currentList.filter((d) => d !== dateKey)
          : [...currentList, dateKey];
        return { ...prev, [habitId]: updatedList };
      }
    });
  };

  // Mark all scheduled habits completed today (excluding monthly habits)
  const handleMarkAllToday = () => {
    const today = new Date();
    const todayKey = getTodayKey();
    const scheduledHabits = habits.filter(
      (h) => h.repeatType !== 'monthly' && isHabitScheduledForDate(h, today)
    );
    setCompletions((prev) => {
      const nextMap = { ...prev };
      scheduledHabits.forEach((h) => {
        const list = nextMap[h.id] || [];
        if (!list.includes(todayKey)) {
          nextMap[h.id] = [...list, todayKey];
        }
      });
      return nextMap;
    });
  };

  // Reset scheduled habits for today (excluding monthly habits)
  const handleResetToday = () => {
    const today = new Date();
    const todayKey = getTodayKey();
    const scheduledHabits = habits.filter(
      (h) => h.repeatType !== 'monthly' && isHabitScheduledForDate(h, today)
    );
    setCompletions((prev) => {
      const nextMap = { ...prev };
      scheduledHabits.forEach((h) => {
        const list = nextMap[h.id] || [];
        nextMap[h.id] = list.filter((d) => d !== todayKey);
      });
      return nextMap;
    });
  };

  // Habit CRUD
  const handleSaveHabit = (
    habitData: Omit<Habit, 'id' | 'createdAt'>,
    habitId?: string
  ) => {
    if (habitId) {
      // Edit existing
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, ...habitData }
            : h
        )
      );
      // Update assigned routine
      if (habitData.routineId) {
        setRoutines((prev) =>
          prev.map((r) =>
            r.id === habitData.routineId && !r.habitIds.includes(habitId)
              ? { ...r, habitIds: [...r.habitIds, habitId] }
              : r
          )
        );
      }
      setSelectedHabitId(habitId);
      setView('habit_detail');
    } else {
      // Create new
      const newId = `habit_${Date.now()}`;
      const newHabit: Habit = {
        ...habitData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      setHabits((prev) => [newHabit, ...prev]);

      if (habitData.routineId) {
        setRoutines((prev) =>
          prev.map((r) =>
            r.id === habitData.routineId
              ? { ...r, habitIds: [...r.habitIds, newId] }
              : r
          )
        );
      }

      setView('habits');
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    // Remove completions
    setCompletions((prev) => {
      const copy = { ...prev };
      delete copy[habitId];
      return copy;
    });
    // Remove habit from routines
    setRoutines((prev) =>
      prev.map((r) => ({
        ...r,
        habitIds: r.habitIds.filter((id) => id !== habitId),
      }))
    );
    // Unlink notes
    setNotes((prev) =>
      prev.map((n) => (n.habitId === habitId ? { ...n, habitId: null } : n))
    );

    setSelectedHabitId(null);
    setView('habits');
  };

  // Journal Notes CRUD
  const handleSaveNote = (
    noteData: Omit<JournalNote, 'id' | 'createdAt'>,
    noteId?: string
  ) => {
    if (noteId) {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, ...noteData } : n))
      );
    } else {
      const newNote: JournalNote = {
        ...noteData,
        id: `note_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Routines CRUD
  const handleSaveRoutine = (
    routineData: Omit<Routine, 'id' | 'createdAt'>,
    routineId?: string
  ) => {
    if (routineId) {
      setRoutines((prev) =>
        prev.map((r) => (r.id === routineId ? { ...r, ...routineData } : r))
      );
    } else {
      const newRoutine: Routine = {
        ...routineData,
        id: `routine_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setRoutines((prev) => [...prev, newRoutine]);
    }
  };

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    // Unlink habits from routine
    setHabits((prev) =>
      prev.map((h) => (h.routineId === routineId ? { ...h, routineId: null } : h))
    );
  };

  // Navigation Handlers
  const handleBottomNavChange = (tab: MainNavTab) => {
    setMainNavTab(tab);
    if (tab === 'habits') {
      setView('habits');
    } else if (tab === 'analytics') {
      setAnalyticsHabitFilter('all');
      setView('analytics');
    } else if (tab === 'routines') {
      setView('routines');
    }
  };

  const openHabitDetail = (habitId: string) => {
    setSelectedHabitId(habitId);
    setView('habit_detail');
  };

  const openCreateHabit = () => {
    setHabitToEdit(null);
    setView('create_habit');
  };

  const openEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setView('edit_habit');
  };

  const openJournalFromHabit = (habitId: string) => {
    setJournalHabitFilter(habitId);
    setView('journal');
  };

  const openAnalyticsFromHabit = (habitId: string) => {
    setAnalyticsHabitFilter(habitId);
    setMainNavTab('analytics');
    setView('analytics');
  };

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center selection:bg-zinc-800">
      {/* Mobile-Proportional Container */}
      <div className="w-full max-w-md min-h-screen bg-black relative flex flex-col shadow-2xl border-x border-zinc-900/50">
        
        {/* VIEW ROUTER */}
        {view === 'habits' && (
          <HabitsPage
            habits={habits}
            completions={completions}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onToggleHabitDate={handleToggleHabitDate}
            onOpenHabitDetail={openHabitDetail}
            onOpenCreateHabit={openCreateHabit}
            onOpenJournal={() => {
              setJournalHabitFilter(null);
              setView('journal');
            }}
            onOpenRoutines={() => {
              setMainNavTab('routines');
              setView('routines');
            }}
            onMarkAllToday={handleMarkAllToday}
            onResetToday={handleResetToday}
          />
        )}

        {view === 'habit_detail' && selectedHabit && (
          <HabitDetailPage
            habit={selectedHabit}
            completions={completions}
            notes={notes}
            onBack={() => setView('habits')}
            onEditHabit={openEditHabit}
            onDeleteHabit={handleDeleteHabit}
            onToggleDate={handleToggleHabitDate}
            onOpenAnalytics={openAnalyticsFromHabit}
            onAddNoteForHabit={openJournalFromHabit}
          />
        )}

        {(view === 'create_habit' || view === 'edit_habit') && (
          <CreateEditHabitPage
            initialHabit={view === 'edit_habit' ? habitToEdit : null}
            routines={routines}
            onBack={() => {
              if (view === 'edit_habit' && selectedHabitId) {
                setView('habit_detail');
              } else {
                setView('habits');
              }
            }}
            onSave={handleSaveHabit}
          />
        )}

        {view === 'analytics' && (
          <AnalyticsPage
            habits={habits}
            completions={completions}
            initialSelectedHabitId={analyticsHabitFilter}
            onBack={() => {
              setMainNavTab('habits');
              setView('habits');
            }}
            onOpenCreateHabit={openCreateHabit}
          />
        )}

        {view === 'journal' && (
          <JournalPage
            notes={notes}
            habits={habits}
            preselectedHabitId={journalHabitFilter}
            onBack={() => {
              if (selectedHabitId) {
                setView('habit_detail');
              } else {
                setView('habits');
              }
            }}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {view === 'routines' && (
          <RoutinesPage
            routines={routines}
            habits={habits}
            onBack={() => {
              setMainNavTab('habits');
              setView('habits');
            }}
            onSaveRoutine={handleSaveRoutine}
            onDeleteRoutine={handleDeleteRoutine}
            onOpenHabitDetail={openHabitDetail}
          />
        )}

        {/* BOTTOM NAVIGATION (shown on main screens) */}
        {(view === 'habits' || view === 'analytics' || view === 'routines') && (
          <BottomNavigation
            currentTab={mainNavTab}
            onChangeTab={handleBottomNavChange}
          />
        )}
      </div>
    </div>
  );
}
