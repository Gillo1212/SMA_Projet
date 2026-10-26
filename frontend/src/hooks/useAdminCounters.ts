/**
 * Compteurs du back-office
 * ────────────────────────
 *   const { counters, refresh } = useAdminCounters();
 *
 * Un seul état partagé par tous les composants (menu, cloche, listes) : une
 * requête GET /dashboard/counters sert tout le monde. Rafraîchi toutes les
 * minutes tant qu'un composant l'utilise, et aussitôt qu'une action le signale
 * (notifyAdminDataChanged).
 */
import { useEffect, useSyncExternalStore } from 'react';
import { dashboardService, type AdminCounters } from '../services/dashboard.service';
import { ADMIN_POLL_MS, onAdminDataChanged } from '../services/adminEvents';

let current: AdminCounters | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let unsubscribeEvents: (() => void) | null = null;

function emit() {
  for (const l of listeners) l();
}

function refresh(): Promise<void> {
  inFlight ??= dashboardService
    .getCounters()
    .then(c => { current = c; emit(); })
    .catch(() => { /* compteurs indisponibles : on garde les derniers connus */ })
    .finally(() => { inFlight = null; });
  return inFlight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    refresh();
    timer = setInterval(refresh, ADMIN_POLL_MS);
    unsubscribeEvents = onAdminDataChanged(refresh);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer) clearInterval(timer);
      unsubscribeEvents?.();
      timer = null;
      unsubscribeEvents = null;
    }
  };
}

export function useAdminCounters() {
  const counters = useSyncExternalStore(subscribe, () => current);
  // Premier rendu sans données : déclenche le chargement si personne ne l'a fait
  useEffect(() => { if (!current) refresh(); }, []);
  return { counters, refresh };
}
