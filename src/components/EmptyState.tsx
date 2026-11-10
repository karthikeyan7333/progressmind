import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  title,
  description,
  buttonText,
  onAction,
}) => {
  return (
    <div id={id} className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Zzz icon matching screenshots 6 & 7 */}
      <div className="mb-6 flex flex-col items-center justify-center select-none">
        <span className="text-blue-500 font-bold text-3xl tracking-tighter leading-none flex gap-1">
          <span className="text-2xl opacity-75">z</span>
          <span className="text-3xl text-blue-500">Z</span>
          <span className="text-xl opacity-50">z</span>
        </span>
      </div>

      <h3 className="text-white text-xl font-bold mb-2 tracking-tight">{title}</h3>
      <p className="text-zinc-400 text-sm mb-8 max-w-xs">{description}</p>

      <button
        id={id ? `${id}-btn` : undefined}
        onClick={onAction}
        className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white font-medium px-6 py-2.5 rounded-full transition-all duration-150 shadow-sm"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>{buttonText}</span>
      </button>
    </div>
  );
};
