/**
 * Navigation de l'espace client, partagée par la barre latérale (bureau,
 * tiroir mobile) et la barre d'onglets du bas (mobile).
 */
import { useTranslation } from 'react-i18next';
import { useClientCounters } from '../../../hooks/useClientCounters';

export interface ClientNavItem {
  path: string;
  /** Icône Remix sans suffixe : `-line` au repos, `-fill` quand la page est active */
  icon: string;
  /** Clé sous clientPortal.nav */
  label: string;
  exact?: boolean;
}

export const NAV_GROUPS: { key: string; items: ClientNavItem[] }[] = [
  {
    key: 'groupActivity',
    items: [
      { path: '/espace-client', icon: 'ri-dashboard', label: 'dashboard', exact: true },
      { path: '/espace-client/commandes', icon: 'ri-shopping-bag-3', label: 'orders' },
      { path: '/espace-client/devis', icon: 'ri-file-list-3', label: 'quotes' },
      { path: '/espace-client/factures', icon: 'ri-bill', label: 'invoices' },
    ],
  },
  {
    key: 'groupFleet',
    items: [
      { path: '/espace-client/machines', icon: 'ri-settings-5', label: 'machines' },
      { path: '/espace-client/support', icon: 'ri-customer-service-2', label: 'support' },
    ],
  },
  {
    key: 'groupAccount',
    items: [
      { path: '/espace-client/profil', icon: 'ri-user-settings', label: 'profile' },
    ],
  },
];

export function isActivePath(pathname: string, item: Pick<ClientNavItem, 'path' | 'exact'>) {
  return item.exact ? pathname === item.path : pathname.startsWith(item.path);
}

export interface NavBadge {
  value: number;
  title: string;
  tone: string;
}

/** Pastilles : ce qui demande l'attention du client (absentes à zéro) */
export function useNavBadges(): Record<string, NavBadge | undefined> {
  const { t } = useTranslation();
  const { counters } = useClientCounters();
  if (!counters) return {};
  const badge = (value: number, key: string, tone: string): NavBadge | undefined =>
    value > 0 ? { value, title: t(`clientPortal.nav.${key}`, { count: value }), tone } : undefined;
  return {
    '/espace-client/commandes': badge(counters.ordersInProgress, 'ordersBadge', 'bg-sky-500 text-white'),
    '/espace-client/devis': badge(counters.quotesAwaitingAnswer, 'quotesBadge', 'bg-indigo-500 text-white'),
    '/espace-client/factures': badge(counters.invoicesToPay, 'invoicesBadge', 'bg-amber-500 text-white'),
  };
}

/** Initiales pour l'avatar (« Amadou Diallo » → « AD ») */
export function initials(first?: string, last?: string) {
  return `${first?.trim()[0] ?? ''}${last?.trim()[0] ?? ''}`.toUpperCase() || '?';
}
