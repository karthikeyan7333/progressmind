import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div 
        id="confirm-modal-box"
        className="w-full max-w-sm bg-[#1C1C1E] border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center"
      >
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            id="modal-cancel-btn"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            id="modal-confirm-btn"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-medium text-sm text-white transition-colors ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
