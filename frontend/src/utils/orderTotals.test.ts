/**
 * Le panier et le checkout doivent afficher exactement le montant que le
 * backend facturera : mêmes cas que backend/tests/orderTotals.test.js.
 */
import { describe, expect, test } from 'vitest';
import { computeTotals, defaultDeliveryMode, DEFAULT_SHOP_CONFIG } from './orderTotals';
import type { AppliedPromo, DeliveryMode, ShopConfig } from '../types/models';
import fixtures from '../../../backend/tests/fixtures/order-totals.cases.json';

interface Case {
  name: string;
  subtotal: number;
  promo: AppliedPromo | null;
  mode: DeliveryMode;
  config?: Partial<Omit<ShopConfig, 'delivery'>> & { delivery?: Partial<Record<DeliveryMode, { enabled: boolean; fee: number }>> };
  expected: { discount: number; amountDue: number; shipping: number | null; tax: number; total: number };
}

function configFor(overrides: Case['config'] = {}): ShopConfig {
  const base = fixtures.baseConfig;
  const delivery = Object.fromEntries(
    Object.entries(base.delivery).map(([mode, opt]) => [mode, { ...opt, ...overrides.delivery?.[mode as DeliveryMode] }]),
  ) as ShopConfig['delivery'];
  return { ...DEFAULT_SHOP_CONFIG, ...base, ...overrides, delivery };
}

describe('computeTotals — cas partagés avec le backend', () => {
  test.each((fixtures.cases as Case[]).map(c => [c.name, c] as const))('%s', (_name, c) => {
    expect(computeTotals(configFor(c.config), c.subtotal, c.promo, c.mode)).toEqual({ subtotal: c.subtotal, ...c.expected });
  });
});

describe('defaultDeliveryMode', () => {
  test('privilégie la livraison standard', () => {
    expect(defaultDeliveryMode(configFor())).toBe('standard');
  });

  test('sinon le premier mode proposé', () => {
    const config = configFor({ delivery: { standard: { enabled: false, fee: 2500 } } });
    expect(defaultDeliveryMode(config)).toBe('pickup');
  });
});
