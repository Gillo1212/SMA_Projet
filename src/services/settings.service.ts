import { apiClient } from './apiClient';
import { USE_MOCK, ENDPOINTS } from '../config/api';
import type { PromoCode } from '../types/models';

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

/** Champs d'un code promo, côté formulaire (null = pas de limite) */
export interface PromoCodeInput {
  code: string;
  type: PromoCode['type'];
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
}

function normalizePromo(raw: Record<string, any>): PromoCode {
  return {
    id: Number(raw.id),
    code: raw.code,
    type: raw.type,
    value: Number(raw.value),
    minOrderAmount: raw.min_order_amount != null ? Number(raw.min_order_amount) : null,
    maxUses: raw.max_uses != null ? Number(raw.max_uses) : null,
    usesCount: Number(raw.uses_count ?? 0),
    isActive: Boolean(Number(raw.is_active)),
    expiresAt: raw.expires_at ?? null,
    createdAt: raw.created_at,
  };
}

function denormalizePromo(input: Partial<PromoCodeInput>) {
  const out: Record<string, unknown> = {};
  if (input.code !== undefined) out.code = input.code;
  if (input.type !== undefined) out.type = input.type;
  if (input.value !== undefined) out.value = input.value;
  if (input.minOrderAmount !== undefined) out.min_order_amount = input.minOrderAmount;
  if (input.maxUses !== undefined) out.max_uses = input.maxUses;
  if (input.expiresAt !== undefined) out.expires_at = input.expiresAt;
  if (input.isActive !== undefined) out.is_active = input.isActive;
  return out;
}

export const settingsService = {
  /**
   * Paramètres de la plateforme. Avec l'API branchée, une erreur remonte :
   * afficher des valeurs fictives laisserait croire qu'elles sont en vigueur.
   */
  async getSettings(): Promise<Record<string, string>> {
    if (USE_MOCK) {
      const { mockSettings } = await import('../mocks/settings');
      return mockSettings;
    }
    const data = await apiClient.get<{ settings: Record<string, string> }>(ENDPOINTS.SETTINGS.LIST);
    return data.settings ?? {};
  },

  /** Enregistre un lot de paramètres ; renvoie l'ensemble à jour */
  async updateSettings(updates: Record<string, string>): Promise<Record<string, string>> {
    const data = await apiClient.put<{ settings: Record<string, string> }>(ENDPOINTS.SETTINGS.UPDATE, updates);
    return data.settings ?? updates;
  },

  // ── Codes promo ──────────────────────────────────────────────────────────

  async getPromoCodes(): Promise<PromoCode[]> {
    const rows = await apiClient.get<Record<string, any>[]>(ENDPOINTS.PROMO_CODES.LIST);
    return rows.map(normalizePromo);
  },

  async createPromoCode(input: PromoCodeInput): Promise<PromoCode> {
    const raw = await apiClient.post<Record<string, any>>(ENDPOINTS.PROMO_CODES.CREATE, denormalizePromo(input));
    return normalizePromo(raw);
  },

  async updatePromoCode(id: number, input: Partial<PromoCodeInput>): Promise<PromoCode> {
    const raw = await apiClient.patch<Record<string, any>>(ENDPOINTS.PROMO_CODES.UPDATE(id), denormalizePromo(input));
    return normalizePromo(raw);
  },

  /** Un code déjà utilisé est désactivé par le backend au lieu d'être supprimé */
  async deletePromoCode(id: number): Promise<{ deactivated: boolean }> {
    const res = await apiClient.delete<{ deactivated?: boolean }>(ENDPOINTS.PROMO_CODES.DELETE(id));
    return { deactivated: Boolean(res?.deactivated) };
  },

  // ── Email (SMTP) ─────────────────────────────────────────────────────────

  /**
   * Connexion au serveur SMTP enregistré puis envoi d'un email de test.
   * Ne lève pas d'erreur sur un échec SMTP : le message du serveur est renvoyé
   * pour être affiché tel quel (ex. identifiants refusés).
   */
  async testSmtp(to?: string): Promise<SmtpTestResult> {
    try {
      const res = await apiClient.post<SmtpTestResult>(ENDPOINTS.SETTINGS.SMTP_TEST, to ? { to } : {});
      return res;
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Test impossible' };
    }
  },

  // ── Comptes du back-office ───────────────────────────────────────────────

  async getAdmins(): Promise<AdminUser[]> {
    if (USE_MOCK) {
      const { mockAdmins } = await import('../mocks/settings');
      return mockAdmins as AdminUser[];
    }
    const data = await apiClient.get<{ admins: AdminUser[] }>(ENDPOINTS.SETTINGS.ADMINS);
    return data.admins ?? [];
  },

  async createAdmin(payload: CreateAdminData): Promise<AdminUser> {
    const data = await apiClient.post<{ admin: AdminUser }>(ENDPOINTS.SETTINGS.ADMINS, payload);
    return data.admin;
  },

  async updateAdmin(id: number, payload: { first_name?: string; last_name?: string; role?: string }): Promise<AdminUser> {
    const data = await apiClient.put<{ admin: AdminUser }>(`${ENDPOINTS.SETTINGS.ADMINS}/${id}`, payload);
    return data.admin;
  },

  async toggleAdmin(id: number): Promise<{ is_active: number }> {
    return apiClient.patch<{ is_active: number }>(`${ENDPOINTS.SETTINGS.ADMINS}/${id}/toggle`);
  },

  /** Un auteur d'articles est désactivé par le backend au lieu d'être supprimé */
  async deleteAdmin(id: number): Promise<{ deactivated: boolean }> {
    const res = await apiClient.delete<{ deactivated?: boolean }>(`${ENDPOINTS.SETTINGS.ADMINS}/${id}`);
    return { deactivated: Boolean(res?.deactivated) };
  },
};

export interface SmtpTestResult {
  success: boolean;
  message: string;
  /** Étape en échec : configuration absente, connexion, ou envoi */
  step?: 'config' | 'connect' | 'send';
  /** D'où vient la configuration testée */
  source?: 'database' | 'env';
}
