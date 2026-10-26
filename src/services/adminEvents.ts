/**
 * Signal « données du back-office modifiées »
 * ────────────────────────────────────────────
 * Émis après une action qui change des chiffres (statut de commande ou de
 * devis…) ; les compteurs du menu, la cloche et le tableau de bord l'écoutent
 * pour se rafraîchir sans attendre leur prochain rafraîchissement périodique.
 */
const EVENT = 'smalim:admin-data-changed';

export function notifyAdminDataChanged(): void {
  window.dispatchEvent(new Event(EVENT));
}

/** Abonnement ; renvoie la fonction de désabonnement */
export function onAdminDataChanged(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Intervalle de rafraîchissement des compteurs (nouvelles commandes du site) */
export const ADMIN_POLL_MS = 60_000;
