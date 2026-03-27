/**
 * Service Devis
 * ──────────────
 * MOCK → lit les données de src/mocks/admin.ts
 * API  → CRUD sur /quotes
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { adminDevis } from '../mocks/admin';
import type { Quote, QuoteStatus, QuoteListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const quotesService = {
  /**
   * Liste des devis
   * @endpoint GET /quotes?statut=&search=&page=&limit=
   */
  async getAll(params?: QuoteListParams): Promise<Quote[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...adminDevis] as unknown as Quote[];
      if (params?.statut) {
        results = results.filter(q => q.statut === params.statut);
      }
      if (params?.search) {
        const s = params.search.toLowerCase();
        results = results.filter(
          q =>
            q.entreprise.toLowerCase().includes(s) ||
            q.contact.toLowerCase().includes(s),
        );
      }
      return results;
    }

    return apiClient.get<Quote[]>(
      ENDPOINTS.QUOTES.LIST,
      params as Record<string, unknown>,
    );
  },

  /**
   * Détail d'un devis
   * @endpoint GET /quotes/:id
   */
  async getById(id: string): Promise<Quote | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (adminDevis.find(q => q.id === id) as unknown as Quote) ?? null;
    }
    return apiClient.get<Quote>(ENDPOINTS.QUOTES.DETAIL(id));
  },

  /**
   * Soumettre un devis (formulaire public)
   * @endpoint POST /quotes
   * @body { entreprise, contact, email, phone, machine, employes, message }
   */
  async create(data: Partial<Quote>): Promise<Quote> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        id: `DEV-${Date.now()}`,
        entreprise: data.entreprise ?? '',
        contact: data.contact ?? '',
        email: data.email ?? '',
        machine: data.machine ?? '',
        employes: data.employes ?? '',
        message: data.message ?? '',
        statut: 'Nouveau',
        date: new Date().toISOString().split('T')[0],
        ...data,
      } as Quote;
    }
    return apiClient.post<Quote>(ENDPOINTS.QUOTES.CREATE, data);
  },

  /**
   * Changer le statut d'un devis (admin)
   * @endpoint PATCH /quotes/:id/status
   * @body { statut }
   */
  async updateStatus(id: string, statut: QuoteStatus): Promise<Quote> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const q = adminDevis.find(d => d.id === id);
      if (!q) throw new Error('Devis introuvable');
      return { ...(q as unknown as Quote), statut };
    }
    return apiClient.patch<Quote>(ENDPOINTS.QUOTES.UPDATE_STATUS(id), { statut });
  },

  /**
   * Définir le montant proposé (admin)
   * @endpoint PATCH /quotes/:id/amount
   * @body { montantPropose }
   */
  async updateAmount(id: string, montantPropose: number): Promise<Quote> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const q = adminDevis.find(d => d.id === id);
      if (!q) throw new Error('Devis introuvable');
      return { ...(q as unknown as Quote), montantPropose };
    }
    return apiClient.patch<Quote>(ENDPOINTS.QUOTES.UPDATE_AMOUNT(id), { montantPropose });
  },

  /**
   * Supprimer un devis (admin)
   * @endpoint DELETE /quotes/:id
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour supprimer des devis.');
    }
    return apiClient.delete(ENDPOINTS.QUOTES.DELETE(id));
  },
};
