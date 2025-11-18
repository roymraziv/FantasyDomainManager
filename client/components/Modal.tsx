'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-2 border-amber-700/50 shadow-2xl shadow-amber-900/20 m-4">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b-2 border-amber-700/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-amber-100 tracking-wide">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-amber-400 transition-colors p-1 hover:bg-zinc-800 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
