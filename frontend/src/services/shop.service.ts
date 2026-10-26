/**
 * Service boutique
 * ─────────────────
 * Règles de calcul (TVA, livraison) et validation des codes promo.
 *   GET  /settings/public
 *   POST /orders/validate-promo
 */
import { apiClient } from './apiClient';
import { USE_MOCK, ENDPOINTS } from '../config/api';
import { DEFAULT_SHOP_CONFIG } from '../utils/orderTotals';
import type { AppliedPromo, ShopConfig } from '../types/models';

// Une seule requête par chargement de page : panier, checkout et fiche
// produit lisent la même config.
let configRequest: Promise<ShopConfig> | null = null;

export const shopService = {
  getConfig(): Promise<ShopConfig> {
    if (USE_MOCK) return Promise.resolve(DEFAULT_SHOP_CONFIG);
    configRequest ??= apiClient
      .get<ShopConfig>(ENDPOINTS.SETTINGS.PUBLIC)
      .catch(err => {
        configRequest = null; // nouvel essai au prochain appel
        throw err;
      });
    return configRequest;
  },

  /** À appeler après une modification des paramètres dans le back-office */
  invalidateConfig(): void {
    configRequest = null;
  },

  /**
   * Vérifie un code promo auprès du backend.
   * Lève une ApiError (message du serveur) si le code est refusé.
   */
  async validatePromo(code: string, subtotal: number): Promise<AppliedPromo> {
    const res = await apiClient.post<{ code: string; type: AppliedPromo['type']; value: number }>(
      ENDPOINTS.ORDERS.VALIDATE_PROMO,
      { code: code.trim().toUpperCase(), subtotal },
    );
    return { code: res.code, type: res.type, value: Number(res.value) };
  },
};
