/**
 * Service Dashboard
 * ──────────────────
 * MOCK → agrège les données de src/mocks/admin.ts
 * API  → GET /dashboard/admin  (retourne tout en une seule réponse)
 *         GET /dashboard/client (pour l'espace client)
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import {
  adminStats,
  revenueData,
  adminCommandes,
  adminDevis,
} from '../mocks/admin';
import type {
  DashboardStats,
  RevenueDataPoint,
  Order,
  Quote,
} from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface DashboardData {
  stats:        DashboardStats;
  revenue:      RevenueDataPoint[];
  recentOrders: Order[];
  pendingQuotes:Quote[];
}

export const dashboardService = {
  /**
   * Charge toutes les données du dashboard admin en une seule requête
   * @endpoint GET /dashboard/admin
   */
  async getAll(): Promise<DashboardData> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        stats:        adminStats as DashboardStats,
        revenue:      revenueData,
        recentOrders: adminCommandes.slice(0, 5) as unknown as Order[],
        pendingQuotes: adminDevis
          .filter(d => d.statut === 'Nouveau' || d.statut === 'En cours')
          .slice(0, 4) as unknown as Quote[],
      };
    }
    return apiClient.get<DashboardData>(ENDPOINTS.DASHBOARD.ADMIN);
  },

  /**
   * Dashboard client
   * @endpoint GET /dashboard/client
   */
  async getClientDashboard(): Promise<DashboardData> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        stats:        adminStats as DashboardStats,
        revenue:      revenueData,
        recentOrders: adminCommandes.slice(0, 3) as unknown as Order[],
        pendingQuotes:[],
      };
    }
    return apiClient.get<DashboardData>(ENDPOINTS.DASHBOARD.CLIENT);
  },
};
