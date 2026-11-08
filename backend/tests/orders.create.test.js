/**
 * POST /api/orders — les montants sont recalculés côté serveur, à partir des
 * prix en base et des paramètres du back-office, jamais repris du client.
 */
jest.mock('../config/database', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  transaction: jest.fn(),
}));
jest.mock('../services/email.service', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue(),
  sendOrderStatusUpdate: jest.fn().mockResolvedValue(),
}));
jest.mock('../services/adminNotifications.service', () => ({
  newOrder: jest.fn(),
  lowStockAfterOrder: jest.fn(),
}));
jest.mock('../services/settings.service', () => ({
  getShopConfig: jest.fn(),
}));

const db = require('../config/database');
const settings = require('../services/settings.service');
const controller = require('../controllers/orders.controller');
const fixtures = require('./fixtures/order-totals.cases.json');
const { mockReq, mockRes, mockNext } = require('./helpers/http');

const PRODUCT = { id: 45, name: 'Café de Colombie', price: '14500.00', stock: 10 };

/**
 * Base simulée : `state` décrit ce que renvoient les requêtes,
 * `calls` garde ce que le contrôleur a écrit.
 */
function setupDb({ product = PRODUCT, promo = null, promoAccepted = true, stockAvailable = true } = {}) {
  const calls = { orderInsert: null, stockUpdates: [], promoUpdates: 0 };

  db.queryOne.mockImplementation(async (sql) => {
    if (/FROM products WHERE id = \? AND is_active = 1/.test(sql)) return product;
    if (/FROM machines WHERE id = \? AND is_active = 1/.test(sql)) return null;
    if (/SELECT \* FROM orders WHERE id = \?/.test(sql)) return { id: 99, order_number: 'CMD-TEST', client_id: 7 };
    if (/FROM clients WHERE id = \?/.test(sql)) return { email: 'client@example.test', first_name: 'Awa' };
    throw new Error(`queryOne inattendu : ${sql}`);
  });
  db.query.mockResolvedValue([]);

  const conn = {
    execute: jest.fn(async (sql, params) => {
      if (/^UPDATE promo_codes/.test(sql)) {
        calls.promoUpdates += 1;
        return [{ affectedRows: promoAccepted ? 1 : 0 }];
      }
      if (/^SELECT \* FROM promo_codes/.test(sql)) return [[promo]];
      if (/^INSERT INTO orders/.test(sql)) {
        calls.orderInsert = params;
        return [{ insertId: 99 }];
      }
      if (/^INSERT INTO order_items/.test(sql)) return [{}];
      if (/SET stock = stock - \?/.test(sql)) {
        calls.stockUpdates.push(params);
        return [{ affectedRows: stockAvailable ? 1 : 0 }];
      }
      if (/^INSERT INTO order_tracking/.test(sql)) return [{}];
      throw new Error(`execute inattendu : ${sql}`);
    }),
  };
  db.transaction.mockImplementation(async (callback) => callback(conn));

  return calls;
}

/** Colonnes de l'INSERT INTO orders, dans l'ordre du contrôleur */
function insertedOrder(params) {
  const [, clientId, subtotal, tax, taxRate, shipping, mode, discount, total, method, promoCode] = params;
  return { clientId, subtotal, tax, taxRate, shipping, mode, discount, total, method, promoCode };
}

const clientUser = { id: 7, type: 'client' };

function orderBody(overrides = {}) {
  return {
    items: [{ id: 45, type: 'product', quantity: 2 }],
    shipping_address: { line1: 'Rue 10', city: 'Dakar' },
    payment_method: 'wave',
    delivery_mode: 'standard',
    ...overrides,
  };
}

beforeEach(() => {
  settings.getShopConfig.mockResolvedValue(structuredClone(fixtures.baseConfig));
});

describe('création de commande', () => {
  test('calcule les montants à partir du prix en base', async () => {
    const calls = setupDb();
    const res = mockRes();
    const next = mockNext();

    await controller.create(mockReq({ body: orderBody(), user: clientUser }), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(201);
    // 2 × 14 500 = 29 000 ; livraison 2 500 ; TVA 18 % = 5 220
    expect(insertedOrder(calls.orderInsert)).toMatchObject({
      clientId: 7, subtotal: 29000, discount: 0, shipping: 2500, tax: 5220, taxRate: 18, total: 36720, mode: 'standard',
    });
    expect(calls.stockUpdates).toEqual([[2, 45, 2]]);
  });

  test('ignore les prix, la TVA et les frais envoyés par le client', async () => {
    const calls = setupDb();
    const body = orderBody({
      items: [{ id: 45, type: 'product', quantity: 2, price: 1, unit_price: 1 }],
      subtotal: 2, tax_amount: 0, shipping_amount: 0, total_amount: 2, discount_amount: 99999,
    });

    await controller.create(mockReq({ body, user: clientUser }), mockRes(), mockNext());

    expect(insertedOrder(calls.orderInsert)).toMatchObject({ subtotal: 29000, tax: 5220, shipping: 2500, total: 36720, discount: 0 });
  });

  test('applique un code promo validé en base', async () => {
    const calls = setupDb({ promo: { code: 'BIENVENUE10', type: 'percentage', value: '10.00' } });

    await controller.create(mockReq({ body: orderBody({ promo_code: 'BIENVENUE10' }), user: clientUser }), mockRes(), mockNext());

    // remise 2 900 ; dû 26 100 ; TVA 4 698 ; total 26 100 + 2 500 + 4 698
    expect(insertedOrder(calls.orderInsert)).toMatchObject({ discount: 2900, tax: 4698, shipping: 2500, total: 33298, promoCode: 'BIENVENUE10' });
    expect(calls.promoUpdates).toBe(1);
  });

  test('refuse un code promo invalide au lieu de facturer sans remise', async () => {
    const calls = setupDb({ promoAccepted: false });
    const next = mockNext();

    await controller.create(mockReq({ body: orderBody({ promo_code: 'FAUX' }), user: clientUser }), mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400, message: 'Code promo invalide ou expiré' }));
    expect(calls.orderInsert).toBeNull();
  });

  test('refuse un mode de livraison désactivé', async () => {
    setupDb();
    const config = structuredClone(fixtures.baseConfig);
    config.delivery.express.enabled = false;
    settings.getShopConfig.mockResolvedValue(config);
    const res = mockRes();

    await controller.create(mockReq({ body: orderBody({ delivery_mode: 'express' }), user: clientUser }), res, mockNext());

    expect(res.statusCode).toBe(400);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  test('refuse une quantité supérieure au stock', async () => {
    setupDb({ product: { ...PRODUCT, stock: 1 } });
    const res = mockRes();

    await controller.create(mockReq({ body: orderBody(), user: clientUser }), res, mockNext());

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Stock insuffisant/);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  test('annule tout si le stock part entre la vérification et la validation', async () => {
    setupDb({ stockAvailable: false });
    const next = mockNext();

    await controller.create(mockReq({ body: orderBody(), user: clientUser }), mockRes(), next);

    // L'erreur levée dans la transaction provoque le rollback
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
  });

  test('refuse un article inconnu ou désactivé', async () => {
    setupDb({ product: null });
    const res = mockRes();

    await controller.create(mockReq({ body: orderBody(), user: clientUser }), res, mockNext());

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Article introuvable/);
  });

  test('refuse une commande vide', async () => {
    setupDb();
    const res = mockRes();

    await controller.create(mockReq({ body: orderBody({ items: [] }), user: clientUser }), res, mockNext());

    expect(res.statusCode).toBe(400);
  });
});
