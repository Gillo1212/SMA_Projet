/**
 * Hook Dashboard
 * ──────────────
 * Charge toutes les données du tableau de bord en parallèle.
 *
 * const { stats, revenue, recentOrders, pendingQuotes, isLoading, error, refetch } = useDashboard();
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardData } from '../services/dashboard.service';

interface UseDashboardReturn extends Partial<DashboardData> {
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    dashboardService
      .getAll()
      .then(d => {
        if (!cancelled) setData(d);
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return {
    stats: data?.stats,
    revenue: data?.revenue,
    statusBreakdown: data?.statusBreakdown,
    recentOrders: data?.recentOrders,
    pendingQuotes: data?.pendingQuotes,
    isLoading,
    error,
    refetch,
  };
}
