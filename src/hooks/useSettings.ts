import { useState, useEffect, useCallback } from 'react';
import { settingsService, AdminUser, CreateAdminData } from '../services/settings.service';

interface UseSettingsReturn {
  settings: Record<string, string>;
  admins: AdminUser[];
  isLoading: boolean;
  error: string | null;
  updateSettings: (data: Record<string, string>) => Promise<void>;
  createAdmin: (data: CreateAdminData) => Promise<void>;
  toggleAdmin: (id: number) => Promise<void>;
  deleteAdmin: (id: number) => Promise<void>;
  refetch: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([settingsService.getSettings(), settingsService.getAdmins()])
      .then(([s, a]) => {
        if (!cancelled) {
          setSettings(s);
          setAdmins(a);
        }
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur de chargement');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const updateSettings = useCallback(async (data: Record<string, string>) => {
    const updated = await settingsService.updateSettings(data);
    setSettings(prev => ({ ...prev, ...updated }));
  }, []);

  const createAdmin = useCallback(async (data: CreateAdminData) => {
    await settingsService.createAdmin(data);
    setTick(t => t + 1);
  }, []);

  const toggleAdmin = useCallback(async (id: number) => {
    const result = await settingsService.toggleAdmin(id);
    setAdmins(prev =>
      prev.map(a => a.id === id ? { ...a, is_active: result.is_active } : a)
    );
  }, []);

  const deleteAdmin = useCallback(async (id: number) => {
    await settingsService.deleteAdmin(id);
    setAdmins(prev => prev.filter(a => a.id !== id));
  }, []);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { settings, admins, isLoading, error, updateSettings, createAdmin, toggleAdmin, deleteAdmin, refetch };
}
