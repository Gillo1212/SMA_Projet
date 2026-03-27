/**
 * Hook Devis
 * ───────────
 * const { quotes, isLoading, updateStatus, updateAmount, refetch } = useQuotes();
 */

import { useState, useEffect, useCallback } from 'react';
import { quotesService } from '../services/quotes.service';
import type { Quote, QuoteStatus, QuoteListParams } from '../types/models';

interface UseQuotesReturn {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  updateStatus: (id: string, statut: QuoteStatus) => Promise<void>;
  updateAmount: (id: string, montantPropose: number) => Promise<void>;
  refetch: () => void;
}

export function useQuotes(params?: QuoteListParams): UseQuotesReturn {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    quotesService
      .getAll(params)
      .then(data => { if (!cancelled) setQuotes(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, tick]);

  const updateStatus = useCallback(async (id: string, statut: QuoteStatus) => {
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, statut } : q)));
    try {
      await quotesService.updateStatus(id, statut);
    } catch (e) {
      setTick(t => t + 1);
      throw e;
    }
  }, []);

  const updateAmount = useCallback(
    async (id: string, montantPropose: number) => {
      setQuotes(prev =>
        prev.map(q => (q.id === id ? { ...q, montantPropose } : q)),
      );
      try {
        await quotesService.updateAmount(id, montantPropose);
      } catch (e) {
        setTick(t => t + 1);
        throw e;
      }
    },
    [],
  );

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { quotes, isLoading, error, updateStatus, updateAmount, refetch };
}
