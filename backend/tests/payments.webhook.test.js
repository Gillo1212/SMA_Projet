/**
 * Webhooks de paiement : signature, idempotence, contrôle du montant et du
 * prestataire. Une erreur ici = une commande marquée payée sans l'être.
 */
const crypto = require('crypto');

jest.mock('../config/database', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
  transaction: jest.fn(),
}));
jest.mock('../services/email.service', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue(),
}));

const db = require('../config/database');
const { sendOrderConfirmation } = require('../services/email.service');
const controller = require('../controllers/payments.controller');
const { mockReq, mockRes, mockNext } = require('./helpers/http');

const WAVE_SECRET = 'wave_test_secret';
const ENV_KEYS = ['NODE_ENV', 'WAVE_API_KEY', 'WAVE_WEBHOOK_SECRET', 'ORANGE_MONEY_CLIENT_ID', 'ORANGE_MONEY_CLIENT_SECRET', 'ORANGE_MONEY_MERCHANT_KEY'];
const savedEnv = {};

beforeAll(() => { for (const k of ENV_KEYS) savedEnv[k] = process.env[k]; });
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k];
  }
});

function configureWave() {
  process.env.WAVE_API_KEY = 'wave_test_key';
  process.env.WAVE_WEBHOOK_SECRET = WAVE_SECRET;
}
function unconfigureOrange() {
  delete process.env.ORANGE_MONEY_CLIENT_ID;
  delete process.env.ORANGE_MONEY_CLIENT_SECRET;
  delete process.env.ORANGE_MONEY_MERCHANT_KEY;
}

/** En-tête Wave-Signature : t=<timestamp>,v1=HMAC_SHA256(secret, timestamp + corps brut) */
function waveSignature(rawBody, secret = WAVE_SECRET, timestamp = '1794000000') {
  const v1 = crypto.createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('hex');
  return `t=${timestamp},v1=${v1}`;
}

function waveEvent({ reference = 'CMD-2026-00001-abcd1234', amount = 36720, type = 'checkout.session.completed' } = {}) {
  return { type, data: { id: 'cos_123', client_reference: reference, amount: String(amount) } };
}

/** Transaction en base + suivi des écritures */
function setupDb(tx) {
  const writes = { orderPaid: 0, txUpdates: [] };
  db.queryOne.mockImplementation(async (sql) => {
    if (/FROM payment_transactions WHERE reference = \?/.test(sql)) return tx;
    if (/SELECT \* FROM orders WHERE id = \?/.test(sql)) return { id: tx?.order_id, client_id: 7 };
    if (/FROM clients WHERE id = \?/.test(sql)) return { email: 'client@example.test', first_name: 'Awa' };
    throw new Error(`queryOne inattendu : ${sql}`);
  });
  db.query.mockImplementation(async (sql, params) => {
    if (/^UPDATE payment_transactions/.test(sql.trim())) writes.txUpdates.push({ sql, params });
    return [];
  });
  db.transaction.mockImplementation(async (callback) => callback({
    execute: jest.fn(async (sql) => {
      if (/UPDATE orders/.test(sql)) writes.orderPaid += 1;
      if (/SET status = 'succeeded'/.test(sql) && tx) tx.status = 'succeeded';
      return [{}];
    }),
  }));
  return writes;
}

const pendingWaveTx = () => ({ id: 1, order_id: 99, provider: 'wave', status: 'processing', amount: '36720.00', raw_payload: {} });

async function postWaveWebhook(event, { signature } = {}) {
  const rawBody = JSON.stringify(event);
  const req = mockReq({
    params: { provider: 'wave' },
    body: event,
    rawBody: Buffer.from(rawBody),
    headers: { 'Wave-Signature': signature ?? waveSignature(rawBody) },
  });
  const res = mockRes();
  const next = mockNext();
  await controller.webhook(req, res, next);
  return { res, next };
}

describe('webhook Wave', () => {
  beforeEach(configureWave);

  test('signature valide : la commande passe en payée et le client reçoit un email', async () => {
    const writes = setupDb(pendingWaveTx());

    const { res } = await postWaveWebhook(waveEvent());

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ applied: true });
    expect(writes.orderPaid).toBe(1);
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  test('signature invalide : refusée, rien n’est écrit', async () => {
    const writes = setupDb(pendingWaveTx());

    const { res } = await postWaveWebhook(waveEvent(), { signature: waveSignature('{}', 'mauvais_secret') });

    expect(res.statusCode).toBe(401);
    expect(writes.orderPaid).toBe(0);
  });

  test('corps modifié après signature : refusé', async () => {
    setupDb(pendingWaveTx());
    const signedFor = JSON.stringify(waveEvent({ amount: 1 }));

    const { res } = await postWaveWebhook(waveEvent({ amount: 36720 }), { signature: waveSignature(signedFor) });

    expect(res.statusCode).toBe(401);
  });

  test('en-tête de signature absent : refusé', async () => {
    setupDb(pendingWaveTx());
    const event = waveEvent();
    const req = mockReq({ params: { provider: 'wave' }, body: event, rawBody: Buffer.from(JSON.stringify(event)) });
    const res = mockRes();

    await controller.webhook(req, res, mockNext());

    expect(res.statusCode).toBe(401);
  });

  test('notification rejouée : appliquée une seule fois', async () => {
    const tx = pendingWaveTx();
    const writes = setupDb(tx);

    await postWaveWebhook(waveEvent());
    const second = await postWaveWebhook(waveEvent());

    expect(second.res.statusCode).toBe(200); // 200 pour que Wave arrête de rejouer
    expect(second.res.body).toMatchObject({ applied: false, reason: 'déjà confirmée' });
    expect(writes.orderPaid).toBe(1);
    expect(sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  test('montant différent de la commande : transaction en échec, commande non payée', async () => {
    const writes = setupDb(pendingWaveTx());

    const { res } = await postWaveWebhook(waveEvent({ amount: 100 }));

    expect(res.body).toMatchObject({ applied: false, reason: 'montant incohérent' });
    expect(writes.orderPaid).toBe(0);
    expect(writes.txUpdates[0].sql).toMatch(/status = 'failed'/);
  });

  test('paiement échoué : la transaction est mise à jour, la commande reste à payer', async () => {
    const writes = setupDb(pendingWaveTx());

    const { res } = await postWaveWebhook(waveEvent({ type: 'checkout.session.payment_failed' }));

    expect(res.body).toMatchObject({ applied: true });
    expect(writes.orderPaid).toBe(0);
    expect(writes.txUpdates[0].params[0]).toBe('failed');
  });

  test('référence inconnue : ignorée', async () => {
    const writes = setupDb(null);

    const { res } = await postWaveWebhook(waveEvent());

    expect(res.body).toMatchObject({ applied: false, reason: 'transaction inconnue' });
    expect(writes.orderPaid).toBe(0);
  });
});

describe('prestataire non configuré (simulateur)', () => {
  beforeEach(() => { configureWave(); unconfigureOrange(); });

  test('en production : une notification non vérifiable est refusée', async () => {
    process.env.NODE_ENV = 'production';
    const writes = setupDb(pendingWaveTx());
    const req = mockReq({
      params: { provider: 'orange_money' },
      body: { reference: 'CMD-2026-00001-abcd1234', status: 'succeeded', amount: 36720 },
    });
    const res = mockRes();

    await controller.webhook(req, res, mockNext());

    expect(res.statusCode).toBe(404);
    expect(writes.orderPaid).toBe(0);
  });

  test('une notification Orange Money ne peut pas confirmer un paiement Wave', async () => {
    process.env.NODE_ENV = 'development';
    const writes = setupDb(pendingWaveTx());
    const req = mockReq({
      params: { provider: 'orange_money' },
      body: { reference: 'CMD-2026-00001-abcd1234', status: 'succeeded', amount: 36720 },
    });
    const res = mockRes();

    await controller.webhook(req, res, mockNext());

    expect(res.body).toMatchObject({ applied: false, reason: 'prestataire différent de celui de la transaction' });
    expect(writes.orderPaid).toBe(0);
  });
});

describe('webhook Orange Money (configuré)', () => {
  beforeEach(() => {
    process.env.ORANGE_MONEY_CLIENT_ID = 'id';
    process.env.ORANGE_MONEY_CLIENT_SECRET = 'secret';
    process.env.ORANGE_MONEY_MERCHANT_KEY = 'key';
  });

  const omTx = () => ({ id: 2, order_id: 99, provider: 'orange_money', status: 'processing', amount: '36720.00', raw_payload: { notif_token: 'jeton-attendu' } });

  test('jeton de notification correct : payée', async () => {
    const writes = setupDb(omTx());
    const req = mockReq({
      params: { provider: 'orange_money' },
      body: { order_id: 'CMD-2026-00001-abcd1234', status: 'SUCCESS', amount: 36720, notif_token: 'jeton-attendu', txnid: 'MP123' },
    });
    const res = mockRes();

    await controller.webhook(req, res, mockNext());

    expect(res.body).toMatchObject({ applied: true });
    expect(writes.orderPaid).toBe(1);
  });

  test('jeton de notification faux : refusé', async () => {
    const writes = setupDb(omTx());
    const req = mockReq({
      params: { provider: 'orange_money' },
      body: { order_id: 'CMD-2026-00001-abcd1234', status: 'SUCCESS', amount: 36720, notif_token: 'devine' },
    });
    const res = mockRes();

    await controller.webhook(req, res, mockNext());

    expect(res.statusCode).toBe(401);
    expect(writes.orderPaid).toBe(0);
  });
});

describe('prestataire inconnu', () => {
  test('404', async () => {
    const res = mockRes();
    await controller.webhook(mockReq({ params: { provider: 'paypal' }, body: {} }), res, mockNext());
    expect(res.statusCode).toBe(404);
  });
});
