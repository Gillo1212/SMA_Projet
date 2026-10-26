import type { ReactNode } from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Contenu supplémentaire (champ de motif…) */
  children?: ReactNode;
}

/** Confirmation d'une action sensible (annulation, remboursement, envoi au client…) */
export default function ConfirmDialog({
  open, title, message, confirmLabel, tone = 'primary', busy, onConfirm, onCancel, children,
}: ConfirmDialogProps) {
  const confirmClass = tone === 'danger'
    ? 'bg-red-500 hover:bg-red-600'
    : 'bg-[#1AAA3F] hover:bg-[#148a33]';
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onCancel}
      size="md"
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy}
            className="px-4 h-10 border border-gray-200 text-sm font-medium text-[#00272B]/70 rounded-lg hover:bg-white cursor-pointer disabled:opacity-50">
            Annuler
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} data-autofocus
            className={`px-5 h-10 text-white text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-60 flex items-center gap-2 ${confirmClass}`}>
            {busy && <i className="ri-loader-4-line animate-spin"></i>}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="text-sm text-[#00272B]/70 leading-relaxed">{message}</div>
      {children && <div className="mt-4">{children}</div>}
    </Modal>
  );
}
