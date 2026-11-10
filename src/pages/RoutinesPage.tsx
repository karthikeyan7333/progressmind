import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { Habit, Routine } from '../types';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';

interface RoutinesPageProps {
  routines: Routine[];
  habits: Habit[];
  onBack: () => void;
  onSaveRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>, routineId?: string) => void;
  onDeleteRoutine: (routineId: string) => void;
  onOpenHabitDetail: (habitId: string) => void;
}

export const RoutinesPage: React.FC<RoutinesPageProps> = ({
  routines,
  habits,
  onBack,
  onSaveRoutine,
  onDeleteRoutine,
  onOpenHabitDetail,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const openCreateForm = () => {
    setEditingRoutine(null);
    setName('');
    setSelectedHabitIds([]);
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (routine: Routine) => {
    setEditingRoutine(routine);
    setName(routine.name);
    setSelectedHabitIds(routine.habitIds || []);
    setError('');
    setIsFormOpen(true);
  };

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a routine name');
      return;
    }

    onSaveRoutine(
      {
        name: name.trim(),
        habitIds: selectedHabitIds,
      },
      editingRoutine?.id
    );

    setIsFormOpen(false);
  };

  return (
    <div id="routines-page" className="w-full min-h-screen bg-black text-white pb-24">
      {/* Top Header matching Screenshot 7 */}
      <header className="flex items-center justify-between pt-4 pb-2 px-5">
        <button
          id="routines-back-btn"
          onClick={onBack}
          aria-label="Go back"
          className="text-white hover:text-zinc-300 p-1.5 -ml-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={22} />
        </button>

        {routines.length > 0 && !isFormOpen && (
          <button
            id="routines-add-top-btn"
            onClick={openCreateForm}
            aria-label="Create routine"
            className="text-white hover:text-zinc-300 p-1.5 -mr-1.5 rounded-lg transition-colors"
          >
            <Plus size={22} />
          </button>
        )}
      </header>

      <div className="px-5 pt-1 mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Routines</h1>
      </div>

      <main className="px-5">
        {isFormOpen ? (
          /* Create / Edit Routine Form */
          <div className="bg-[#18181B] border border-zinc-800/80 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-white">
                {editingRoutine ? 'Edit Routine' : 'New Routine'}
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
              <label className="text-xs text-zinc-400 block mb-1">Routine Name</label>
              <input
                id="routine-name-input"
                type="text"
                placeholder="e.g. Morning Routine, Evening Reset"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#27272A] text-white text-sm px-3.5 py-2.5 rounded-xl border border-zinc-700/60 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-2">Assign Habits to Routine</label>
              {habits.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No habits available yet.</p>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => {
                    const isSelected = selectedHabitIds.includes(habit.id);
                    return (
                      <button
                        key={habit.id}
                        type="button"
                        onClick={() => toggleHabitSelection(habit.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-600 text-white font-medium'
                            : 'bg-[#27272A]/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{habit.emoji}</span>
                          <span>{habit.title}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'border-zinc-700'
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              id="save-routine-btn"
              onClick={handleSave}
              className="w-full py-3 bg-[#2563EB] hover:bg-blue-600 active:scale-98 text-white font-semibold text-sm rounded-2xl transition-all shadow-md"
            >
              Save Routine
            </button>
          </div>
        ) : routines.length === 0 ? (
          /* Empty State matching Screenshot 7 */
          <EmptyState
            id="empty-routines"
            title="No Routines"
            description="There are no routines. Create one?"
            buttonText="Create"
            onAction={openCreateForm}
          />
        ) : (
          /* Routines List */
          <div className="space-y-3.5">
            {routines.map((routine) => {
              const assignedHabits = habits.filter((h) => routine.habitIds.includes(h.id));
              return (
                <div
                  key={routine.id}
                  id={`routine-card-${routine.id}`}
                  className="bg-[#18181B] border border-zinc-800/60 rounded-3xl p-5 shadow-sm hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {routine.name}
                    </h3>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <button
                        onClick={() => openEditForm(routine)}
                        aria-label={`Edit ${routine.name}`}
                        className="p-1 hover:text-white transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setRoutineToDelete(routine.id)}
                        aria-label={`Delete ${routine.name}`}
                        className="p-1 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-zinc-500 font-medium block">
                      {assignedHabits.length} {assignedHabits.length === 1 ? 'Habit' : 'Habits'}
                    </span>
                    {assignedHabits.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic">No habits assigned yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {assignedHabits.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => onOpenHabitDetail(h.id)}
                            style={{ backgroundColor: `${h.color}26`, borderColor: `${h.color}66` }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold text-white hover:brightness-125 transition-all"
                          >
                            <span>{h.emoji}</span>
                            <span>{h.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(routineToDelete)}
        title="Delete Routine"
        message="Are you sure you want to delete this routine? Assigned habits will not be deleted."
        confirmLabel="Delete"
        onConfirm={() => {
          if (routineToDelete) {
            onDeleteRoutine(routineToDelete);
            setRoutineToDelete(null);
          }
        }}
        onCancel={() => setRoutineToDelete(null)}
      />
    </div>
  );
};
