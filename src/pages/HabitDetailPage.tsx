import React, { useState } from 'react';
import { ArrowLeft, Share2, BookOpen, Trash2, Pencil } from 'lucide-react';
import { Habit, CompletionsMap, JournalNote } from '../types';
import { calculateHabitStats, getHabitFrequencyLabel } from '../services/streaks';
import { HabitStats } from '../components/HabitStats';
import { HabitCalendar } from '../components/HabitCalendar';
import { HabitScoreChart } from '../components/HabitScoreChart';
import { ConfirmModal } from '../components/ConfirmModal';

interface HabitDetailPageProps {
  habit: Habit;
  completions: CompletionsMap;
  notes: JournalNote[];
  onBack: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleDate: (habitId: string, dateKey: string) => void;
  onOpenAnalytics: (habitId: string) => void;
  onAddNoteForHabit: (habitId: string) => void;
  onOpenNoteDetail?: (note: JournalNote) => void;
}

export const HabitDetailPage: React.FC<HabitDetailPageProps> = ({
  habit,
  completions,
  notes,
  onBack,
  onEditHabit,
  onDeleteHabit,
  onToggleDate,
  onOpenAnalytics,
  onAddNoteForHabit,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const habitCompletions = completions[habit.id] || [];
  const stats = calculateHabitStats(habit, habitCompletions);
  const frequencyLabel = getHabitFrequencyLabel(habit);
  const habitNotes = notes.filter((n) => n.habitId === habit.id);

  const handleShare = async () => {
    const shareText = `My progress on ${habit.emoji} ${habit.title}:\n🔥 Current Streak: ${stats.currentStreak} days\n🏆 Best Streak: ${stats.bestStreak} days\n📈 Score: ${stats.score}% (${stats.total} total)`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${habit.emoji} ${habit.title} Habit`,
          text: shareText,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  return (
    <div id="habit-detail-page" className="w-full min-h-screen bg-black text-white pb-20">
      {/* Top Bar matching Screenshots 3 & 4 */}
      <header className="flex items-center justify-between pt-4 pb-3 px-5">
        <button
          id="detail-back-btn"
          onClick={onBack}
          aria-label="Go back"
          className="text-white hover:text-zinc-300 p-1.5 -ml-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex items-center gap-4 text-white">
          <button
            id="detail-share-btn"
            onClick={handleShare}
            aria-label="Share habit progress"
            className="hover:text-zinc-300 p-1 rounded-lg transition-colors"
          >
            <Share2 size={20} />
          </button>
          <button
            id="detail-journal-btn"
            onClick={() => onAddNoteForHabit(habit.id)}
            aria-label="Add habit note"
            className="hover:text-zinc-300 p-1 rounded-lg transition-colors"
          >
            <BookOpen size={20} />
          </button>
          <button
            id="detail-delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete habit"
            className="hover:text-red-400 p-1 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
          <button
            id="detail-edit-btn"
            onClick={() => onEditHabit(habit)}
            aria-label="Edit habit"
            className="hover:text-zinc-300 p-1 -mr-1 rounded-lg transition-colors"
          >
            <Pencil size={20} />
          </button>
        </div>
      </header>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#27272A] border border-zinc-700 text-white text-xs px-4 py-2 rounded-full shadow-lg">
          Copied habit stats to clipboard!
        </div>
      )}

      <main className="px-5 pt-2">
        {/* Habit Title & Subtitle */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{habit.emoji}</span>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {habit.title}
            </h1>
          </div>
          <p className="text-zinc-400 text-sm mt-1">{frequencyLabel}</p>
          {habit.description && (
            <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">
              {habit.description}
            </p>
          )}
        </div>

        {/* 1. Statistics Card */}
        <HabitStats stats={stats} />

        {/* 2. History Calendar */}
        <HabitCalendar
          habit={habit}
          completedDates={habitCompletions}
          onToggleDate={(dateKey) => onToggleDate(habit.id, dateKey)}
        />

        {/* 3. Score Chart */}
        <HabitScoreChart
          habit={habit}
          completedDates={habitCompletions}
          onOpenAnalytics={() => onOpenAnalytics(habit.id)}
        />

        {/* 4. Notes Section matching Screenshot 4 */}
        <section id="habit-notes-section" className="mb-10">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Notes</h2>
            <button
              id="add-note-for-habit-btn"
              onClick={() => onAddNoteForHabit(habit.id)}
              className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
            >
              Add Note
            </button>
          </div>

          {habitNotes.length === 0 ? (
            <div className="py-6 text-center text-zinc-500 text-sm select-none">
              No notes yet
            </div>
          ) : (
            <div className="space-y-2.5">
              {habitNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white">{note.title}</h3>
                    <span className="text-[11px] text-zinc-500">{note.date}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete "${habit.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDeleteHabit(habit.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
