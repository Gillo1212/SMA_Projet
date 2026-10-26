/**
 * Hook Notifications
 * ───────────────────
 * Le backend n'expose pas de flux de notifications dédié : on le dérive des
 * données déjà disponibles (commandes, devis, factures, tickets), rechargées
 * toutes les minutes et après chaque action. L'état « lu » est gardé dans le
 * navigateur (localStorage), un compte client à la fois.
 *
 *   const { notifications, markAsRead, markAllAsRead } = useAdminNotifications();
 *   const { notifications, markAsRead, markAllAsRead } = useClientNotifications();
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ordersService } from '../services/orders.service';
import { quotesService } from '../services/quotes.service';
import { clientPortalService } from '../services/clientPortal.service';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { ADMIN_POLL_MS, onAdminDataChanged } from '../services/adminEvents';
import { useTranslation } from 'react-i18next';
import { useStatusLabels } from '../i18n/useStatusLabels';
import type { Invoice, Order, Quote, SupportTicket } from '../types/models';

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

function readStoredIds(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

/**
 * État « lu » conservé d'une visite à l'autre (localStorage, par navigateur).
 * Changer de clé (autre compte client) recharge l'état correspondant.
 */
function usePersistedReadState(storageKey: string | null, notifications: AppNotification[]) {
  const [state, setState] = useState(() => ({
    key: storageKey,
    ids: storageKey ? readStoredIds(storageKey) : new Set<string>(),
  }));
  // Changement de compte : on relit l'état du nouveau compte pendant le rendu
  if (state.key !== storageKey) {
    setState({ key: storageKey, ids: storageKey ? readStoredIds(storageKey) : new Set<string>() });
  }

  const update = useCallback((add: string[]) => {
    setState(prev => {
      const ids = new Set([...prev.ids, ...add]);
      if (prev.key) {
        try { localStorage.setItem(prev.key, JSON.stringify([...ids].slice(-200))); } catch { /* stockage indisponible */ }
      }
      return { key: prev.key, ids };
    });
  }, []);

  const markAsRead = useCallback((id: string) => update([id]), [update]);
  const markAllAsRead = useCallback(() => update(notifications.map(n => n.id)), [notifications, update]);

  const withReadState = useMemo(
    () => notifications.map(n => ({ ...n, read: state.ids.has(n.id) })),
    [notifications, state.ids],
  );

  return { notifications: withReadState, markAsRead, markAllAsRead };
}

/** Recharge `load` au montage, toutes les minutes et à chaque action signalée */
function usePolling(load: (() => void) | null) {
  useEffect(() => {
    if (!load) return;
    load();
    const timer = setInterval(load, ADMIN_POLL_MS);
    const unsubscribe = onAdminDataChanged(load);
    return () => { clearInterval(timer); unsubscribe(); };
  }, [load]);
}

/**
 * Notifications du back-office : ce qui attend une prise en charge
 * (commandes « En attente », devis « Nouveau »). Un élément traité sort de la
 * liste au rafraîchissement suivant.
 */
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = useCallback(() => {
    Promise.all([
      ordersService.getAll({ statut: 'En attente', limit: 10 }),
      quotesService.getAll({ statut: 'Nouveau', limit: 10 }),
    ])
      .then(([orders, quotes]) => {
        const fromQuotes: AppNotification[] = quotes.map(q => ({
          id: `quote-${q.id}`,
          type: 'quote',
          title: 'Nouvelle demande de devis',
          message: `${q.entreprise} · ${q.machine}`,
          time: relativeTime(q.date),
          read: false,
          link: '/admin/devis',
        }));

        const fromOrders: AppNotification[] = orders.map(o => ({
          id: `order-${o.id}`,
          type: 'order',
          title: `Commande à traiter · ${o.reference}`,
          message: `${o.client} · ${o.montant.toLocaleString('fr-FR')} FCFA`,
          time: relativeTime(o.date),
          read: false,
          link: '/admin/commandes',
        }));

        setNotifications([...fromQuotes, ...fromOrders]);
      })
      // Une notification manquante ne doit jamais casser la page qui l'affiche
      .catch(() => { /* on garde la dernière liste connue */ });
  }, []);

  usePolling(load);
  return usePersistedReadState('smalim_admin_notif_read', notifications);
}

/** Étapes d'une commande qui méritent une notification au client */
const NOTIFIED_ORDER_STEPS: Order['statut'][] = ['Confirmée', 'En préparation', 'Expédiée'];

/**
 * Notifications de l'espace client : propositions de devis à examiner, suivi
 * des commandes en cours, factures à régler et tickets ouverts. Un changement
 * de statut de commande produit une nouvelle notification (l'identifiant
 * inclut le statut). Les textes sont construits à l'affichage, pour suivre la
 * langue choisie sans recharger.
 */
export function useClientNotifications() {
  const { client } = useClientAuth();
  const { t } = useTranslation();
  const status = useStatusLabels();
  const clientId = client?.id ? String(client.id) : null;
  const [data, setData] = useState<{
    owner: string | null;
    invoices: Invoice[];
    tickets: SupportTicket[];
    quotes: Quote[];
    orders: Order[];
  }>({ owner: null, invoices: [], tickets: [], quotes: [], orders: [] });

  const load = useMemo(() => {
    if (!clientId) return null;
    return () => {
      Promise.all([
        clientPortalService.getInvoices(clientId),
        clientPortalService.getTickets(clientId),
        quotesService.getAll({ statut: 'Devis envoyé', limit: 20 }),
        ordersService.getAll({ limit: 20 }),
      ])
        .then(([invoices, tickets, quotes, orders]) => setData({ owner: clientId, invoices, tickets, quotes, orders }))
        .catch(() => { /* on garde la dernière liste connue */ });
    };
  }, [clientId]);

  usePolling(load);

  const notifications = useMemo<AppNotification[]>(() => {
    if (data.owner !== clientId) return [];
    const now = new Date();

    const proposals: AppNotification[] = data.quotes
      .filter(q => !q.validite || new Date(q.validite) >= now)
      .map(q => ({
        id: `quote-${q.id}-sent`,
        type: 'quote',
        title: t('clientPortal.notifications.quoteReceived'),
        message: t('clientPortal.notifications.quoteMessage', {
          machine: q.machine || q.reference,
          amount: (q.montantPropose ?? 0).toLocaleString('fr-FR'),
        }),
        time: q.date,
        read: false,
        link: '/espace-client/devis',
      }));

    const orders: AppNotification[] = data.orders
      .filter(o => NOTIFIED_ORDER_STEPS.includes(o.statut))
      .map(o => ({
        id: `order-${o.id}-${o.statut}`,
        type: 'order',
        title: t('clientPortal.notifications.orderUpdate', { reference: o.reference, status: status.order(o.statut) }),
        message: `${o.montant.toLocaleString('fr-FR')} FCFA`,
        time: o.date,
        read: false,
        link: '/espace-client/commandes',
      }));

    const dues: AppNotification[] = data.invoices
      .filter(i => i.statut === 'En attente' || i.statut === 'En retard')
      .map(i => ({
        id: `invoice-${i.id}-${i.statut}`,
        type: 'invoice',
        title: i.statut === 'En retard'
          ? t('clientPortal.notifications.invoiceOverdue')
          : t('clientPortal.notifications.invoiceDue'),
        message: `${i.numero} · ${i.montant.toLocaleString('fr-FR')} FCFA`,
        time: i.dateEcheance ? t('clientPortal.notifications.dueDate', { date: i.dateEcheance }) : i.date,
        read: false,
        link: '/espace-client/factures',
      }));

    const tickets: AppNotification[] = data.tickets
      .filter(tk => tk.statut !== 'Fermé')
      .map(tk => ({
        id: `ticket-${tk.id}-${tk.statut}`,
        type: 'support',
        title: t('clientPortal.notifications.ticket', { status: status.ticket(tk.statut) }),
        message: tk.sujet,
        time: tk.date,
        read: false,
        link: '/espace-client/support',
      }));

    return [...proposals, ...orders, ...dues, ...tickets];
  }, [data, clientId, t, status]);

  return usePersistedReadState(clientId ? `smalim_client_notif_read_${clientId}` : null, notifications);
}
