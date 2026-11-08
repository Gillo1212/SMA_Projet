/**
 * Calcul des montants d'une commande
 * ──────────────────────────────────
 * Source de vérité du calcul, utilisée par orders.controller (création,
 * validation de code promo). Le frontend en a une copie exacte
 * (frontend/src/utils/orderTotals.ts) pour afficher le montant facturé ;
 * les deux sont testées sur les mêmes cas (tests/fixtures/order-totals.cases.json).
 *
 *   remise     = % du sous-total, ou montant fixe plafonné au sous-total (arrondi)
 *   dû         = sous-total − remise
 *   livraison  = tarif du mode ; standard offerte si dû ≥ seuil (seuil > 0)
 *   TVA        = arrondi(dû × taux)
 *   total      = dû + livraison + TVA
 */

/**
 * Remise d'un code promo sur un sous-total. Une remise fixe ne peut pas
 * dépasser le sous-total : le montant dû ne devient jamais négatif.
 * @param {{ type: 'percentage'|'fixed', value: number|string } | null} promo
 */
function promoDiscount(promo, subtotal) {
  if (!promo) return 0;
  const raw = promo.type === 'percentage'
    ? subtotal * (Number(promo.value) / 100)
    : Number(promo.value);
  return Math.round(Math.min(raw, subtotal));
}

/**
 * Frais de livraison d'un mode, pour un montant (remise déduite, hors TVA).
 * Renvoie null si le mode n'existe pas ou n'est pas proposé.
 * La gratuité au-delà du seuil ne concerne que la livraison standard.
 */
function deliveryFee(config, mode, amountAfterDiscount) {
  const option = config.delivery[mode];
  if (!option || !option.enabled) return null;
  if (mode === 'standard' && config.freeShippingThreshold > 0 && amountAfterDiscount >= config.freeShippingThreshold) {
    return 0;
  }
  return option.fee;
}

/**
 * @returns {{ subtotal, discount, amountDue, shipping: number|null, tax, total }}
 *          `shipping` vaut null si le mode n'est pas proposé.
 */
function computeOrderTotals(config, subtotal, promo, mode) {
  const discount = promoDiscount(promo, subtotal);
  const amountDue = subtotal - discount;
  const shipping = deliveryFee(config, mode, amountDue);
  const tax = Math.round(amountDue * config.taxRate / 100);
  return { subtotal, discount, amountDue, shipping, tax, total: amountDue + (shipping ?? 0) + tax };
}

module.exports = { promoDiscount, deliveryFee, computeOrderTotals };
