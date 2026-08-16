/**
 * Normalisation backend → frontend
 * ─────────────────────────────────
 * Le backend MySQL renvoie du snake_case anglais (`status`, `total_amount`,
 * `first_name`) alors que les modèles de `types/models.ts` sont en français
 * plat (`statut`, `montant`, `nom`). Ces helpers font la traduction dans les
 * deux sens, sur le même principe que `normalizeMachine` dans machines.service.
 */

import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  QuoteStatus,
  Category,
} from '../types/models';

// ── Utilitaires génériques ─────────────────────────────────────────────────

/** Parse une colonne JSON MySQL (string ou déjà désérialisée) */
export function parseJSON<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  if (typeof value === 'object') return value as T;
  return fallback;
}

/** DECIMAL MySQL arrive en string via mysql2 — toujours passer par Number */
export function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** DATETIME MySQL → JJ/MM/AAAA */
export function formatDate(value: unknown): string {
  if (!value) return '';
  const d = new Date(value as string);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Mois court utilisé par le graphe de revenus : "2024-03" → "Mar" */
export function formatMonth(yyyymm: string): string {
  const [year, month] = String(yyyymm).split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  if (isNaN(d.getTime())) return String(yyyymm);
  const label = d.toLocaleDateString('fr-FR', { month: 'short' });
  return label.charAt(0).toUpperCase() + label.slice(1).replace('.', '');
}

/** Concatène prénom + nom en ignorant les valeurs vides */
export function fullName(first?: string | null, last?: string | null): string {
  return [first, last].filter(Boolean).join(' ').trim();
}

/** Inverse un dictionnaire de correspondance */
function invert<K extends string, V extends string>(map: Record<K, V>): Record<V, K> {
  return Object.fromEntries(
    Object.entries(map).map(([k, v]) => [v, k]),
  ) as Record<V, K>;
}

// ── Statuts commande ───────────────────────────────────────────────────────

const ORDER_STATUS_FR: Record<string, OrderStatus> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  processing: 'En préparation',
  shipped:    'Expédiée',
  delivered:  'Livrée',
  cancelled:  'Annulée',
  refunded:   'Remboursée',
};

const ORDER_STATUS_EN = invert(ORDER_STATUS_FR);

/** Tous les statuts commande, dans l'ordre du cycle de vie */
export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'En attente', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée', 'Remboursée',
];

export function toOrderStatus(raw: unknown): OrderStatus {
  return ORDER_STATUS_FR[String(raw)] ?? 'En attente';
}

export function fromOrderStatus(statut: OrderStatus): string {
  return ORDER_STATUS_EN[statut] ?? 'pending';
}

// ── Statuts devis ──────────────────────────────────────────────────────────

const QUOTE_STATUS_FR: Record<string, QuoteStatus> = {
  pending:    'Nouveau',
  processing: 'En cours',
  quoted:     'Devis envoyé',
  accepted:   'Accepté',
  refused:    'Refusé',
  expired:    'Expiré',
};

const QUOTE_STATUS_EN = invert(QUOTE_STATUS_FR);

export const ALL_QUOTE_STATUSES: QuoteStatus[] = [
  'Nouveau', 'En cours', 'Devis envoyé', 'Accepté', 'Refusé', 'Expiré',
];

export function toQuoteStatus(raw: unknown): QuoteStatus {
  return QUOTE_STATUS_FR[String(raw)] ?? 'Nouveau';
}

export function fromQuoteStatus(statut: QuoteStatus): string {
  return QUOTE_STATUS_EN[statut] ?? 'pending';
}

// ── Paiement ───────────────────────────────────────────────────────────────

const PAYMENT_METHOD_FR: Record<string, PaymentMethod> = {
  wave:          'Wave',
  orange_money:  'Orange Money',
  bank_transfer: 'Virement bancaire',
  card:          'Carte bancaire',
  cash:          'Espèces',
};

const PAYMENT_METHOD_EN = invert(PAYMENT_METHOD_FR);

export function toPaymentMethod(raw: unknown): PaymentMethod {
  return PAYMENT_METHOD_FR[String(raw)] ?? 'Non renseigné';
}

export function fromPaymentMethod(paiement: PaymentMethod): string | undefined {
  return PAYMENT_METHOD_EN[paiement];
}

const PAYMENT_STATUS_FR: Record<string, PaymentStatus> = {
  pending:  'En attente',
  paid:     'Payée',
  failed:   'Échouée',
  refunded: 'Remboursée',
};

export function toPaymentStatus(raw: unknown): PaymentStatus {
  return PAYMENT_STATUS_FR[String(raw)] ?? 'En attente';
}

// ── Catégories ─────────────────────────────────────────────────────────────

interface BackendCategory {
  id: number | string;
  name: string;
  slug: string;
  articles_count?: number | string;
}

export function normalizeCategory(raw: BackendCategory): Category {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    articlesCount:
      raw.articles_count !== undefined ? toNumber(raw.articles_count) : undefined,
  };
}
