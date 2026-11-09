/** /api/orders et /api/payments — base de test réelle */
const { api, ids, resetDatabase, closeDatabase, auth, query, lastEmail } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

const orderBody = (overrides = {}) => ({
  items: [{ id: ids.product, type: 'product', quantity: 2 }],
  shipping_address: { line1: 'Rue 10', city: 'Dakar' },
  payment_method: 'wave',
  delivery_mode: 'standard',
  ...overrides,
});

const stockOf = async (id) => (await query('SELECT stock FROM products WHERE id = ?', [id]))[0].stock;
const wait = (ms = 100) => new Promise(r => setTimeout(r, ms));

describe('POST /api/orders', () => {
  test('commande créée : montants recalculés, stock décrémenté, suivi, email', async () => {
    const before = await stockOf(ids.product);
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({
      items: [{ id: ids.product, type: 'product', quantity: 2, price: 1 }], total_amount: 1, tax_amount: 0,
    }));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      client_id: ids.client, subtotal: '29000.00', shipping_amount: '2500.00', tax_amount: '5220.00',
      total_amount: '36720.00', tax_rate: '18.00', delivery_mode: 'standard', status: 'pending', payment_status: 'pending',
    });
    expect(await stockOf(ids.product)).toBe(before - 2);

    const orderId = res.body.data.id;
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ item_name: 'Café de Colombie', quantity: 2, unit_price: '14500.00' });
    expect(await query('SELECT status FROM order_tracking WHERE order_id = ?', [orderId])).toEqual([{ status: 'pending' }]);
    await wait();
    expect(lastEmail().to).toBe('client@entreprise.test');
  });

  test('code promo : remise appliquée et utilisation comptée', async () => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({ promo_code: 'BIENVENUE10' }));
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ discount_amount: '2900.00', tax_amount: '4698.00', total_amount: '33298.00', promo_code: 'BIENVENUE10' });
    const [promo] = await query('SELECT uses_count FROM promo_codes WHERE code = ?', ['BIENVENUE10']);
    expect(promo.uses_count).toBe(1);
  });

  test.each([
    ['expiré', 'EXPIRE'],
    ['épuisé', 'EPUISE'],
    ['inconnu', 'FAUX'],
  ])('code promo %s : 400 et rien n’est créé', async (_label, code) => {
    const before = await stockOf(ids.product);
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({ promo_code: code }));
    expect(res.status).toBe(400);
    expect(await stockOf(ids.product)).toBe(before);
  });

  test('minimum de commande du code non atteint : 400', async () => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({
      items: [{ id: ids.product, type: 'product', quantity: 1 }], promo_code: 'MOINS5000',
    }));
    expect(res.status).toBe(400);
  });

  test('stock insuffisant : 400, stock inchangé', async () => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({
      items: [{ id: ids.lowStockProduct, type: 'product', quantity: 10 }],
    }));
    expect(res.status).toBe(400);
    expect(await stockOf(ids.lowStockProduct)).toBe(3);
  });

  test('plusieurs articles : un seul en rupture annule toute la commande', async () => {
    const before = await stockOf(ids.product);
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({
      items: [{ id: ids.product, type: 'product', quantity: 1 }, { id: ids.lowStockProduct, type: 'product', quantity: 4 }],
    }));
    expect(res.status).toBe(400);
    expect(await stockOf(ids.product)).toBe(before);
  });

  test('article retiré du catalogue : 400', async () => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({ items: [{ id: ids.inactiveProduct, type: 'product', quantity: 1 }] }));
    expect(res.status).toBe(400);
  });

  test('machine « sur devis » (prix 0) : pas de commande directe, stock inchangé', async () => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({
      items: [{ id: ids.machine, type: 'machine', quantity: 1 }], delivery_mode: 'pickup',
    }));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/sur devis/);
    const [machine] = await query('SELECT stock FROM machines WHERE id = ?', [ids.machine]);
    expect(machine.stock).toBe(5);
  });

  test('mode de livraison désactivé dans les paramètres : 400', async () => {
    await api.put('/api/settings').set(auth('admin')).send({ delivery_express_enabled: '0' });
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({ delivery_mode: 'express' }));
    expect(res.status).toBe(400);
    await api.put('/api/settings').set(auth('admin')).send({ delivery_express_enabled: '1' });
  });

  test('validation : commande vide, quantité 0, paiement inconnu, sans adresse → 400', async () => {
    for (const body of [
      orderBody({ items: [] }),
      orderBody({ items: [{ id: ids.product, type: 'product', quantity: 0 }] }),
      orderBody({ payment_method: 'bitcoin' }),
      orderBody({ shipping_address: undefined }),
    ]) {
      expect((await api.post('/api/orders').set(auth('client')).send(body)).status).toBe(400);
    }
  });

  test('sans compte : 401', async () => {
    expect((await api.post('/api/orders').send(orderBody())).status).toBe(401);
  });
});

describe('GET /api/orders', () => {
  test('un client ne voit que ses commandes', async () => {
    const res = await api.get('/api/orders').set(auth('client'));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every(o => o.client_id === ids.client)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('items_summary');
  });

  test('l’admin voit tout, filtre par statut et recherche', async () => {
    const all = await api.get('/api/orders').set(auth('admin'));
    expect(new Set(all.body.data.map(o => o.client_id))).toEqual(new Set([ids.client, ids.otherClient]));
    const shipped = await api.get('/api/orders?status=shipped').set(auth('admin'));
    expect(shipped.body.data.map(o => o.id)).toEqual([ids.shippedOrder]);
    const search = await api.get('/api/orders?search=CMD-TEST-00002').set(auth('admin'));
    expect(search.body.data.map(o => o.id)).toEqual([ids.otherClientOrder]);
  });

  test('détail : articles et suivi ; commande d’un autre client : 403 ; inconnue : 404', async () => {
    const own = await api.get(`/api/orders/${ids.order}`).set(auth('client'));
    expect(own.status).toBe(200);
    expect(own.body.data.items).toHaveLength(1);
    expect(own.body.data.tracking.length).toBeGreaterThan(0);
    expect((await api.get(`/api/orders/${ids.otherClientOrder}`).set(auth('client'))).status).toBe(403);
    expect((await api.get('/api/orders/9999').set(auth('admin'))).status).toBe(404);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  test('admin : statut changé, suivi ajouté, email au client', async () => {
    const res = await api.patch(`/api/orders/${ids.order}/status`).set(auth('admin')).send({ status: 'confirmed', note: 'Paiement reçu' });
    expect(res.status).toBe(200);
    const [order] = await query('SELECT status FROM orders WHERE id = ?', [ids.order]);
    expect(order.status).toBe('confirmed');
    await wait();
    expect(lastEmail().to).toBe('client@entreprise.test');
  });

  test('annulation : date et motif enregistrés', async () => {
    await api.patch(`/api/orders/${ids.otherClientOrder}/status`).set(auth('admin')).send({ status: 'cancelled', note: 'Rupture fournisseur' });
    const [order] = await query('SELECT status, cancelled_at, cancellation_reason FROM orders WHERE id = ?', [ids.otherClientOrder]);
    expect(order).toMatchObject({ status: 'cancelled', cancellation_reason: 'Rupture fournisseur' });
    expect(order.cancelled_at).not.toBeNull();
  });

  test('client : 403 ; statut invalide : 400 ; commande inconnue : 404', async () => {
    expect((await api.patch(`/api/orders/${ids.order}/status`).set(auth('client')).send({ status: 'delivered' })).status).toBe(403);
    expect((await api.patch(`/api/orders/${ids.order}/status`).set(auth('admin')).send({ status: 'perdu' })).status).toBe(400);
    expect((await api.patch('/api/orders/9999/status').set(auth('admin')).send({ status: 'confirmed' })).status).toBe(404);
  });
});

describe('POST /api/orders/:id/confirm-delivery', () => {
  test('commande d’un autre client : 404 ; non expédiée : 409', async () => {
    expect((await api.post(`/api/orders/${ids.shippedOrder}/confirm-delivery`).set(auth('otherClient'))).status).toBe(404);
    expect((await api.post(`/api/orders/${ids.order}/confirm-delivery`).set(auth('client'))).status).toBe(409);
  });

  test('commande expédiée : livrée, puis 409 si on recommence', async () => {
    const res = await api.post(`/api/orders/${ids.shippedOrder}/confirm-delivery`).set(auth('client'));
    expect(res.status).toBe(200);
    const [order] = await query('SELECT status, delivered_at FROM orders WHERE id = ?', [ids.shippedOrder]);
    expect(order.status).toBe('delivered');
    expect(order.delivered_at).not.toBeNull();
    expect((await api.post(`/api/orders/${ids.shippedOrder}/confirm-delivery`).set(auth('client'))).status).toBe(409);
  });

  test('un admin ne confirme pas à la place du client : 403', async () => {
    expect((await api.post(`/api/orders/${ids.order}/confirm-delivery`).set(auth('admin'))).status).toBe(403);
  });
});

describe('POST /api/orders/validate-promo', () => {
  test('code valide : remise calculée', async () => {
    const res = await api.post('/api/orders/validate-promo').send({ code: 'BIENVENUE10', subtotal: 14500 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ discount: 1450, type: 'percentage', value: 10, code: 'BIENVENUE10' });
  });

  test('remise fixe et minimum de commande', async () => {
    expect((await api.post('/api/orders/validate-promo').send({ code: 'MOINS5000', subtotal: 10000 })).status).toBe(400);
    expect((await api.post('/api/orders/validate-promo').send({ code: 'MOINS5000', subtotal: 30000 })).body.discount).toBe(5000);
  });

  test('code expiré ou inconnu : 404', async () => {
    expect((await api.post('/api/orders/validate-promo').send({ code: 'EXPIRE', subtotal: 14500 })).status).toBe(404);
    expect((await api.post('/api/orders/validate-promo').send({ code: 'FAUX', subtotal: 14500 })).status).toBe(404);
  });
});

describe('paiement en ligne (simulateur)', () => {
  let orderId;
  let reference;

  beforeAll(async () => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({ items: [{ id: ids.product, type: 'product', quantity: 1 }] }));
    orderId = res.body.data.id;
  });

  test('POST /api/payments/initiate : transaction créée, URL de paiement simulée', async () => {
    const res = await api.post('/api/payments/initiate').set(auth('client')).send({ order_id: orderId });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ provider: 'wave', simulated: true });
    expect(res.body.data.checkout_url).toMatch(/^http:\/\/frontend\.test\/paiement\/simulation\?/);
    reference = res.body.data.reference;
    const [tx] = await query('SELECT status, amount FROM payment_transactions WHERE reference = ?', [reference]);
    expect(tx).toMatchObject({ status: 'processing', amount: '19610.00' });
  });

  test('un client ne peut pas payer la commande d’un autre : 403', async () => {
    expect((await api.post('/api/payments/initiate').set(auth('otherClient')).send({ order_id: orderId })).status).toBe(403);
  });

  test('paiement hors ligne (espèces) : 400', async () => {
    const cash = await api.post('/api/orders').set(auth('client')).send(orderBody({ payment_method: 'cash', items: [{ id: ids.product, type: 'product', quantity: 1 }] }));
    expect((await api.post('/api/payments/initiate').set(auth('client')).send({ order_id: cash.body.data.id })).status).toBe(400);
  });

  test.each(['card', 'orange_money'])('mode « %s » : pas proposé à la commande (400)', async (method) => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({ payment_method: method }));
    expect(res.status).toBe(400);
  });

  test.each(['card', 'orange_money'])('ancienne commande « %s » en attente : réglée par Wave', async (method) => {
    const created = await api.post('/api/orders').set(auth('client')).send(orderBody({ items: [{ id: ids.product, type: 'product', quantity: 1 }] }));
    const legacyId = created.body.data.id;
    await query('UPDATE orders SET payment_method = ? WHERE id = ?', [method, legacyId]);
    const res = await api.post('/api/payments/initiate').set(auth('client')).send({ order_id: legacyId });
    expect(res.status).toBe(200);
    expect(res.body.data.provider).toBe('wave');
    const [order] = await query('SELECT payment_method FROM orders WHERE id = ?', [legacyId]);
    expect(order.payment_method).toBe('wave');
  });

  test('GET /api/payments/status/:reference : en cours ; autre client : 403 ; inconnue : 404', async () => {
    const res = await api.get(`/api/payments/status/${reference}`).set(auth('client'));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'processing', order_id: orderId, payment_status: 'pending' });
    expect(res.body.data.client_id).toBeUndefined();
    expect((await api.get(`/api/payments/status/${reference}`).set(auth('otherClient'))).status).toBe(403);
    expect((await api.get('/api/payments/status/inconnue').set(auth('client'))).status).toBe(404);
  });

  test('statut sans connexion (retour de Wave sur un autre appareil) : statut seulement, rien du compte', async () => {
    const res = await api.get(`/api/payments/status/${reference}`);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data).sort()).toEqual(['amount', 'currency', 'order_number', 'order_status', 'payment_status', 'reference', 'status']);
    expect(res.body.data).toMatchObject({ status: 'processing', payment_status: 'pending' });
    expect((await api.get('/api/payments/status/inconnue')).status).toBe(404);
  });

  test('POST /api/payments/simulate (succès) : commande payée et confirmée, une seule fois', async () => {
    const res = await api.post('/api/payments/simulate').send({ reference, status: 'succeeded' });
    expect(res.body).toMatchObject({ applied: true });
    const [order] = await query('SELECT payment_status, status, payment_reference FROM orders WHERE id = ?', [orderId]);
    expect(order).toMatchObject({ payment_status: 'paid', status: 'confirmed', payment_reference: reference });
    const again = await api.post('/api/payments/simulate').send({ reference, status: 'succeeded' });
    expect(again.body).toMatchObject({ applied: false });
    const tracking = await query("SELECT COUNT(*) AS n FROM order_tracking WHERE order_id = ? AND note = 'Paiement confirmé'", [orderId]);
    expect(tracking[0].n).toBe(1);
  });

  test('commande déjà payée : nouvelle tentative refusée (409)', async () => {
    expect((await api.post('/api/payments/initiate').set(auth('client')).send({ order_id: orderId })).status).toBe(409);
  });

  test('webhook d’un autre prestataire avec la référence : ignoré', async () => {
    const res = await api.post('/api/payments/webhook/orange_money').send({ reference, status: 'succeeded', amount: 19610 });
    expect(res.body).toMatchObject({ applied: false });
  });

  test('webhook prestataire inconnu : 404', async () => {
    expect((await api.post('/api/payments/webhook/paypal').send({})).status).toBe(404);
  });

  test('GET /api/payments/config : admin seulement', async () => {
    const res = await api.get('/api/payments/config').set(auth('admin'));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ wave: false, orange_money: false, enabled_methods: ['wave'], simulation_active: true });
    expect((await api.get('/api/payments/config').set(auth('client'))).status).toBe(403);
  });
});

describe('relance d’un paiement (échoué, abandonné, expiré)', () => {
  let orderId;
  let first;
  let second;

  beforeAll(async () => {
    const res = await api.post('/api/orders').set(auth('client')).send(orderBody({ items: [{ id: ids.product, type: 'product', quantity: 1 }] }));
    orderId = res.body.data.id;
  });

  test('nouvelle tentative : la précédente est annulée, une seule reste ouverte', async () => {
    first = (await api.post('/api/payments/initiate').set(auth('client')).send({ order_id: orderId })).body.data.reference;
    second = (await api.post('/api/payments/initiate').set(auth('client')).send({ order_id: orderId })).body.data.reference;
    expect(second).not.toBe(first);
    const rows = await query('SELECT reference, status, failure_reason FROM payment_transactions WHERE order_id = ? ORDER BY id', [orderId]);
    expect(rows).toEqual([
      { reference: first, status: 'cancelled', failure_reason: 'Remplacée par une nouvelle tentative de paiement' },
      { reference: second, status: 'processing', failure_reason: null },
    ]);
  });

  test('la nouvelle tentative est payée : commande confirmée', async () => {
    await api.post('/api/payments/simulate').send({ reference: second, status: 'succeeded' });
    const [order] = await query('SELECT payment_status, status, payment_reference FROM orders WHERE id = ?', [orderId]);
    expect(order).toMatchObject({ payment_status: 'paid', status: 'confirmed', payment_reference: second });
  });

  test('l’ancienne session payée quand même : encaissement signalé à rembourser, commande inchangée', async () => {
    const res = await api.post('/api/payments/simulate').send({ reference: first, status: 'succeeded' });
    expect(res.body).toMatchObject({ applied: false, reason: expect.stringMatching(/déjà payée/) });
    const [tx] = await query('SELECT status, failure_reason FROM payment_transactions WHERE reference = ?', [first]);
    expect(tx.status).toBe('succeeded');
    expect(tx.failure_reason).toMatch(/rembourser/);
    const [order] = await query('SELECT payment_reference FROM orders WHERE id = ?', [orderId]);
    expect(order.payment_reference).toBe(second);
    const tracking = await query("SELECT COUNT(*) AS n FROM order_tracking WHERE order_id = ? AND note = 'Paiement confirmé'", [orderId]);
    expect(tracking[0].n).toBe(1);
  });

  test('commande payée : plus de nouvelle tentative (409)', async () => {
    expect((await api.post('/api/payments/initiate').set(auth('client')).send({ order_id: orderId })).status).toBe(409);
  });
});
