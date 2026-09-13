import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  isDestructive = true,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/45 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        id="confirm-modal-content"
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="confirm-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isDestructive 
              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
              : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            {isDestructive ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <h3 className="text-base font-bold text-stone-900 leading-tight">
            {title}
          </h3>
        </div>

        <p className="text-xs text-stone-600 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer text-center"
          >
            {cancelText}
          </button>
          <button
            id="confirm-modal-action-btn"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer text-center ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' 
                : 'bg-[#61c0bf] hover:bg-[#4db2b1] active:bg-[#3ca1a0]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
