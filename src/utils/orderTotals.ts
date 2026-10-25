/**
 * Calcul des montants d'une commande
 * ──────────────────────────────────
 * Réplique exacte du calcul de `backend/controllers/orders.controller.js`
 * (create) : le panier et le checkout affichent ainsi le montant qui sera
 * réellement facturé. Le backend reste la référence — il recalcule tout.
 *
 *   remise     = % du sous-total, ou montant fixe plafonné au sous-total (arrondi)
 *   dû         = sous-total − remise
 *   livraison  = tarif du mode ; standard offerte si dû ≥ seuil (seuil > 0)
 *   TVA        = arrondi(dû × taux)
 *   total      = dû + livraison + TVA
 */
import type { AppliedPromo, DeliveryMode, ShopConfig } from '../types/models';

/** Valeurs par défaut du backend, utilisées tant que la config n'est pas chargée */
export const DEFAULT_SHOP_CONFIG: ShopConfig = {
  taxRate: 18,
  currency: 'XOF',
  delivery: {
    pickup:   { enabled: true, fee: 0 },
    standard: { enabled: true, fee: 2500 },
    express:  { enabled: true, fee: 5000 },
  },
  freeShippingThreshold: 0,
};

export const DELIVERY_MODES: DeliveryMode[] = ['pickup', 'standard', 'express'];

export function promoDiscount(promo: AppliedPromo | null, subtotal: number): number {
  if (!promo) return 0;
  const raw = promo.type === 'percentage' ? subtotal * (promo.value / 100) : promo.value;
  return Math.round(Math.min(raw, subtotal));
}

/** null si le mode n'est pas proposé */
export function deliveryFee(config: ShopConfig, mode: DeliveryMode, amountDue: number): number | null {
  const option = config.delivery[mode];
  if (!option?.enabled) return null;
  if (mode === 'standard' && config.freeShippingThreshold > 0 && amountDue >= config.freeShippingThreshold) {
    return 0;
  }
  return option.fee;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  amountDue: number;
  /** null si le mode choisi n'est pas proposé */
  shipping: number | null;
  tax: number;
  total: number;
}

export function computeTotals(
  config: ShopConfig,
  subtotal: number,
  promo: AppliedPromo | null,
  mode: DeliveryMode,
): OrderTotals {
  const discount = promoDiscount(promo, subtotal);
  const amountDue = subtotal - discount;
  const shipping = deliveryFee(config, mode, amountDue);
  const tax = Math.round(amountDue * config.taxRate / 100);
  return { subtotal, discount, amountDue, shipping, tax, total: amountDue + (shipping ?? 0) + tax };
}

/** Premier mode proposé, en privilégiant la livraison standard */
export function defaultDeliveryMode(config: ShopConfig): DeliveryMode {
  if (config.delivery.standard.enabled) return 'standard';
  return DELIVERY_MODES.find(m => config.delivery[m].enabled) ?? 'standard';
}
