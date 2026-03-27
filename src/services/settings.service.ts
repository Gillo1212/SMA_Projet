import { apiClient } from './apiClient';

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'commercial';
  is_active: number;
  last_login: string | null;
  created_at: string;
}

export interface CreateAdminData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export const settingsService = {
  async getSettings(): Promise<Record<string, string>> {
    try {
      const data = await apiClient.get<{ success: boolean; settings: Record<string, string> }>('/settings');
      return (data as { success: boolean; settings: Record<string, string> }).settings || {};
    } catch {
      const { mockSettings } = await import('../mocks/settings');
      return mockSettings;
    }
  },

  async updateSettings(updates: Record<string, string>): Promise<void> {
    await apiClient.put('/settings', updates);
  },

  async getAdmins(): Promise<AdminUser[]> {
    try {
      const data = await apiClient.get<{ success: boolean; admins: AdminUser[] }>('/settings/admins');
      return (data as { success: boolean; admins: AdminUser[] }).admins || [];
    } catch {
      const { mockAdmins } = await import('../mocks/settings');
      return mockAdmins as AdminUser[];
    }
  },

  async createAdmin(payload: CreateAdminData): Promise<void> {
    await apiClient.post('/settings/admins', payload);
  },

  async updateAdmin(id: number, payload: { first_name: string; last_name: string; role: string }): Promise<void> {
    await apiClient.put(`/settings/admins/${id}`, payload);
  },

  async toggleAdmin(id: number): Promise<{ is_active: number }> {
    const data = await apiClient.patch<{ success: boolean; is_active: number }>(`/settings/admins/${id}/toggle`);
    return data as { is_active: number };
  },

  async deleteAdmin(id: number): Promise<void> {
    await apiClient.delete(`/settings/admins/${id}`);
  },
};
