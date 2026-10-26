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
  updateAdmin: (id: number, data: { first_name?: string; last_name?: string; role?: string }) => Promise<void>;
  deleteAdmin: (id: number) => Promise<boolean>;
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

  // Mises à jour locales : un rechargement complet réafficherait l'écran de
  // chargement et ramènerait la page sur son premier onglet.
  const createAdmin = useCallback(async (data: CreateAdminData) => {
    const admin = await settingsService.createAdmin(data);
    setAdmins(prev => [...prev, admin]);
  }, []);

  const updateAdmin = useCallback(async (id: number, data: { first_name?: string; last_name?: string; role?: string }) => {
    const admin = await settingsService.updateAdmin(id, data);
    setAdmins(prev => prev.map(a => (a.id === id ? admin : a)));
  }, []);

  const toggleAdmin = useCallback(async (id: number) => {
    const result = await settingsService.toggleAdmin(id);
    setAdmins(prev =>
      prev.map(a => a.id === id ? { ...a, is_active: result.is_active } : a)
    );
  }, []);

  /** Renvoie true si le compte a été désactivé au lieu d'être supprimé */
  const deleteAdmin = useCallback(async (id: number) => {
    const { deactivated } = await settingsService.deleteAdmin(id);
    setAdmins(prev =>
      deactivated ? prev.map(a => (a.id === id ? { ...a, is_active: 0 } : a)) : prev.filter(a => a.id !== id)
    );
    return deactivated;
  }, []);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  return { settings, admins, isLoading, error, updateSettings, createAdmin, updateAdmin, toggleAdmin, deleteAdmin, refetch };
}
