'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 ring-rose-500/20',
      btnVariant: 'danger' as const,
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 ring-amber-500/20',
      btnVariant: 'amber' as const,
    },
    primary: {
      icon: Info,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-500/10 ring-brand-500/20',
      btnVariant: 'primary' as const,
    },
  }[variant];

  const Icon = iconConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-14 h-14 rounded-2xl ${iconConfig.bg} ${iconConfig.color} flex items-center justify-center ring-8 mb-4`}
        >
          <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={iconConfig.btnVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
