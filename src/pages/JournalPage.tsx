import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Pencil, Calendar, Bookmark } from 'lucide-react';
import { Habit, JournalNote } from '../types';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import { getTodayKey } from '../services/streaks';

interface JournalPageProps {
  notes: JournalNote[];
  habits: Habit[];
  preselectedHabitId?: string | null;
  onBack: () => void;
  onSaveNote: (note: Omit<JournalNote, 'id' | 'createdAt'>, noteId?: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({
  notes,
  habits,
  preselectedHabitId,
  onBack,
  onSaveNote,
  onDeleteNote,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(Boolean(preselectedHabitId));
  const [editingNote, setEditingNote] = useState<JournalNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [habitId, setHabitId] = useState<string | null>(preselectedHabitId || null);
  const [date, setDate] = useState(getTodayKey());
  const [error, setError] = useState('');

  const openCreateForm = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setHabitId(preselectedHabitId || null);
    setDate(getTodayKey());
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (note: JournalNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setHabitId(note.habitId || null);
    setDate(note.date);
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (!content.trim()) {
      setError('Please enter your note content');
      return;
    }

    onSaveNote(
      {
        title: title.trim(),
        content: content.trim(),
        habitId: habitId || null,
        date,
      },
      editingNote?.id
    );

    setIsFormOpen(false);
  };

  return (
    <div id="journal-page" className="w-full min-h-screen bg-black text-white pb-24">
      {/* Top Header matching Screenshot 6 */}
      <header className="flex items-center justify-between pt-4 pb-2 px-5">
        <button
          id="journal-back-btn"
          onClick={onBack}
          aria-label="Go back"
          className="text-white hover:text-zinc-300 p-1.5 -ml-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={22} />
        </button>

        {notes.length > 0 && !isFormOpen && (
          <button
            id="journal-add-top-btn"
            onClick={openCreateForm}
            aria-label="Add note"
            className="text-white hover:text-zinc-300 p-1.5 -mr-1.5 rounded-lg transition-colors"
          >
            <Plus size={22} />
          </button>
        )}
      </header>

      <div className="px-5 pt-1 mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Journal</h1>
      </div>

      <main className="px-5">
        {isFormOpen ? (
          /* Note Form */
          <div className="bg-[#18181B] border border-zinc-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="bg-red-950/70 border border-red-800 text-red-200 text-xs px-3 py-2 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Title</label>
              <input
                id="note-title-input"
                type="text"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#27272A] text-white text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700/60 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Date</label>
                <input
                  id="note-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#27272A] text-white text-xs px-3 py-2.5 rounded-xl border border-zinc-700/60 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Linked Habit</label>
                <select
                  id="note-habit-select"
                  value={habitId || ''}
                  onChange={(e) => setHabitId(e.target.value ? e.target.value : null)}
                  className="w-full bg-[#27272A] text-white text-xs px-3 py-2.5 rounded-xl border border-zinc-700/60 focus:outline-hidden"
                >
                  <option value="">None (General)</option>
                  {habits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.emoji} {h.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Thoughts & Reflections</label>
              <textarea
                id="note-content-input"
                placeholder="Write your reflections or notes here..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#27272A] text-white text-sm p-3.5 rounded-xl border border-zinc-700/60 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            <button
              id="save-note-btn"
              onClick={handleSave}
              className="w-full py-3 bg-[#2563EB] hover:bg-blue-600 active:scale-98 text-white font-semibold text-sm rounded-2xl transition-all shadow-md"
            >
              Save Note
            </button>
          </div>
        ) : notes.length === 0 ? (
          /* Empty State matching Screenshot 6 */
          <EmptyState
            id="empty-journal"
            title="No Notes yet"
            description="Add a note to get started"
            buttonText="Add"
            onAction={openCreateForm}
          />
        ) : (
          /* Notes List */
          <div className="space-y-3">
            {notes.map((note) => {
              const linkedHabit = habits.find((h) => h.id === note.habitId);
              return (
                <div
                  key={note.id}
                  id={`journal-note-${note.id}`}
                  className="bg-[#18181B] border border-zinc-800/60 rounded-3xl p-5 shadow-sm hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                        <Calendar size={13} />
                        {note.date}
                      </span>
                      {linkedHabit && (
                        <span
                          style={{ backgroundColor: `${linkedHabit.color}33`, color: linkedHabit.color }}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-current"
                        >
                          <Bookmark size={11} />
                          {linkedHabit.emoji} {linkedHabit.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400">
                      <button
                        onClick={() => openEditForm(note)}
                        aria-label="Edit note"
                        className="p-1 hover:text-white transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setNoteToDelete(note.id)}
                        aria-label="Delete note"
                        className="p-1 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{note.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(noteToDelete)}
        title="Delete Journal Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          if (noteToDelete) {
            onDeleteNote(noteToDelete);
            setNoteToDelete(null);
          }
        }}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};
