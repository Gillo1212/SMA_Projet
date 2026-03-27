/**
 * Service Machines
 * ─────────────────
 * MOCK → lit les données de src/mocks/machines.ts
 * API  → CRUD sur /machines
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { machines as mockMachines } from '../mocks/machines';
import type { Machine, MachineListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const machinesService = {
  /**
   * Liste des machines (avec filtres optionnels)
   * @endpoint GET /machines?type=&search=&page=&limit=
   */
  async getAll(params?: MachineListParams): Promise<Machine[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...mockMachines] as unknown as Machine[];
      if (params?.type && params.type !== 'all') {
        results = results.filter(m => m.type === params.type);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q),
        );
      }
      return results;
    }

    return apiClient.get<Machine[]>(
      ENDPOINTS.MACHINES.LIST,
      params as Record<string, unknown>,
    );
  },

  /**
   * Détail d'une machine par ID ou slug
   * @endpoint GET /machines/:id
   */
  async getById(id: string): Promise<Machine | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const found = mockMachines.find(
        m => m.id === id || m.slug === id,
      ) as unknown as Machine | undefined;
      return found ?? null;
    }

    return apiClient.get<Machine>(ENDPOINTS.MACHINES.DETAIL(id));
  },

  /**
   * Créer une machine (admin)
   * @endpoint POST /machines
   */
  async create(data: Partial<Machine>): Promise<Machine> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      throw new Error('[MOCK] Création non supportée en mode mock. Connecte ton API.');
    }
    return apiClient.post<Machine>(ENDPOINTS.MACHINES.CREATE, data);
  },

  /**
   * Mettre à jour une machine (admin)
   * @endpoint PUT /machines/:id
   */
  async update(id: string, data: Partial<Machine>): Promise<Machine> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      throw new Error('[MOCK] Mise à jour non supportée en mode mock. Connecte ton API.');
    }
    return apiClient.put<Machine>(ENDPOINTS.MACHINES.UPDATE(id), data);
  },

  /**
   * Supprimer une machine (admin)
   * @endpoint DELETE /machines/:id
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      throw new Error('[MOCK] Suppression non supportée en mode mock. Connecte ton API.');
    }
    return apiClient.delete(ENDPOINTS.MACHINES.DELETE(id));
  },
};
