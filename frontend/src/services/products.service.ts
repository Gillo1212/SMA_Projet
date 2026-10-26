/**
 * Service Produits
 * ─────────────────
 * MOCK → lit les données de src/mocks/products.ts
 * API  → CRUD sur /products, avec normalisation du format backend → frontend
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { products as mockProducts } from '../mocks/products';
import { parseJSON, toNumber, normalizeCategory } from './normalize';
import type { Product, ProductListParams, Category } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Normalisation backend → frontend ───────────────────────────────────────

/** Forme brute d'une ligne `products` renvoyée par le backend */
interface BackendProduct {
  id: number;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  stock: number | string;
  unit?: string;
  brand?: string | null;
  reference?: string | null;
  image_url?: string | null;
  gallery?: string | string[] | null;
  specifications?: string | Record<string, unknown> | null;
  is_active?: number | boolean;
  is_featured?: number | boolean;
  created_at?: string;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeProduct(raw: BackendProduct): Product {
  const gallery = parseJSON<string[]>(raw.gallery, []);
  const specs   = parseJSON<Record<string, unknown>>(raw.specifications, {});
  const image   = raw.image_url ?? gallery[0] ?? '';

  const createdAt = raw.created_at ? new Date(raw.created_at).getTime() : NaN;
  const isNew = Number.isFinite(createdAt) && Date.now() - createdAt < THIRTY_DAYS_MS;

  return {
    id: String(raw.id),
    sku: raw.reference ?? '',
    name: raw.name,
    category: raw.category_name ?? '',
    categorySlug: raw.category_slug,
    brand: raw.brand ?? '',
    price: toNumber(raw.price),
    format: raw.unit ?? 'unité',
    taste: typeof specs.taste === 'string' ? specs.taste : undefined,
    compatibility: Array.isArray(specs.compatibility) ? specs.compatibility as string[] : [],
    stock: toNumber(raw.stock),
    isAvailable: Boolean(raw.is_active),
    isNew,
    isPopular: Boolean(raw.is_featured),
    images: gallery.length ? gallery : (image ? [image] : []),
    description: raw.description ?? '',
    ingredients: typeof specs.ingredients === 'string' ? specs.ingredients : '',
    allergens: typeof specs.allergens === 'string' ? specs.allergens : '',
    volumeDiscounts: [],
    relatedProducts: [],
    weight: typeof specs.weight === 'string' ? specs.weight : undefined,
  };
}

/** Frontend → corps attendu par POST/PUT /products */
function denormalizeProduct(data: Partial<Product> & { categoryId?: string }): Record<string, unknown> {
  const specifications: Record<string, unknown> = {};
  if (data.ingredients) specifications.ingredients = data.ingredients;
  if (data.allergens)   specifications.allergens = data.allergens;
  if (data.taste)       specifications.taste = data.taste;
  if (data.weight)      specifications.weight = data.weight;
  if (data.compatibility?.length) specifications.compatibility = data.compatibility;

  return {
    category_id: data.categoryId ? Number(data.categoryId) : undefined,
    name: data.name,
    description: data.description ?? '',
    price: data.price ?? 0,
    stock: data.stock ?? 0,
    unit: data.format ?? 'unité',
    brand: data.brand ?? '',
    reference: data.sku ?? '',
    image_url: data.images?.[0] ?? '',
    gallery: data.images ?? [],
    specifications,
    is_active: data.isAvailable ?? true,
    is_featured: data.isPopular ?? false,
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export const productsService = {
  /**
   * Liste des produits
   * @endpoint GET /products?category=&search=&active=&page=&limit=
   */
  async getAll(params?: ProductListParams): Promise<Product[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...mockProducts] as unknown as Product[];
      if (params?.category) {
        results = results.filter(p => p.category === params.category);
      }
      if (params?.available !== undefined) {
        results = results.filter(p => p.isAvailable === params.available);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q),
        );
      }
      return results;
    }

    // Le backend attend `active`, pas `available`
    const { available, ...rest } = params ?? {};
    const raw = await apiClient.get<BackendProduct[]>(ENDPOINTS.PRODUCTS.LIST, {
      ...rest,
      active: available,
    } as Record<string, unknown>);
    return Array.isArray(raw) ? raw.map(normalizeProduct) : [];
  },

  /**
   * Détail d'un produit
   * @endpoint GET /products/:id
   */
  async getById(id: string): Promise<Product | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (mockProducts.find(p => p.id === id) as unknown as Product) ?? null;
    }
    const raw = await apiClient.get<BackendProduct>(ENDPOINTS.PRODUCTS.DETAIL(id));
    return raw ? normalizeProduct(raw) : null;
  },

  /**
   * Catégories de produits (pilotent les filtres admin)
   * @endpoint GET /products/categories
   */
  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      const names = [...new Set(mockProducts.map(p => p.category))];
      return names.map((name, i) => ({ id: String(i + 1), name, slug: name }));
    }
    const raw = await apiClient.get<Parameters<typeof normalizeCategory>[0][]>(
      ENDPOINTS.PRODUCTS.CATEGORIES,
    );
    return Array.isArray(raw) ? raw.map(normalizeCategory) : [];
  },

  /**
   * Créer un produit (admin)
   * @endpoint POST /products
   */
  async create(data: Partial<Product> & { categoryId?: string }): Promise<Product> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour créer des produits.');
    }
    const raw = await apiClient.post<BackendProduct>(
      ENDPOINTS.PRODUCTS.CREATE,
      denormalizeProduct(data),
    );
    return normalizeProduct(raw);
  },

  /**
   * Mettre à jour un produit (admin)
   * @endpoint PUT /products/:id
   */
  async update(id: string, data: Partial<Product> & { categoryId?: string }): Promise<Product> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour modifier des produits.');
    }
    const raw = await apiClient.put<BackendProduct>(
      ENDPOINTS.PRODUCTS.UPDATE(id),
      denormalizeProduct(data),
    );
    return normalizeProduct(raw);
  },

  /**
   * Supprimer un produit (admin)
   * @endpoint DELETE /products/:id
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour supprimer des produits.');
    }
    return apiClient.delete(ENDPOINTS.PRODUCTS.DELETE(id));
  },
};
