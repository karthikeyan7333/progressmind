export interface ColorOption {
  id: string;
  name: string;
  value: string;
  borderClass?: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'teal', name: 'Teal', value: '#24656D' },
  { id: 'orange', name: 'Amber', value: '#9A5826' },
  { id: 'emerald', name: 'Emerald', value: '#235D43' },
  { id: 'indigo', name: 'Indigo', value: '#364B78' },
  { id: 'purple', name: 'Violet', value: '#5B376E' },
  { id: 'crimson', name: 'Crimson', value: '#7E2C3D' },
  { id: 'slate', name: 'Slate', value: '#3F4857' },
  { id: 'blue', name: 'Azure', value: '#1E588F' },
];

export const EMOJI_OPTIONS = [
  '💪', '📚', '💻', '🏃', '💧', '🧘', '🥗', '⚡', 
  '🎯', '🎨', '🎸', '🌱', '☀️', '🌙', '🛌', '🚶',
  '🏊', '🚴', '🧠', '✍️', '🍎', '🍵', '🔥', '🚀'
];

export const DAYS_OF_WEEK = [
  { id: 0, label: 'M', full: 'Mon', name: 'Monday' },
  { id: 1, label: 'T', full: 'Tue', name: 'Tuesday' },
  { id: 2, label: 'W', full: 'Wed', name: 'Wednesday' },
  { id: 3, label: 'T', full: 'Thu', name: 'Thursday' },
  { id: 4, label: 'F', full: 'Fri', name: 'Friday' },
  { id: 5, label: 'S', full: 'Sat', name: 'Saturday' },
  { id: 6, label: 'S', full: 'Sun', name: 'Sunday' },
];
