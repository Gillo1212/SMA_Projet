/**
 * Hook Commandes
 * ───────────────
 * const { orders, isLoading, updateStatus, refetch } = useOrders();
 * const { confirmDelivery } = useOrders();   // espace client : réception confirmée
 */

import { useState, useEffect, useCallback } from 'react';
import { ordersService } from '../services/orders.service';
import { notifyAdminDataChanged } from '../services/adminEvents';
import type { Order, OrderStatus, OrderListParams } from '../types/models';

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  /** Met à jour le statut localement + appelle l'API */
  /** `note` : motif ajouté à l'historique (et motif d'annulation) */
  updateStatus: (id: string, statut: OrderStatus, note?: string) => Promise<void>;
  /** Client : confirme la réception d'une commande expédiée (→ Livrée) */
  confirmDelivery: (id: string) => Promise<void>;
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

  /** Statut appliqué tout de suite, puis confirmé (ou annulé) par l'API */
  const optimistic = useCallback(async (id: string, statut: OrderStatus, call: () => Promise<void>) => {
    let previous: OrderStatus | undefined;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== id) return o;
        previous = o.statut;
        return { ...o, statut };
      }),
    );
    try {
      await call();
      notifyAdminDataChanged();
    } catch (e) {
      // Retour à l'ancien statut, sans recharger la page : un rechargement
      // remplacerait l'écran par le chargement et effacerait l'erreur.
      if (previous) setOrders(prev => prev.map(o => (o.id === id ? { ...o, statut: previous! } : o)));
      throw e;
    }
  }, []);

  const updateStatus = useCallback(
    (id: string, statut: OrderStatus, note?: string) =>
      optimistic(id, statut, () => ordersService.updateStatus(id, statut, note)),
    [optimistic],
  );

  const confirmDelivery = useCallback(
    (id: string) => optimistic(id, 'Livrée', () => ordersService.confirmDelivery(id)),
    [optimistic],
  );

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { orders, isLoading, error, updateStatus, confirmDelivery, refetch };
}

// ── Détail ─────────────────────────────────────────────────────────────────

interface UseOrderReturn {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  /** Recharge le détail sans le vider (ex. historique après un changement de statut) */
  reload: () => void;
}

/**
 * Charge le détail d'une commande (lignes incluses), que la liste ne porte pas.
 * Passer `null` remet l'état à vide sans déclencher de requête.
 */
export function useOrder(id: string | null): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!id) {
      setOrder(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    // Un rechargement garde l'affichage en place : seul le premier chargement montre l'attente
    if (version === 0) setIsLoading(true);
    setError(null);

    ordersService
      .getById(id)
      .then(data => { if (!cancelled) setOrder(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id, version]);

  // Changer de commande repart d'un chargement complet
  useEffect(() => { setVersion(0); }, [id]);

  const reload = useCallback(() => setVersion(v => v + 1), []);

  return { order, isLoading, error, reload };
}
