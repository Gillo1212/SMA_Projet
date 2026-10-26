/**
 * Service Commandes
 * ──────────────────
 * MOCK → lit les données de src/mocks/admin.ts
 * API  → /orders, avec normalisation du format backend → frontend
 *
 * Attention : le backend identifie une commande par son ID numérique
 * (routes /orders/:id) mais l'affiche par son `order_number`. Le modèle
 * frontend porte donc les deux : `id` (technique) et `reference` (lisible).
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { adminCommandes } from '../mocks/admin';
import {
  parseJSON,
  toNumber,
  formatDate,
  fullName,
  toOrderStatus,
  fromOrderStatus,
  toPaymentMethod,
  fromPaymentMethod,
  toPaymentStatus,
} from './normalize';
import type { Order, OrderItem, OrderStatus, OrderListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Normalisation backend → frontend ───────────────────────────────────────

/** Ligne `order_items` renvoyée par GET /orders/:id */
interface BackendOrderItem {
  id: number;
  item_type: 'machine' | 'product';
  item_id: number;
  item_name: string;
  quantity: number | string;
  unit_price: number | string;
  total_price: number | string;
}

/** Ligne `orders` (+ jointure clients) renvoyée par le backend */
interface BackendOrder {
  id: number;
  order_number: string;
  client_id?: number;
  status: string;
  total_amount: number | string;
  subtotal?: number | string;
  tax_amount?: number | string;
  tax_rate?: number | string | null;
  /** Historique des statuts (GET /orders/:id), du plus récent au plus ancien */
  tracking?: { status: string; note: string | null; created_at: string }[];
  payment_method?: string | null;
  payment_status?: string;
  shipping_address?: string | Record<string, unknown> | null;
  delivery_mode?: 'pickup' | 'standard' | 'express' | null;
  shipping_amount?: number | string;
  promo_code?: string | null;
  discount_amount?: number | string;
  notes?: string | null;
  created_at?: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  items?: BackendOrderItem[];
}

function normalizeItem(raw: BackendOrderItem): OrderItem {
  return {
    productId: String(raw.item_id),
    name: raw.item_name,
    quantity: toNumber(raw.quantity),
    unitPrice: toNumber(raw.unit_price),
  };
}

/** L'adresse est une colonne JSON de forme libre → on l'aplatit pour l'affichage */
function formatAddress(raw: BackendOrder['shipping_address']): string | undefined {
  const addr = parseJSON<Record<string, unknown>>(raw, {});
  const parts = ['address', 'street', 'city', 'country', 'postal_code']
    .map(k => addr[k])
    .filter(v => typeof v === 'string' && v.trim());
  return parts.length ? parts.join(', ') : undefined;
}

function normalizeOrder(raw: BackendOrder): Order {
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeItem) : undefined;

  return {
    id: String(raw.id),
    reference: raw.order_number ?? String(raw.id),
    client: raw.company_name || fullName(raw.first_name, raw.last_name) || 'Client supprimé',
    email: raw.email ?? '',
    phone: raw.phone ?? undefined,
    // La liste ne renvoie pas les articles : le résumé n'existe qu'après getById
    produits: items?.map(i => `${i.quantity}× ${i.name}`).join(', ') ?? '',
    items,
    montant: toNumber(raw.total_amount),
    statut: toOrderStatus(raw.status),
    paiement: toPaymentMethod(raw.payment_method),
    paiementStatut: toPaymentStatus(raw.payment_status),
    date: formatDate(raw.created_at),
    adresseLivraison: formatAddress(raw.shipping_address),
    modeLivraison: raw.delivery_mode ?? undefined,
    fraisLivraison: raw.shipping_amount != null ? toNumber(raw.shipping_amount) : undefined,
    codePromo: raw.promo_code ?? undefined,
    remise: raw.discount_amount != null ? toNumber(raw.discount_amount) : undefined,
    sousTotal: raw.subtotal != null ? toNumber(raw.subtotal) : undefined,
    tva: raw.tax_amount != null ? toNumber(raw.tax_amount) : undefined,
    tauxTVA: raw.tax_rate != null ? toNumber(raw.tax_rate) : undefined,
    historique: Array.isArray(raw.tracking)
      ? raw.tracking.map(t => ({ statut: toOrderStatus(t.status), note: t.note ?? undefined, date: t.created_at }))
      : undefined,
    note: raw.notes ?? undefined,
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export const ordersService = {
  /**
   * Liste des commandes
   * @endpoint GET /orders?status=&search=&page=&limit=
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

    // Le backend filtre sur `status` en anglais
    const { statut, ...rest } = params ?? {};
    const raw = await apiClient.get<BackendOrder[]>(ENDPOINTS.ORDERS.LIST, {
      ...rest,
      status: statut ? fromOrderStatus(statut) : undefined,
    } as Record<string, unknown>);
    return Array.isArray(raw) ? raw.map(normalizeOrder) : [];
  },

  /**
   * Détail d'une commande — seul endpoint qui renvoie les articles
   * @endpoint GET /orders/:id
   */
  async getById(id: string): Promise<Order | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (adminCommandes.find(o => o.id === id) as unknown as Order) ?? null;
    }
    const raw = await apiClient.get<BackendOrder>(ENDPOINTS.ORDERS.DETAIL(id));
    return raw ? normalizeOrder(raw) : null;
  },

  /**
   * Créer une commande (panier → checkout)
   * @endpoint POST /orders
   * @body { items, payment_method, shipping_address, promo_code, notes }
   */
  async create(data: {
    items: { id: string; type: 'machine' | 'product'; quantity: number }[];
    paiement: Order['paiement'];
    adresseLivraison: Record<string, unknown> | string;
    promoCode?: string;
    note?: string;
    /**
     * Mode de livraison. Les frais et la TVA sont calculés par le backend :
     * les envoyer depuis le client permettrait d'en réduire le montant.
     */
    modeLivraison?: 'pickup' | 'standard' | 'express';
  }): Promise<Order> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        id: `CMD-${Date.now()}`,
        reference: `CMD-${Date.now()}`,
        client: '',
        email: '',
        produits: '',
        montant: 0,
        statut: 'En attente',
        paiement: data.paiement,
        date: new Date().toISOString().split('T')[0],
      };
    }

    const raw = await apiClient.post<BackendOrder>(ENDPOINTS.ORDERS.CREATE, {
      items: data.items.map(i => ({
        id: Number(i.id),
        type: i.type,
        quantity: i.quantity,
      })),
      payment_method: fromPaymentMethod(data.paiement),
      shipping_address: data.adresseLivraison,
      promo_code: data.promoCode,
      notes: data.note,
      delivery_mode: data.modeLivraison ?? 'standard',
    });
    return normalizeOrder(raw);
  },

  /**
   * Changer le statut d'une commande (admin)
   * @endpoint PATCH /orders/:id/status
   * @body { status, note }
   */
  async updateStatus(id: string, statut: OrderStatus, note?: string): Promise<void> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return;
    }
    await apiClient.patch(ENDPOINTS.ORDERS.UPDATE_STATUS(id), {
      status: fromOrderStatus(statut),
      note,
    });
  },
};
