/**
 * Hooks Espace client
 * ────────────────────
 * const { stats, machines, isLoading } = useClientDashboard();
 * const { machines } = useClientMachines();
 * const { invoices } = useClientInvoices();
 * const { tickets, createTicket } = useClientTickets();
 *
 * L'identifiant du client vient du contexte d'authentification : ces hooks ne
 * renvoient rien tant qu'aucun client n'est connecté.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  clientPortalService,
  type ClientDashboardData,
  type CreateTicketPayload,
} from '../services/clientPortal.service';
import { useClientAuth } from '../contexts/ClientAuthContext';
import type { ClientMachine, Invoice, SupportTicket } from '../types/models';

/** Fabrique un hook de chargement simple indexé sur l'id du client connecté */
function useClientResource<T>(
  loader: (clientId: string) => Promise<T>,
  fallback: T,
) {
  const { client } = useClientAuth();
  const clientId = client?.id ? String(client.id) : null;

  const [data, setData] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loader(clientId)
      .then(result => { if (!cancelled) setData(result); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { data, setData, isLoading, error, refetch };
}

// ── Dashboard ──────────────────────────────────────────────────────────────

const EMPTY_DASHBOARD: ClientDashboardData = {
  stats: {
    totalCommandes: 0,
    totalDepense: 0,
    machinesTotal: 0,
    machinesActives: 0,
    commandesEnCours: 0,
    devisARepondre: 0,
    facturesEnAttente: 0,
    facturesEnAttenteMontant: 0,
    ticketsOuverts: 0,
  },
  machines: [],
};

export function useClientDashboard() {
  const { data, isLoading, error, refetch } = useClientResource<ClientDashboardData>(
    () => clientPortalService.getDashboard(),
    EMPTY_DASHBOARD,
  );

  return { stats: data.stats, machines: data.machines, isLoading, error, refetch };
}

// ── Parc machines ──────────────────────────────────────────────────────────

export function useClientMachines() {
  const { data, isLoading, error, refetch } = useClientResource<ClientMachine[]>(
    clientId => clientPortalService.getMachines(clientId),
    [],
  );

  return { machines: data, isLoading, error, refetch };
}

// ── Factures ───────────────────────────────────────────────────────────────

export function useClientInvoices() {
  const { data, isLoading, error, refetch } = useClientResource<Invoice[]>(
    clientId => clientPortalService.getInvoices(clientId),
    [],
  );

  return { invoices: data, isLoading, error, refetch };
}

// ── Tickets de support ─────────────────────────────────────────────────────

export function useClientTickets() {
  const { data, setData, isLoading, error, refetch } = useClientResource<SupportTicket[]>(
    clientId => clientPortalService.getTickets(clientId),
    [],
  );

  const createTicket = useCallback(
    async (payload: CreateTicketPayload) => {
      const created = await clientPortalService.createTicket(payload);
      setData(prev => [created, ...prev]);
      return created;
    },
    [setData],
  );

  return { tickets: data, isLoading, error, refetch, createTicket };
}
