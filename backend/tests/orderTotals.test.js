const { promoDiscount, deliveryFee, computeOrderTotals } = require('../lib/orderTotals');
const fixtures = require('./fixtures/order-totals.cases.json');

/** Config de base + surcharges du cas (fusion profonde sur `delivery`) */
function configFor(overrides = {}) {
  const base = fixtures.baseConfig;
  return {
    ...base,
    ...overrides,
    delivery: Object.fromEntries(
      Object.entries(base.delivery).map(([mode, opt]) => [mode, { ...opt, ...overrides.delivery?.[mode] }]),
    ),
  };
}

describe('computeOrderTotals — cas partagés avec le frontend', () => {
  test.each(fixtures.cases.map(c => [c.name, c]))('%s', (_name, c) => {
    const totals = computeOrderTotals(configFor(c.config), c.subtotal, c.promo, c.mode);
    expect(totals).toEqual({ subtotal: c.subtotal, ...c.expected });
  });
});

describe('promoDiscount', () => {
  test('accepte une valeur DECIMAL renvoyée en chaîne par mysql2', () => {
    expect(promoDiscount({ type: 'percentage', value: '10.00' }, 14500)).toBe(1450);
    expect(promoDiscount({ type: 'fixed', value: '2500.00' }, 14500)).toBe(2500);
  });

  test('sans code promo, aucune remise', () => {
    expect(promoDiscount(null, 14500)).toBe(0);
  });

  test('le montant dû ne devient jamais négatif', () => {
    expect(promoDiscount({ type: 'percentage', value: 150 }, 10000)).toBe(10000);
  });
});

describe('deliveryFee', () => {
  test('mode inconnu : null (la commande est refusée)', () => {
    expect(deliveryFee(configFor(), 'drone', 10000)).toBeNull();
  });

  test('seuil à 0 : pas de livraison offerte', () => {
    expect(deliveryFee(configFor({ freeShippingThreshold: 0 }), 'standard', 1e9)).toBe(2500);
  });

  test('montant exactement au seuil : livraison offerte', () => {
    expect(deliveryFee(configFor({ freeShippingThreshold: 50000 }), 'standard', 50000)).toBe(0);
  });
});
