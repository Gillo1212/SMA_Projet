/**
 * Service Commandes
 * ──────────────────
 * MOCK → lit les données de src/mocks/admin.ts
 * API  → CRUD sur /orders
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { adminCommandes } from '../mocks/admin';
import type { Order, OrderStatus, OrderListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const ordersService = {
  /**
   * Liste des commandes
   * @endpoint GET /orders?statut=&search=&page=&limit=
   */
  async getAll(params?: OrderListParams): Promise<Order[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...adminCommandes] as unknown as Order[];
      if (params?.statut) {
        results = results.filter(o => o.statut === params.statut);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          o =>
            o.client.toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q),
        );
      }
      return results;
    }

    return apiClient.get<Order[]>(
      ENDPOINTS.ORDERS.LIST,
      params as Record<string, unknown>,
    );
  },

  /**
   * Détail d'une commande
   * @endpoint GET /orders/:id
   */
  async getById(id: string): Promise<Order | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (adminCommandes.find(o => o.id === id) as unknown as Order) ?? null;
    }
    return apiClient.get<Order>(ENDPOINTS.ORDERS.DETAIL(id));
  },

  /**
   * Créer une commande (panier → checkout)
   * @endpoint POST /orders
   * @body { client, email, phone, items, paiement, adresseLivraison }
   */
  async create(data: Partial<Order>): Promise<Order> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const newOrder: Order = {
        id: `CMD-${Date.now()}`,
        client: data.client ?? '',
        email: data.email ?? '',
        produits: data.produits ?? '',
        montant: data.montant ?? 0,
        statut: 'En attente',
        paiement: data.paiement ?? 'Wave',
        date: new Date().toISOString().split('T')[0],
        ...data,
      };
      return newOrder;
    }
    return apiClient.post<Order>(ENDPOINTS.ORDERS.CREATE, data);
  },

  /**
   * Changer le statut d'une commande (admin)
   * @endpoint PATCH /orders/:id/status
   * @body { statut }
   */
  async updateStatus(id: string, statut: OrderStatus): Promise<Order> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const order = adminCommandes.find(o => o.id === id);
      if (!order) throw new Error('Commande introuvable');
      return { ...(order as unknown as Order), statut };
    }
    return apiClient.patch<Order>(ENDPOINTS.ORDERS.UPDATE_STATUS(id), { statut });
  },

  /**
   * Supprimer une commande (admin)
   * @endpoint DELETE /orders/:id
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour supprimer des commandes.');
    }
    return apiClient.delete(ENDPOINTS.ORDERS.DELETE(id));
  },
};
