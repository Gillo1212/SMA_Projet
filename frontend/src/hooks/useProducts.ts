/**
 * Hook Produits
 * ──────────────
 * const { products, isLoading, error } = useProducts({ category: 'Snacks' });
 * const { product, isLoading } = useProduct('coca-cola-classic');
 */

import { useState, useEffect, useCallback } from 'react';
import { productsService } from '../services/products.service';
import type { Product, ProductListParams } from '../types/models';

// ── Liste ──────────────────────────────────────────────────────────────────

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(params?: ProductListParams): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    productsService
      .getAll(params)
      .then(data => { if (!cancelled) setProducts(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { products, isLoading, error, refetch };
}

// ── Détail ─────────────────────────────────────────────────────────────────

interface UseProductReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

export function useProduct(id: string): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true);

    productsService
      .getById(id)
      .then(data => { if (!cancelled) setProduct(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  return { product, isLoading, error };
}
