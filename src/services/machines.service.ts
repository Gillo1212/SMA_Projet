/**
 * Service Machines
 * ─────────────────
 * MOCK → lit les données de src/mocks/machines.ts
 * API  → CRUD sur /machines avec normalisation du format backend → frontend
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { machines as mockMachines } from '../mocks/machines';
import { normalizeCategory } from './normalize';
import type { Machine, MachineListParams, Category } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Normalisation backend → frontend ───────────────────────────────────────

/** Forme brute retournée par le backend MySQL */
interface BackendMachine {
  id: number;
  name: string;
  slug: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  price: number | string;
  stock: number;
  description?: string;
  image_url?: string;
  gallery?: string | string[];
  specifications?: string | Record<string, string>;
  payment_modes?: string | string[];
  brand?: string;
  model_ref?: string;
  delivery_delay?: string;
  is_active?: number | boolean;
  is_featured?: number | boolean;
  unit?: string;
}

/** Parse safely a JSON string or returns fallback */
function parseJSON<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T; } catch { return fallback; }
  }
  if (typeof value === 'object') return value as T;
  return fallback;
}

/** Derive machine type from category name */
function getMachineType(categoryName = ''): Machine['type'] {
  const lower = categoryName.toLowerCase();
  if (lower.includes('café') || lower.includes('cafe')) return 'cafe';
  if (lower.includes('frigo') || lower.includes('réfrigé') || lower.includes('refrig') || lower.includes('glace')) return 'combine';
  if (lower.includes('combiné') || lower.includes('combine')) return 'combine';
  return 'snacks';
}

/** Map backend payment_modes to frontend keys used in UI checks */
const paymentModeMap: Record<string, string> = {
  wave: 'wave',
  orange_money: 'orange',
  carte_bancaire: 'carte',
  card: 'carte',
  bank_transfer: 'carte',
  especes: 'especes',
  cash: 'especes',
  qr_code: 'qr',
};

/** Convert stock number to display label */
function stockLabel(stock: number): Machine['stock'] {
  if (stock === 0) return 'Rupture de stock';
  if (stock <= 3) return 'Stock limité';
  return 'En stock';
}

/** Format price in FCFA */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

/** Convert a backend machine row to the frontend Machine shape */
function normalizeMachine(raw: BackendMachine): Machine {
  const gallery = parseJSON<string[]>(raw.gallery, []);
  const specs   = parseJSON<Record<string, string>>(raw.specifications, {});
  const modes   = parseJSON<string[]>(raw.payment_modes, []);

  const price    = Number(raw.price) || 0;
  const imageUrl = raw.image_url ?? gallery[0] ?? '';

  // Ensure gallery always has at least the main image
  const galleryImages = gallery.length > 0 ? gallery : (imageUrl ? [imageUrl] : []);

  // Map & deduplicate payment methods
  const paymentMethods = [...new Set(
    modes.map(m => paymentModeMap[m] ?? m).filter(Boolean),
  )];

  // Short description = first sentence of description
  const shortDescription = raw.description
    ? (raw.description.split(/[.!?]/)[0] ?? raw.description).trim() + '.'
    : '';

  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    type: getMachineType(raw.category_name),
    category: raw.category_name ?? '',
    categoryId: raw.category_id != null ? String(raw.category_id) : undefined,
    price,
    priceDisplay: price > 0 ? formatPrice(price) : 'Sur devis',
    badge: raw.is_featured ? 'Populaire' : undefined,
    shortDescription,
    description: raw.description ?? '',
    image: imageUrl,
    gallery: galleryImages,
    capacity: {},
    specifications: specs,
    features: [],
    paymentMethods,
    idealFor: [],
    maintenanceIncluded: false,
    deliveryTime: raw.delivery_delay ?? '',
    stock: stockLabel(Number(raw.stock) || 0),
    stockQuantity: Number(raw.stock) || 0,
  };
}

// ── Dénormalisation frontend → backend ─────────────────────────────────────

/** Inverse de paymentModeMap : clés d'UI → valeurs attendues en base */
const paymentModeReverseMap: Record<string, string> = {
  wave: 'wave',
  orange: 'orange_money',
  carte: 'card',
  especes: 'cash',
  qr: 'qr_code',
};

/** Quantité par défaut déduite du libellé quand la valeur réelle est absente */
const stockFromLabel: Record<Machine['stock'], number> = {
  'En stock': 10,
  'Stock limité': 3,
  'Rupture de stock': 0,
};

/** Convertit une Machine du formulaire admin vers le corps attendu par l'API */
function denormalizeMachine(data: Partial<Machine>): Record<string, unknown> {
  const paymentModes = (data.paymentMethods ?? []).map(
    m => paymentModeReverseMap[m] ?? m,
  );

  return {
    category_id: data.categoryId ? Number(data.categoryId) : undefined,
    name: data.name,
    description: data.description || data.shortDescription || '',
    price: data.price ?? 0,
    stock: data.stockQuantity ?? (data.stock ? stockFromLabel[data.stock] : 0),
    brand: data.category ?? '',
    delivery_delay: data.deliveryTime ?? '',
    image_url: data.image ?? '',
    gallery: data.gallery ?? [],
    specifications: data.specifications ?? {},
    payment_modes: paymentModes,
    is_active: true,
    is_featured: Boolean(data.badge),
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export const machinesService = {
  /**
   * Liste des machines (avec filtres optionnels)
   * @endpoint GET /machines?search=&page=&limit=
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

    const raw = await apiClient.get<BackendMachine[]>(
      ENDPOINTS.MACHINES.LIST,
      params as Record<string, unknown>,
    );
    return Array.isArray(raw) ? raw.map(normalizeMachine) : [];
  },

  /**
   * Détail d'une machine par slug
   * @endpoint GET /machines/slug/:slug
   */
  async getBySlug(slug: string): Promise<Machine | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const found = mockMachines.find(m => m.slug === slug) as unknown as Machine | undefined;
      return found ?? null;
    }
    const raw = await apiClient.get<BackendMachine>(ENDPOINTS.MACHINES.BY_SLUG(slug));
    return raw ? normalizeMachine(raw) : null;
  },

  /**
   * Détail d'une machine par ID ou slug
   * @endpoint GET /machines/:id  |  GET /machines/slug/:slug
   */
  async getById(id: string): Promise<Machine | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const found = mockMachines.find(
        m => m.id === id || m.slug === id,
      ) as unknown as Machine | undefined;
      return found ?? null;
    }

    // Si l'id ressemble à un slug (non numérique), utiliser /slug/:slug
    if (isNaN(Number(id))) {
      return this.getBySlug(id);
    }
    const raw = await apiClient.get<BackendMachine>(ENDPOINTS.MACHINES.DETAIL(id));
    return raw ? normalizeMachine(raw) : null;
  },

  /**
   * Catégories de machines — nécessaires pour créer/modifier une machine
   * (le backend exige un `category_id` numérique)
   * @endpoint GET /machines/categories
   */
  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const names = [...new Set(mockMachines.map(m => m.category))];
      return names.map((name, i) => ({ id: String(i + 1), name, slug: name }));
    }
    const raw = await apiClient.get<Parameters<typeof normalizeCategory>[0][]>(
      ENDPOINTS.MACHINES.CATEGORIES,
    );
    return Array.isArray(raw) ? raw.map(normalizeCategory) : [];
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
    const raw = await apiClient.post<BackendMachine>(
      ENDPOINTS.MACHINES.CREATE,
      denormalizeMachine(data),
    );
    return normalizeMachine(raw);
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
    const raw = await apiClient.put<BackendMachine>(
      ENDPOINTS.MACHINES.UPDATE(id),
      denormalizeMachine(data),
    );
    return normalizeMachine(raw);
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
