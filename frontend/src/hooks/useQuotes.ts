/**
 * Hook Devis
 * ───────────
 * const { quotes, isLoading, updateStatus, updateAmount, refetch } = useQuotes();
 */

import { useState, useEffect, useCallback } from 'react';
import { quotesService } from '../services/quotes.service';
import { notifyAdminDataChanged } from '../services/adminEvents';
import type { Quote, QuoteStatus, QuoteListParams } from '../types/models';

interface UseQuotesReturn {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  updateStatus: (id: string, statut: QuoteStatus) => Promise<void>;
  updateAmount: (id: string, montantPropose: number, statut?: QuoteStatus) => Promise<void>;
  /** Envoie la proposition chiffrée au contact (statut « Devis envoyé ») */
  sendProposal: (id: string, proposal: { montant: number; validite?: string; reponse?: string }) => Promise<void>;
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

  /**
   * Applique une modification optimiste ; en cas d'échec, remet le devis tel
   * qu'il était sans recharger la page (un rechargement effacerait l'erreur).
   */
  const optimistic = useCallback(async (id: string, patch: Partial<Quote>, call: () => Promise<void>) => {
    let previous: Quote | undefined;
    setQuotes(prev => prev.map(q => {
      if (q.id !== id) return q;
      previous = q;
      return { ...q, ...patch };
    }));
    try {
      await call();
      notifyAdminDataChanged();
    } catch (e) {
      if (previous) setQuotes(prev => prev.map(q => (q.id === id ? previous! : q)));
      throw e;
    }
  }, []);

  const updateStatus = useCallback(
    (id: string, statut: QuoteStatus) => optimistic(id, { statut }, () => quotesService.updateStatus(id, statut)),
    [optimistic],
  );

  /**
   * Chiffre un devis. Le backend n'expose que PATCH /quotes/:id/status, qui
   * porte aussi le montant : proposer un montant fait donc passer le devis
   * à « Devis envoyé », sauf statut explicite.
   */
  const updateAmount = useCallback(
    (id: string, montantPropose: number, statut: QuoteStatus = 'Devis envoyé') =>
      optimistic(id, { montantPropose, statut }, () => quotesService.updateAmount(id, montantPropose, statut)),
    [optimistic],
  );

  const sendProposal = useCallback(
    (id: string, proposal: { montant: number; validite?: string; reponse?: string }) =>
      optimistic(
        id,
        { statut: 'Devis envoyé', montantPropose: proposal.montant, validite: proposal.validite, notes: proposal.reponse },
        () => quotesService.sendProposal(id, proposal),
      ),
    [optimistic],
  );

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { quotes, isLoading, error, updateStatus, updateAmount, sendProposal, refetch };
}
