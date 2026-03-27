/**
 * Service Produits
 * ─────────────────
 * MOCK → lit les données de src/mocks/products.ts
 * API  → CRUD sur /products
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { products as mockProducts } from '../mocks/products';
import type { Product, ProductListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const productsService = {
  /**
   * Liste des produits
   * @endpoint GET /products?category=&search=&available=&page=&limit=
   */
  async getAll(params?: ProductListParams): Promise<Product[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...mockProducts] as Product[];
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

    return apiClient.get<Product[]>(
      ENDPOINTS.PRODUCTS.LIST,
      params as Record<string, unknown>,
    );
  },

  /**
   * Détail d'un produit
   * @endpoint GET /products/:id
   */
  async getById(id: string): Promise<Product | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (mockProducts.find(p => p.id === id) as Product) ?? null;
    }
    return apiClient.get<Product>(ENDPOINTS.PRODUCTS.DETAIL(id));
  },

  /**
   * Créer un produit (admin)
   * @endpoint POST /products
   */
  async create(data: Partial<Product>): Promise<Product> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour créer des produits.');
    }
    return apiClient.post<Product>(ENDPOINTS.PRODUCTS.CREATE, data);
  },

  /**
   * Mettre à jour un produit (admin)
   * @endpoint PUT /products/:id
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour modifier des produits.');
    }
    return apiClient.put<Product>(ENDPOINTS.PRODUCTS.UPDATE(id), data);
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
