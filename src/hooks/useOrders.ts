/**
 * Hook Commandes
 * ───────────────
 * const { orders, isLoading, updateStatus, refetch } = useOrders();
 */

import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '../services/orders.service';
import type { Order, OrderStatus, OrderListParams } from '../types/models';

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  /** Met à jour le statut localement + appelle l'API */
  updateStatus: (id: string, statut: OrderStatus) => Promise<void>;
  refetch: () => void;
}

export function useOrders(params?: OrderListParams): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    ordersService
      .getAll(params)
      .then(data => { if (!cancelled) setOrders(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, tick]);

  const updateStatus = useCallback(
    async (id: string, statut: OrderStatus) => {
      // Mise à jour optimiste locale
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, statut } : o)),
      );
      try {
        await ordersService.updateStatus(id, statut);
      } catch (e) {
        // Rollback si erreur
        setTick(t => t + 1);
        throw e;
      }
    },
    [],
  );

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { orders, isLoading, error, updateStatus, refetch };
}

// ── Détail ─────────────────────────────────────────────────────────────────

interface UseOrderReturn {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Charge le détail d'une commande (lignes incluses), que la liste ne porte pas.
 * Passer `null` remet l'état à vide sans déclencher de requête.
 */
export function useOrder(id: string | null): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setOrder(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    ordersService
      .getById(id)
      .then(data => { if (!cancelled) setOrder(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  return { order, isLoading, error };
}
