/**
 * Service Clients
 * ────────────────
 * MOCK → lit les données de src/mocks/admin.ts
 * API  → /clients, avec normalisation du format backend → frontend
 *
 * Le backend ne propose pas de suppression : un client se désactive via
 * PATCH /clients/:id/toggle-active.
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { adminClients } from '../mocks/admin';
import { toNumber, formatDate, fullName } from './normalize';
import type { Client, ClientStatus, ListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Normalisation backend → frontend ───────────────────────────────────────

/** Ligne `clients` (+ agrégats commandes) renvoyée par le backend */
interface BackendClient {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  is_active: number | boolean;
  last_login?: string | null;
  created_at?: string;
  orders_count?: number | string;
  total_spent?: number | string;
}

function normalizeClient(raw: BackendClient): Client {
  return {
    id: String(raw.id),
    nom: fullName(raw.first_name, raw.last_name),
    entreprise: raw.company_name ?? '-',
    email: raw.email,
    telephone: raw.phone ?? '',
    ville: raw.city ?? '',
    totalCommandes: toNumber(raw.orders_count),
    totalDepenses: toNumber(raw.total_spent),
    dateInscription: formatDate(raw.created_at),
    statut: raw.is_active ? 'Actif' : 'Inactif',
  };
}

/** Frontend → corps attendu par PUT /clients/:id */
function denormalizeClient(data: Partial<Client>): Record<string, unknown> {
  const [first, ...rest] = (data.nom ?? '').trim().split(' ');
  return {
    first_name: first ?? '',
    last_name: rest.join(' '),
    company_name: data.entreprise,
    phone: data.telephone,
    city: data.ville,
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export const clientsService = {
  /**
   * Liste des clients (admin)
   * @endpoint GET /clients?search=&active=&page=&limit=
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
      if (params?.statut) {
        results = results.filter(c => c.statut === params.statut);
      }
      return results;
    }

    // Le backend attend `active` en booléen, pas un statut français
    const { statut, ...rest } = params ?? {};
    const raw = await apiClient.get<BackendClient[]>(ENDPOINTS.CLIENTS.LIST, {
      ...rest,
      active: statut ? statut === 'Actif' : undefined,
    } as Record<string, unknown>);
    return Array.isArray(raw) ? raw.map(normalizeClient) : [];
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
    const raw = await apiClient.get<BackendClient>(ENDPOINTS.CLIENTS.DETAIL(id));
    return raw ? normalizeClient(raw) : null;
  },

  /**
   * Mettre à jour un client (admin)
   * @endpoint PUT /clients/:id
   */
  async update(id: string, data: Partial<Client>): Promise<Client> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour modifier des clients.');
    }
    const raw = await apiClient.put<BackendClient>(
      ENDPOINTS.CLIENTS.UPDATE(id),
      denormalizeClient(data),
    );
    return normalizeClient(raw);
  },

  /**
   * Activer / désactiver un client (admin)
   * @endpoint PATCH /clients/:id/toggle-active
   */
  async toggleActive(id: string): Promise<void> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour activer/désactiver un client.');
    }
    await apiClient.patch(ENDPOINTS.CLIENTS.TOGGLE_ACTIVE(id));
  },
};
