/**
 * Service Devis
 * ──────────────
 * MOCK → lit les données de src/mocks/admin.ts
 * API  → /quotes, avec normalisation du format backend → frontend
 *
 * Le backend n'expose qu'une seule route de mise à jour :
 * PATCH /quotes/:id/status, qui accepte statut ET montant proposé.
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { adminDevis } from '../mocks/admin';
import {
  toNumber,
  formatDate,
  toQuoteStatus,
  fromQuoteStatus,
} from './normalize';
import type { Quote, QuoteStatus, QuoteListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Normalisation backend → frontend ───────────────────────────────────────

/** Ligne `quotes` renvoyée par le backend */
interface BackendQuote {
  id: number;
  quote_number: string;
  client_id?: number | null;
  company_name?: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone?: string | null;
  machine_type?: string | null;
  description: string;
  budget?: number | string | null;
  quantity: number | string;
  status: string;
  proposed_amount?: number | string | null;
  admin_response?: string | null;
  notes?: string | null;
  created_at?: string;
  client_email?: string | null;
}

function normalizeQuote(raw: BackendQuote): Quote {
  return {
    id: String(raw.id),
    reference: raw.quote_number ?? String(raw.id),
    entreprise: raw.company_name || 'Particulier',
    contact: raw.contact_name,
    email: raw.contact_email || raw.client_email || '',
    phone: raw.contact_phone ?? undefined,
    machine: raw.machine_type ?? '',
    quantite: toNumber(raw.quantity),
    message: raw.description ?? '',
    statut: toQuoteStatus(raw.status),
    date: formatDate(raw.created_at),
    budget: raw.budget != null ? toNumber(raw.budget) : undefined,
    montantPropose: raw.proposed_amount != null ? toNumber(raw.proposed_amount) : undefined,
    notes: raw.admin_response ?? raw.notes ?? undefined,
  };
}

/** Corps envoyé à PATCH /quotes/:id/status */
interface QuoteStatusPayload {
  status: string;
  proposed_amount?: number;
  admin_response?: string;
}

// ── Service ────────────────────────────────────────────────────────────────

export const quotesService = {
  /**
   * Liste des devis
   * @endpoint GET /quotes?status=&search=&page=&limit=
   */
  async getAll(params?: QuoteListParams): Promise<Quote[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...adminDevis] as unknown as Quote[];
      if (params?.statut) {
        results = results.filter(q => q.statut === params.statut);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          d =>
            d.entreprise.toLowerCase().includes(q) ||
            d.contact.toLowerCase().includes(q) ||
            d.email.toLowerCase().includes(q),
        );
      }
      return results;
    }

    const { statut, ...rest } = params ?? {};
    const raw = await apiClient.get<BackendQuote[]>(ENDPOINTS.QUOTES.LIST, {
      ...rest,
      status: statut ? fromQuoteStatus(statut) : undefined,
    } as Record<string, unknown>);
    return Array.isArray(raw) ? raw.map(normalizeQuote) : [];
  },

  /**
   * Détail d'un devis
   * @endpoint GET /quotes/:id
   */
  async getById(id: string): Promise<Quote | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (adminDevis.find(d => d.id === id) as unknown as Quote) ?? null;
    }
    const raw = await apiClient.get<BackendQuote>(ENDPOINTS.QUOTES.DETAIL(id));
    return raw ? normalizeQuote(raw) : null;
  },

  /**
   * Créer une demande de devis (formulaire public)
   * @endpoint POST /quotes
   */
  async create(data: {
    entreprise?: string;
    contact: string;
    email: string;
    phone?: string;
    machine: string;
    message: string;
    quantite?: number;
    budget?: number;
  }): Promise<Quote> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        id: `DEV-${Date.now()}`,
        reference: `DEV-${Date.now()}`,
        entreprise: data.entreprise ?? 'Particulier',
        contact: data.contact,
        email: data.email,
        phone: data.phone,
        machine: data.machine,
        quantite: data.quantite ?? 1,
        message: data.message,
        statut: 'Nouveau',
        date: new Date().toISOString().split('T')[0],
      };
    }

    const raw = await apiClient.post<BackendQuote>(ENDPOINTS.QUOTES.CREATE, {
      company_name: data.entreprise,
      contact_name: data.contact,
      contact_email: data.email,
      contact_phone: data.phone,
      machine_type: data.machine,
      description: data.message,
      quantity: data.quantite ?? 1,
      budget: data.budget,
    });
    return normalizeQuote(raw);
  },

  /**
   * Changer le statut d'un devis (admin)
   * @endpoint PATCH /quotes/:id/status
   */
  async updateStatus(id: string, statut: QuoteStatus, reponse?: string): Promise<void> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return;
    }
    const payload: QuoteStatusPayload = { status: fromQuoteStatus(statut) };
    if (reponse) payload.admin_response = reponse;
    await apiClient.patch(ENDPOINTS.QUOTES.UPDATE_STATUS(id), payload);
  },

  /**
   * Définir le montant proposé (admin).
   * Passe par la même route que le statut : celui-ci doit donc être renvoyé
   * pour ne pas être écrasé côté backend.
   * @endpoint PATCH /quotes/:id/status
   */
  async updateAmount(id: string, montantPropose: number, statut: QuoteStatus): Promise<void> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return;
    }
    const payload: QuoteStatusPayload = {
      status: fromQuoteStatus(statut),
      proposed_amount: montantPropose,
    };
    await apiClient.patch(ENDPOINTS.QUOTES.UPDATE_STATUS(id), payload);
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
