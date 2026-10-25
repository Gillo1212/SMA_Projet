/**
 * Service Blog
 * ─────────────
 * MOCK → lit les données de src/mocks/blog.ts
 * API  → CRUD sur /blog, avec normalisation du format backend → frontend
 *
 * Deux particularités backend :
 *  - la liste (GET /blog) ne renvoie PAS le contenu de l'article : il faut
 *    passer par GET /blog/:slug avant d'ouvrir un formulaire d'édition ;
 *  - la création attend un `category_id` numérique, pas un slug.
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import { blogArticles, blogCategories } from '../mocks/blog';
import { fullName, normalizeCategory } from './normalize';

function toISODate(value: unknown): string {
  if (!value) return '';
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** Le compte technique « Super Admin » n'a pas à apparaître comme auteur public */
function publicAuthor(name: string): string {
  return !name || /^super admin$/i.test(name.trim()) ? 'Équipe SMALIM' : name;
}
import type { BlogPost, BlogListParams, BlogStatus, Category } from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Normalisation backend → frontend ───────────────────────────────────────

/** Ligne `blog_articles` (+ jointures catégorie / auteur) */
interface BackendArticle {
  id: number;
  category_id?: number;
  category_name?: string | null;
  category_slug?: string | null;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  read_time?: number | string;
  status: BlogStatus;
  views_count?: number | string;
  published_at?: string | null;
  created_at?: string;
  author_first?: string | null;
  author_last?: string | null;
}

function normalizeArticle(raw: BackendArticle): BlogPost {
  return {
    id: String(raw.id),
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? '',
    // Absent de la liste — seul GET /blog/:slug le renvoie
    content: raw.content ?? '',
    category: raw.category_slug ?? '',
    categoryName: raw.category_name ?? undefined,
    categoryId: raw.category_id != null ? String(raw.category_id) : undefined,
    // Date ISO (AAAA-MM-JJ), comme les mocks : les pages la formatent à l'affichage
    date: toISODate(raw.published_at ?? raw.created_at),
    author: publicAuthor(fullName(raw.author_first, raw.author_last)),
    authorRole: 'Rédaction',
    readTime: `${raw.read_time ?? 5} min`,
    image: raw.image_url ?? '',
    status: raw.status,
    published: raw.status === 'published',
  };
}

/** Frontend → corps attendu par POST/PUT /blog */
function denormalizeArticle(data: Partial<BlogPost>): Record<string, unknown> {
  const readTime = parseInt(String(data.readTime ?? '5'), 10);
  return {
    category_id: data.categoryId ? Number(data.categoryId) : undefined,
    title: data.title,
    excerpt: data.excerpt ?? '',
    content: data.content ?? '',
    image_url: data.image || undefined,
    read_time: Number.isFinite(readTime) && readTime > 0 ? readTime : 5,
    status: data.status ?? (data.published ? 'published' : 'draft'),
  };
}

// ── Service ────────────────────────────────────────────────────────────────

export const blogService = {
  /**
   * Liste des articles
   * @endpoint GET /blog?category=&status=&search=&page=&limit=
   */
  async getAll(params?: BlogListParams): Promise<BlogPost[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      let results = [...blogArticles] as unknown as BlogPost[];
      if (params?.category && params.category !== 'all') {
        results = results.filter(p => p.category === params.category);
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

    const { category, ...rest } = params ?? {};
    const raw = await apiClient.get<BackendArticle[]>(ENDPOINTS.BLOG.LIST, {
      ...rest,
      category: category === 'all' ? undefined : category,
    } as Record<string, unknown>);
    return Array.isArray(raw) ? raw.map(normalizeArticle) : [];
  },

  /**
   * Détail d'un article par slug — seul endpoint qui renvoie le contenu
   * @endpoint GET /blog/:slug
   */
  async getBySlug(slug: string): Promise<BlogPost | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (blogArticles.find(p => p.slug === slug) as unknown as BlogPost) ?? null;
    }
    const raw = await apiClient.get<BackendArticle>(ENDPOINTS.BLOG.BY_SLUG(slug));
    return raw ? normalizeArticle(raw) : null;
  },

  /**
   * Détail par ID.
   * Le backend n'expose que /blog/:slug — on retombe donc sur le slug.
   */
  async getById(id: string): Promise<BlogPost | null> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return (blogArticles.find(p => p.id === id) as unknown as BlogPost) ?? null;
    }
    return this.getBySlug(id);
  },

  /**
   * Catégories du blog (pilotent les filtres admin)
   * @endpoint GET /blog/categories
   */
  async getCategories(): Promise<Category[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return blogCategories
        .filter(c => c.id !== 'all')
        .map(c => ({ id: c.id, name: c.name, slug: c.id }));
    }
    const raw = await apiClient.get<Parameters<typeof normalizeCategory>[0][]>(
      ENDPOINTS.BLOG.CATEGORIES,
    );
    return Array.isArray(raw) ? raw.map(normalizeCategory) : [];
  },

  /**
   * Créer un article (admin)
   * @endpoint POST /blog
   */
  async create(data: Partial<BlogPost>): Promise<BlogPost> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour créer des articles.');
    }
    const raw = await apiClient.post<BackendArticle>(
      ENDPOINTS.BLOG.CREATE,
      denormalizeArticle(data),
    );
    return normalizeArticle(raw);
  },

  /**
   * Mettre à jour un article (admin)
   * @endpoint PUT /blog/:id
   */
  async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    if (USE_MOCK) {
      throw new Error('[MOCK] Connecte ton API pour modifier des articles.');
    }
    const raw = await apiClient.put<BackendArticle>(
      ENDPOINTS.BLOG.UPDATE(id),
      denormalizeArticle(data),
    );
    return normalizeArticle(raw);
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
};
