/**
 * Hook Blog
 * ──────────
 * const { posts, isLoading } = useBlogPosts({ category: 'conseils' });
 * const { post, isLoading } = useBlogPost({ slug: 'mon-article' });
 */

import { useState, useEffect, useCallback } from 'react';
import { blogService } from '../services/blog.service';
import type { BlogPost, BlogCategory, ListParams } from '../types/models';

// ── Liste ──────────────────────────────────────────────────────────────────

interface UseBlogPostsReturn {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  create: (data: Partial<BlogPost>) => Promise<BlogPost>;
  update: (id: string, data: Partial<BlogPost>) => Promise<BlogPost>;
  remove: (id: string) => Promise<void>;
}

export function useBlogPosts(
  params?: ListParams & { category?: BlogCategory | 'all' },
): UseBlogPostsReturn {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    blogService
      .getAll(params)
      .then(data => { if (!cancelled) setPosts(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  const create = useCallback(async (data: Partial<BlogPost>) => {
    const created = await blogService.create(data);
    setPosts(prev => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: Partial<BlogPost>) => {
    const updated = await blogService.update(id, data);
    setPosts(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await blogService.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  return { posts, isLoading, error, refetch, create, update, remove };
}

// ── Détail ─────────────────────────────────────────────────────────────────

interface UseBlogPostReturn {
  post: BlogPost | null;
  isLoading: boolean;
  error: string | null;
}

export function useBlogPost(opts: { id?: string; slug?: string }): UseBlogPostReturn {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = opts.id ?? opts.slug;
    if (!key) { setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true);

    const fetch = opts.id
      ? blogService.getById(opts.id)
      : blogService.getBySlug(opts.slug!);

    fetch
      .then(data => { if (!cancelled) setPost(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [opts.id, opts.slug]);

  return { post, isLoading, error };
}
