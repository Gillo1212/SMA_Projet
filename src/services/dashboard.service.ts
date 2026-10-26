/**
 * Service Dashboard
 * ──────────────────
 * MOCK → agrège les données de src/mocks/admin.ts
 * API  → GET /dashboard/admin, dont la réponse est remodelée ici.
 *
 * Le backend renvoie { kpis, orders_by_status, recent_orders, monthly_revenue }.
 * Les devis en attente ne font pas partie de cette réponse : ils sont
 * récupérés en parallèle via /quotes?status=pending.
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { quotesService } from './quotes.service';
import { ordersService } from './orders.service';
import {
  adminStats,
  revenueData,
  adminCommandes,
  adminDevis,
} from '../mocks/admin';
import { toNumber, formatMonth, toOrderStatus } from './normalize';
import type {
  DashboardStats,
  RevenueDataPoint,
  StatusBreakdownItem,
  Order,
  Quote,
} from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface DashboardData {
  stats:           DashboardStats;
  revenue:         RevenueDataPoint[];
  statusBreakdown: StatusBreakdownItem[];
  recentOrders:    Order[];
  pendingQuotes:   Quote[];
}

// ── Forme brute de GET /dashboard/admin ────────────────────────────────────

interface BackendMonthlyRevenue {
  month: string;
  revenue: number | string;
  orders: number | string;
}

interface BackendDashboard {
  kpis: {
    total_revenue: number | string;
    monthly_revenue: number | string;
    total_orders: number | string;
    monthly_orders: number | string;
    active_clients: number | string;
    active_machines: number | string;
    pending_quotes: number | string;
    open_tickets: number | string;
    last_month_orders?: number | string;
    last_month_revenue?: number | string;
    orders_to_handle?: number | string;
    quotes_to_handle?: number | string;
  };
  orders_by_status: Record<string, number | string>;
  monthly_revenue: BackendMonthlyRevenue[];
}

/** Évolution en % du mois en cours par rapport au précédent — undefined sans base de comparaison */
function evolution(current: number, previous: number): number | undefined {
  if (!previous) return undefined;
  return Math.round(((current - previous) / previous) * 100);
}

function normalizeDashboard(raw: BackendDashboard): Omit<DashboardData, 'recentOrders' | 'pendingQuotes'> {
  const months = Array.isArray(raw.monthly_revenue) ? raw.monthly_revenue : [];

  const revenue: RevenueDataPoint[] = months.slice(-6).map(m => ({
    month: formatMonth(m.month),
    value: toNumber(m.revenue),
  }));

  const statusBreakdown: StatusBreakdownItem[] = Object.entries(raw.orders_by_status ?? {})
    .map(([status, count]) => ({ statut: toOrderStatus(status), count: toNumber(count) }))
    .sort((a, b) => b.count - a.count);

  return {
    stats: {
      totalCommandes:      toNumber(raw.kpis?.total_orders),
      commandesMoisActuel: toNumber(raw.kpis?.monthly_orders),
      commandesEvolution:  evolution(toNumber(raw.kpis?.monthly_orders), toNumber(raw.kpis?.last_month_orders)),
      revenusTotal:        toNumber(raw.kpis?.total_revenue),
      revenusMoisActuel:   toNumber(raw.kpis?.monthly_revenue),
      revenusEvolution:    evolution(toNumber(raw.kpis?.monthly_revenue), toNumber(raw.kpis?.last_month_revenue)),
      commandesATraiter:   toNumber(raw.kpis?.orders_to_handle),
      devisATraiter:       toNumber(raw.kpis?.quotes_to_handle),
      machinesActives:     toNumber(raw.kpis?.active_machines),
      devisEnAttente:      toNumber(raw.kpis?.pending_quotes),
      ticketsOuverts:      toNumber(raw.kpis?.open_tickets),
      clientsTotal:        toNumber(raw.kpis?.active_clients),
    },
    revenue,
    statusBreakdown,
  };
}

// ── Compteurs du back-office ───────────────────────────────────────────────

/** GET /dashboard/counters : pastilles du menu, cloche, onglets des listes */
export interface AdminCounters {
  ordersByStatus: Record<string, number>;
  quotesByStatus: Record<string, number>;
  /** Commandes « En attente » */
  ordersNew: number;
  /** En attente + confirmées + en préparation */
  ordersToHandle: number;
  /** Devis « Nouveau » */
  quotesNew: number;
  /** Nouveaux + en cours */
  quotesToHandle: number;
  openTickets: number;
}

// ── Service ────────────────────────────────────────────────────────────────

export const dashboardService = {
  async getCounters(): Promise<AdminCounters> {
    const raw = await apiClient.get<Record<string, any>>(ENDPOINTS.DASHBOARD.COUNTERS);
    const toCounts = (o: Record<string, unknown> = {}) =>
      Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toNumber(v)]));
    return {
      ordersByStatus: toCounts(raw.orders_by_status),
      quotesByStatus: toCounts(raw.quotes_by_status),
      ordersNew: toNumber(raw.orders_new),
      ordersToHandle: toNumber(raw.orders_to_handle),
      quotesNew: toNumber(raw.quotes_new),
      quotesToHandle: toNumber(raw.quotes_to_handle),
      openTickets: toNumber(raw.open_tickets),
    };
  },

  /**
   * Charge le dashboard admin.
   * @endpoint GET /dashboard/admin + GET /quotes?status=pending
   */
  async getAll(): Promise<DashboardData> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        stats: {
          ...adminStats,
          revenusTotal: adminStats.revenusMoisActuel,
          ticketsOuverts: 0,
        } as DashboardStats,
        revenue: revenueData,
        statusBreakdown: [],
        recentOrders: adminCommandes.slice(0, 5) as unknown as Order[],
        pendingQuotes: adminDevis
          .filter(d => d.statut === 'Nouveau' || d.statut === 'En cours')
          .slice(0, 4) as unknown as Quote[],
      };
    }

    // Les devis à traiter et les dernières commandes viennent de leurs propres
    // endpoints : /dashboard/admin ne les expose pas dans un format exploitable.
    const [raw, recentOrders, pendingQuotes] = await Promise.all([
      apiClient.get<BackendDashboard>(ENDPOINTS.DASHBOARD.ADMIN),
      ordersService.getAll({ limit: 5 }),
      quotesService.getAll({ statut: 'Nouveau', limit: 4 }),
    ]);

    return {
      ...normalizeDashboard(raw),
      recentOrders,
      pendingQuotes,
    };
  },
};
