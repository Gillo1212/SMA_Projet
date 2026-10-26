/**
 * Compteurs de l'espace client
 * ────────────────────────────
 *   const { counters, refresh } = useClientCounters();
 *
 * Même principe que useAdminCounters : un seul état partagé (menu, cloche,
 * tableau de bord), rafraîchi toutes les minutes et après chaque action
 * signalée (notifyAdminDataChanged). L'état est rattaché au client connecté :
 * un changement de compte repart de zéro.
 */
import { useEffect, useSyncExternalStore } from 'react';
import { clientPortalService } from '../services/clientPortal.service';
import { ADMIN_POLL_MS, onAdminDataChanged } from '../services/adminEvents';
import { useClientAuth } from '../contexts/ClientAuthContext';
import type { ClientCounters } from '../types/models';

let owner: string | null = null;
let current: ClientCounters | null = null;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let unsubscribeEvents: (() => void) | null = null;

function emit() {
  for (const l of listeners) l();
}

function refresh(): Promise<void> {
  if (!owner) return Promise.resolve();
  const requestedFor = owner;
  inFlight ??= clientPortalService
    .getCounters()
    .then(c => { if (owner === requestedFor) { current = c; emit(); } })
    .catch(() => { /* compteurs indisponibles : on garde les derniers connus */ })
    .finally(() => { inFlight = null; });
  return inFlight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
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

export function useClientCounters() {
  const { client } = useClientAuth();
  const clientId = client?.id ? String(client.id) : null;
  const counters = useSyncExternalStore(subscribe, () => current);

  useEffect(() => {
    if (clientId !== owner) {
      owner = clientId;
      current = null;
      emit();
    }
    if (clientId && !current) refresh();
  }, [clientId]);

  return { counters: clientId === owner ? counters : null, refresh };
}
