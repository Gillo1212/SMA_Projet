import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Éléments affichés à droite du titre (badge de statut…) */
  headerExtra?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  /** Barre d'actions collée en bas de la fenêtre */
  footer?: ReactNode;
  /** Libellé accessible de la croix (traduit dans l'espace client) */
  closeLabel?: string;
  children: ReactNode;
}

const SIZES = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

/** Fenêtres ouvertes, de la plus ancienne à la plus récente : Échap ne ferme que la dernière */
const openStack: string[] = [];

/**
 * Fenêtre modale du back-office.
 * Échap et clic à côté ferment ; le focus entre dans la fenêtre puis revient
 * sur l'élément qui l'a ouverte ; la page ne défile plus derrière.
 */
export default function Modal({ open, onClose, title, subtitle, headerExtra, size = 'lg', footer, closeLabel = 'Fermer', children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Focus sur l'élément marqué data-autofocus, sinon sur la fenêtre elle-même :
    // ni un bouton pris au hasard, ni un champ qui ouvrirait le clavier sur mobile.
    // (querySelector sur une liste renverrait le premier dans l'ordre du document)
    const target = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]:not([disabled])');
    (target ?? panelRef.current)?.focus({ preventScroll: true });

    openStack.push(titleId);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openStack[openStack.length - 1] === titleId) onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      openStack.splice(openStack.indexOf(titleId), 1);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, titleId]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#00272B]/40 backdrop-blur-[2px] p-0 sm:p-4 motion-safe:animate-fade-in"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${SIZES[size]} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] outline-none motion-safe:animate-sheet-up`}
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-[#00272B] truncate">{title}</h2>
            {subtitle && <p className="text-xs text-[#00272B]/45 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {headerExtra}
            <button
              type="button" onClick={onClose} data-close aria-label={closeLabel}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#00272B]/40 hover:bg-gray-100 hover:text-[#00272B] cursor-pointer"
            >
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5">{children}</div>
        {footer && <div className="px-5 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-gray-50/60 sm:rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
