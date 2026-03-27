/**
 * Service Blog
 * ─────────────
 * MOCK → lit les données de src/mocks/blog.ts
 * API  → CRUD sur /blog  (backend : router montée sur /api/blog)
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { blogArticles, blogCategories } from '../mocks/blog';
import type { BlogPost, BlogCategory, ListParams } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const blogService = {
  /**
   * Liste des articles
   * @endpoint GET /blog?category=&search=&page=&limit=
   */
  async getAll(
    params?: ListParams & { category?: BlogCategory | 'all' },
  ): Promise<BlogPost[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...blogArticles] as unknown as BlogPost[];
      const cat = (params as { category?: string })?.category;
      if (cat && cat !== 'all') {
        results = results.filter(p => p.category === cat);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          p =>
            p.title.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q),
        );
      }
      return results;
    }

    return apiClient.get<BlogPost[]>(
      ENDPOINTS.BLOG.LIST,
      params as Record<string, unknown>,
    );
  },

  /**
   * Détail d'un article par ID
   * @endpoint GET /blog/:id
   */
  async getById(id: string): Promise<BlogPost | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (blogArticles.find(p => p.id === id) as unknown as BlogPost) ?? null;
    }
    return apiClient.get<BlogPost>(ENDPOINTS.BLOG.DETAIL(id));
  },

  /**
   * Détail d'un article par slug
   * @endpoint GET /blog/:slug  (le backend utilise le même param :slug)
   */
  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (blogArticles.find(p => p.slug === slug) as unknown as BlogPost) ?? null;
    }
    return apiClient.get<BlogPost>(ENDPOINTS.BLOG.BY_SLUG(slug));
  },

  /**
   * Créer un article (admin)
   * @endpoint POST /blog
   */
  async create(data: Partial<BlogPost>): Promise<BlogPost> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour créer des articles.');
    }
    return apiClient.post<BlogPost>(ENDPOINTS.BLOG.CREATE, data);
  },

  /**
   * Mettre à jour un article (admin)
   * @endpoint PUT /blog/:id
   */
  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour modifier des articles.');
    }
    return apiClient.put<BlogPost>(ENDPOINTS.BLOG.UPDATE(id), data);
  },

  /**
   * Supprimer un article (admin)
   * @endpoint DELETE /blog/:id
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour supprimer des articles.');
    }
    return apiClient.delete(ENDPOINTS.BLOG.DELETE(id));
  },

  /** Retourne les catégories disponibles */
  getCategories() {
    return blogCategories;
  },
};
