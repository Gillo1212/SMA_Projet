import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

export interface Toast {
  id: number;
  tone: 'success' | 'error' | 'info';
  title: string;
  detail?: string;
}

let nextId = 1;

/**
 *   const { toasts, notify, dismiss } = useToasts();
 *   notify('success', 'Statut enregistré', 'Le client a été prévenu par email');
 *   <Toasts toasts={toasts} onDismiss={dismiss} />
 */
export function useToasts(durationMs = 4500) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const notify = useCallback((tone: Toast['tone'], title: string, detail?: string) => {
    const id = nextId++;
    setToasts(prev => [...prev.slice(-3), { id, tone, title, detail }]);
    // Une erreur reste plus longtemps : elle demande d'être lue
    setTimeout(() => dismiss(id), tone === 'error' ? durationMs * 2 : durationMs);
  }, [dismiss, durationMs]);

  return { toasts, notify, dismiss };
}

const STYLES: Record<Toast['tone'], { box: string; icon: string }> = {
  success: { box: 'bg-[#00272B] text-white', icon: 'ri-checkbox-circle-fill text-[#4FD07A]' },
  error: { box: 'bg-red-600 text-white', icon: 'ri-error-warning-fill text-white' },
  info: { box: 'bg-white text-[#00272B] border border-gray-200', icon: 'ri-information-fill text-sky-500' },
};

export default function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return createPortal(
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:w-96" aria-live="polite" role="status">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg ${STYLES[t.tone].box}`}>
          <i className={`${STYLES[t.tone].icon} text-lg mt-0.5`}></i>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.detail && <p className="text-xs opacity-75 mt-0.5 break-words">{t.detail}</p>}
          </div>
          <button type="button" onClick={() => onDismiss(t.id)} aria-label="Fermer la notification"
            className="opacity-60 hover:opacity-100 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
