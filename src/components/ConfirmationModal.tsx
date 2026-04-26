'use client';

import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'primary' | 'warning';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md animate-in zoom-in-95 duration-200 shadow-2xl border-white/10">
        <h3 className={`text-xl font-bold mb-3 ${type === 'danger' ? 'text-red-400' : 'text-gradient'}`}>
          {title}
        </h3>
        <p className="text-gray-300 mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            className="btn btn-outline"
            style={{ padding: '0.6rem 1.2rem' }}
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className={`btn ${type === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'btn-primary'}`}
            style={{ padding: '0.6rem 1.2rem' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
