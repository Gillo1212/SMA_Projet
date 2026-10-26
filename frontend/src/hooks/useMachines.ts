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
  create: (data: Partial<Machine>) => Promise<Machine>;
  update: (id: string, data: Partial<Machine>) => Promise<Machine>;
  remove: (id: string) => Promise<void>;
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

  // Les mutations mettent la liste locale à jour ; en cas d'échec l'erreur
  // remonte à l'appelant, qui décide de l'affichage.
  const create = useCallback(async (data: Partial<Machine>) => {
    const created = await machinesService.create(data);
    setMachines(prev => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, data: Partial<Machine>) => {
    const updated = await machinesService.update(id, data);
    setMachines(prev => prev.map(m => (m.id === id ? updated : m)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await machinesService.delete(id);
    setMachines(prev => prev.filter(m => m.id !== id));
  }, []);

  return { machines, isLoading, error, refetch, create, update, remove };
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
