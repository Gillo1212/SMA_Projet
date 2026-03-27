/**
 * Hook Clients
 * ─────────────
 * const { clients, isLoading, error, refetch } = useClients();
 */

import { useState, useEffect, useCallback } from 'react';
import { clientsService } from '../services/clients.service';
import type { Client, ClientStatus, ListParams } from '../types/models';

interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useClients(
  params?: ListParams & { statut?: ClientStatus },
): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    clientsService
      .getAll(params)
      .then(data => { if (!cancelled) setClients(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { clients, isLoading, error, refetch };
}
