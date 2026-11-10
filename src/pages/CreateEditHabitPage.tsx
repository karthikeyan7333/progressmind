import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { Habit, RepeatType, Routine } from '../types';
import { COLOR_OPTIONS, EMOJI_OPTIONS, DAYS_OF_WEEK } from '../constants/theme';

interface CreateEditHabitPageProps {
  initialHabit?: Habit | null;
  routines: Routine[];
  onBack: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>, habitId?: string) => void;
}

export const CreateEditHabitPage: React.FC<CreateEditHabitPageProps> = ({
  initialHabit,
  routines,
  onBack,
  onSave,
}) => {
  const isEditing = Boolean(initialHabit);

  // Form State
  const [emoji, setEmoji] = useState(initialHabit?.emoji || '💪');
  const [title, setTitle] = useState(initialHabit?.title || '');
  const [description, setDescription] = useState(initialHabit?.description || '');
  const [color, setColor] = useState(initialHabit?.color || COLOR_OPTIONS[0].value);
  const [repeatEnabled, setRepeatEnabled] = useState(true);
  const [repeatType, setRepeatType] = useState<RepeatType>(initialHabit?.repeatType || 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialHabit?.selectedDays || [0, 1, 2, 3, 4, 5, 6]
  );
  const [reminderEnabled, setReminderEnabled] = useState(initialHabit?.reminderEnabled ?? true);
  const [goalEnabled, setGoalEnabled] = useState(initialHabit?.goalEnabled ?? false);
  const [routineId, setRoutineId] = useState<string | null>(initialHabit?.routineId || null);

  // Modal / Pickers
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev; // Keep at least one day
        return prev.filter((d) => d !== dayId);
      }
      return [...prev, dayId].sort();
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a habit title');
      return;
    }

    const finalSelectedDays =
      repeatType === 'daily'
        ? [0, 1, 2, 3, 4, 5, 6]
        : repeatType === 'weekly'
        ? selectedDays.length > 0
          ? selectedDays
          : [0, 1, 2, 3, 4, 5, 6]
        : [];

    onSave(
      {
        emoji,
        title: title.trim(),
        description: description.trim(),
        color,
        repeatType,
        selectedDays: finalSelectedDays,
        reminderEnabled,
        goalEnabled,
        routineId,
      },
      initialHabit?.id
    );
  };

  const selectedRoutine = routines.find((r) => r.id === routineId);

  return (
    <div id="create-edit-habit-page" className="w-full min-h-screen bg-black text-white pb-20">
      {/* Top Header matching Screenshot 9 */}
      <header className="flex items-center pt-4 pb-3 px-5">
        <button
          id="habit-form-back-btn"
          onClick={onBack}
          aria-label="Go back"
          className="text-white hover:text-zinc-300 p-1.5 -ml-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
      </header>

      <main className="px-5 pt-1 space-y-3.5">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-4">
          {isEditing ? 'Edit Habit' : 'Create Habit'}
        </h1>

        {errorMessage && (
          <div className="bg-red-950/70 border border-red-800 text-red-200 text-xs px-4 py-2.5 rounded-2xl">
            {errorMessage}
          </div>
        )}

        {/* 1. Emoji & Title Card matching Screenshot 9 */}
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3">
          <button
            type="button"
            id="habit-emoji-picker-btn"
            onClick={() => setShowEmojiPicker((v) => !v)}
            aria-label="Choose emoji"
            className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xl transition-colors shrink-0"
          >
            {emoji}
          </button>
          <input
            id="habit-title-input"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            className="flex-1 bg-transparent text-white text-base placeholder-zinc-500 focus:outline-hidden"
          />
        </div>

        {/* Emoji Selector Modal / Drawer */}
        {showEmojiPicker && (
          <div className="bg-[#1C1C1E] border border-zinc-800 rounded-2xl p-4 shadow-xl">
            <span className="text-xs font-semibold text-zinc-400 block mb-2">Choose Icon</span>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    setEmoji(em);
                    setShowEmojiPicker(false);
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-110 ${
                    emoji === em ? 'bg-zinc-700 ring-2 ring-blue-500' : 'bg-zinc-800'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. Description Card */}
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4">
          <textarea
            id="habit-description-input"
            placeholder="Description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent text-white text-sm placeholder-zinc-500 focus:outline-hidden resize-none"
          />
        </div>

        {/* 3. Color Row Card */}
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Color</span>
            <button
              type="button"
              id="habit-color-picker-btn"
              onClick={() => setShowColorPicker((v) => !v)}
              aria-label="Pick color"
              style={{ backgroundColor: color }}
              className="w-8 h-8 rounded-xl ring-2 ring-white/20 transition-transform active:scale-95 cursor-pointer shadow-xs"
            />
          </div>

          {/* Color Palette options */}
          {showColorPicker && (
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto py-1">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setColor(opt.value);
                    setShowColorPicker(false);
                  }}
                  style={{ backgroundColor: opt.value }}
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center transition-transform hover:scale-110 ${
                    color === opt.value ? 'ring-2 ring-white' : ''
                  }`}
                >
                  {color === opt.value && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Repeat & Frequency Card matching Screenshot 9 */}
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Repeat</span>
            {/* Toggle Switch */}
            <button
              type="button"
              id="habit-repeat-toggle"
              onClick={() => setRepeatEnabled((v) => !v)}
              aria-label="Toggle repeat"
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                repeatEnabled ? 'bg-[#2563EB]' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  repeatEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {repeatEnabled && (
            <div className="flex items-center bg-[#27272A] rounded-xl p-1">
              {(['daily', 'weekly', 'monthly'] as RepeatType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  id={`repeat-type-${type}-btn`}
                  onClick={() => setRepeatType(type)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    repeatType === type
                      ? 'bg-zinc-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. On These Days Card matching Screenshot 9 */}
        {repeatEnabled && (repeatType === 'weekly' || repeatType === 'daily') && (
          <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4">
            <span className="text-sm font-medium text-white block mb-3">
              {repeatType === 'weekly' ? 'Select weekdays' : 'On these days'}
            </span>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    id={`day-select-btn-${d.id}`}
                    onClick={() => toggleDay(d.id)}
                    aria-label={`Toggle ${d.name}`}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Reminder Card */}
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Reminder</span>
          <button
            type="button"
            id="habit-reminder-toggle"
            onClick={() => setReminderEnabled((v) => !v)}
            aria-label="Toggle reminder"
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              reminderEnabled ? 'bg-[#2563EB]' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                reminderEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 7. Goal Card */}
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Goal</span>
          <button
            type="button"
            id="habit-goal-toggle"
            onClick={() => setGoalEnabled((v) => !v)}
            aria-label="Toggle goal"
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              goalEnabled ? 'bg-[#2563EB]' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                goalEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 8. Routine Selector Card */}
        <div className="bg-[#18181B] border border-zinc-800/60 rounded-2xl p-4">
          <div
            onClick={() => setShowRoutinePicker((v) => !v)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm font-medium text-white">Routine</span>
            <div className="flex items-center gap-1 text-blue-500 text-sm font-medium">
              <span>{selectedRoutine ? selectedRoutine.name : 'Select'}</span>
              <ChevronRight size={16} />
            </div>
          </div>

          {showRoutinePicker && (
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setRoutineId(null);
                  setShowRoutinePicker(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                  routineId === null ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <span>None</span>
                {routineId === null && <Check size={14} />}
              </button>
              {routines.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRoutineId(r.id);
                    setShowRoutinePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
                    routineId === r.id ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50'
                  }`}
                >
                  <span>{r.name}</span>
                  {routineId === r.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 9. Save Button matching Screenshot 9 */}
        <div className="pt-2">
          <button
            type="button"
            id="habit-save-btn"
            onClick={handleSave}
            className="w-full py-3.5 bg-[#2563EB] hover:bg-blue-600 active:scale-98 text-white font-semibold rounded-2xl transition-all shadow-md text-base"
          >
            Save
          </button>
        </div>
      </main>
    </div>
  );
};
