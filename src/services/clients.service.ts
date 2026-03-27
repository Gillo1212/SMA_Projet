/**
 * Service Clients
 * ────────────────
 * MOCK → lit les données de src/mocks/admin.ts
 * API  → CRUD sur /clients
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { adminClients } from '../mocks/admin';
import type { Client, ClientStatus, ListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const clientsService = {
  /**
   * Liste des clients
   * @endpoint GET /clients?search=&statut=&page=&limit=
   */
  async getAll(params?: ListParams & { statut?: ClientStatus }): Promise<Client[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...adminClients] as unknown as Client[];
      if (params?.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          c =>
            c.nom.toLowerCase().includes(q) ||
            c.entreprise.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q),
        );
      }
      if ((params as { statut?: ClientStatus })?.statut) {
        results = results.filter(
          c => c.statut === (params as { statut?: ClientStatus }).statut,
        );
      }
      return results;
    }

    return apiClient.get<Client[]>(
      ENDPOINTS.CLIENTS.LIST,
      params as Record<string, unknown>,
    );
  },

  /**
   * Détail d'un client
   * @endpoint GET /clients/:id
   */
  async getById(id: string): Promise<Client | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (adminClients.find(c => c.id === id) as unknown as Client) ?? null;
    }
    return apiClient.get<Client>(ENDPOINTS.CLIENTS.DETAIL(id));
  },

  /**
   * Mettre à jour un client (admin)
   * @endpoint PUT /clients/:id
   */
  async update(id: string, data: Partial<Client>): Promise<Client> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour modifier des clients.');
    }
    return apiClient.put<Client>(ENDPOINTS.CLIENTS.UPDATE(id), data);
  },

  /**
   * Supprimer un client (admin)
   * @endpoint DELETE /clients/:id
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour supprimer des clients.');
    }
    return apiClient.delete(ENDPOINTS.CLIENTS.DELETE(id));
  },
};
