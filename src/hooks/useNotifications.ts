/**
 * Hook Notifications
 * ───────────────────
 * Le backend n'expose pas de flux de notifications dédié : on le dérive des
 * données déjà disponibles (dernières commandes, devis à traiter). Les
 * notifications ne sont donc pas persistées — « lu » vaut pour la session.
 *
 *   const { notifications, markAsRead, markAllAsRead } = useAdminNotifications();
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ordersService } from '../services/orders.service';
import { quotesService } from '../services/quotes.service';

export interface AppNotification {
  id: string;
  type: 'order' | 'quote' | 'client' | 'machine' | 'invoice' | 'support' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

/** « il y a 3 jours », à partir d'une date lisible ou ISO */
function relativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} j`;

  return d.toLocaleDateString('fr-FR');
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      ordersService.getAll({ limit: 5 }),
      quotesService.getAll({ statut: 'Nouveau', limit: 5 }),
    ])
      .then(([orders, quotes]) => {
        if (cancelled) return;

        const fromOrders: AppNotification[] = orders.map(o => ({
          id: `order-${o.id}`,
          type: 'order',
          title: 'Commande',
          message: `${o.client} — ${o.montant.toLocaleString('fr-FR')} FCFA (${o.statut})`,
          time: relativeTime(o.date),
          read: false,
          link: '/admin/commandes',
        }));

        const fromQuotes: AppNotification[] = quotes.map(q => ({
          id: `quote-${q.id}`,
          type: 'quote',
          title: 'Demande de devis',
          message: `${q.entreprise} — ${q.machine}`,
          time: relativeTime(q.date),
          read: false,
          link: '/admin/devis',
        }));

        setNotifications([...fromQuotes, ...fromOrders]);
      })
      // Une notification manquante ne doit jamais casser la page qui l'affiche
      .catch(() => { if (!cancelled) setNotifications([]); });

    return () => { cancelled = true; };
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(new Set(notifications.map(n => n.id)));
  }, [notifications]);

  const withReadState = useMemo(
    () => notifications.map(n => ({ ...n, read: readIds.has(n.id) })),
    [notifications, readIds],
  );

  return { notifications: withReadState, markAsRead, markAllAsRead };
}
