/**
 * Hook Machines
 * ──────────────
 * const { machines, isLoading, error, refetch } = useMachines({ type: 'cafe' });
 * const { machine, isLoading } = useMachine('sma-cafe-pro-200');
 */

import { useState, useEffect, useCallback } from 'react';
import { machinesService } from '../services/machines.service';
import type { Machine, MachineListParams } from '../types/models';

// ── Liste ──────────────────────────────────────────────────────────────────

interface UseMachinesReturn {
  machines: Machine[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMachines(params?: MachineListParams): UseMachinesReturn {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    machinesService
      .getAll(params)
      .then(data => { if (!cancelled) setMachines(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, tick]);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { machines, isLoading, error, refetch };
}

// ── Détail ─────────────────────────────────────────────────────────────────

interface UseMachineReturn {
  machine: Machine | null;
  isLoading: boolean;
  error: string | null;
}

export function useMachine(id: string): UseMachineReturn {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    machinesService
      .getById(id)
      .then(data => { if (!cancelled) setMachine(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  return { machine, isLoading, error };
}
