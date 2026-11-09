import { useEffect } from 'react';

/**
 * Apparition au défilement
 * ────────────────────────
 * Monté une fois dans l'application. Tout élément marqué `data-reveal` (même
 * ajouté plus tard : changement de page, données chargées) reçoit l'attribut
 * `data-visible` quand il entre à l'écran, une seule fois. Les styles sont dans
 * index.css (.js-reveal [data-reveal]).
 *
 *   <article data-reveal style={{ '--reveal-delay': '120ms' } as CSSProperties}>
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    root.classList.add('js-reveal');

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Attribut plutôt que classe : React ne le réécrit jamais au rendu suivant
            entry.target.setAttribute('data-visible', '');
            io.unobserve(entry.target);
          }
        }
      },
      // Déclenche un peu avant le bas de l'écran : le mouvement est fini quand on lit
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const watch = (scope: Document | Element) => {
      scope.querySelectorAll<HTMLElement>('[data-reveal]:not([data-visible])').forEach(el => io.observe(el));
    };
    watch(document);

    // Nouveaux éléments (navigation, listes chargées après coup)
    const mo = new MutationObserver(mutations => {
      for (const m of mutations) {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('[data-reveal]:not([data-visible])')) io.observe(node);
          watch(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      root.classList.remove('js-reveal');
    };
  }, []);

  return null;
}

/** Décalage d'apparition en cascade pour le n-ième élément d'une liste */
export const revealDelay = (index: number, step = 90, max = 450) =>
  ({ '--reveal-delay': `${Math.min(index * step, max)}ms` }) as React.CSSProperties;
