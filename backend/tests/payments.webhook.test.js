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
const waveProvider = require('../services/payment/wave.provider');
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

const nowTs = () => String(Math.floor(Date.now() / 1000));
const hmac = (secret, payload) => crypto.createHmac('sha256', secret).update(payload).digest('hex');

/** En-tête Wave-Signature : t=<timestamp>,v1=HMAC_SHA256(secret, timestamp + corps brut) */
function waveSignature(rawBody, secret = WAVE_SECRET, timestamp = nowTs()) {
  return `t=${timestamp},v1=${hmac(secret, `${timestamp}${rawBody}`)}`;
}

function waveEvent({ reference = 'CMD-2026-00001-abcd1234', amount = 36720, type = 'checkout.session.completed' } = {}) {
  const succeeded = type === 'checkout.session.completed';
  return {
    id: 'AE_evt_1',
    type,
    data: {
      id: 'cos-123',
      client_reference: reference,
      amount: String(amount),
      currency: 'XOF',
      checkout_status: succeeded ? 'complete' : 'failed',
      payment_status: succeeded ? 'succeeded' : 'cancelled',
    },
  };
}

/**
 * Session relue chez Wave lors de la contre-vérification (aucun appel réseau) :
 * par défaut celle que décrit l'événement ; `sessionOverride` simule un désaccord
 * (objet fusionné) ou une panne (Error).
 */
let sessionOverride = null;
let lastEventSession = null;
beforeEach(() => {
  sessionOverride = null;
  jest.spyOn(waveProvider, 'fetchPayment').mockImplementation(async (id) => {
    if (sessionOverride instanceof Error) throw sessionOverride;
    return waveProvider.parseSession({ ...lastEventSession, id, ...sessionOverride });
  });
});

/** Transaction en base + suivi des écritures ; `order` : état de paiement de la commande */
function setupDb(tx, order = { payment_status: 'pending', payment_reference: null }) {
  const writes = { orderPaid: 0, txUpdates: [], order };
  db.queryOne.mockImplementation(async (sql) => {
    if (/FROM payment_transactions WHERE reference = \?/.test(sql)) return tx;
    if (/SELECT payment_status(, payment_reference)? FROM orders WHERE id = \?/.test(sql)) return order;
    if (/SELECT \* FROM orders WHERE id = \?/.test(sql)) return { id: tx?.order_id, client_id: 7 };
    if (/FROM clients WHERE id = \?/.test(sql)) return { email: 'client@example.test', first_name: 'Awa' };
    throw new Error(`queryOne inattendu : ${sql}`);
  });
  db.query.mockImplementation(async (sql, params) => {
    if (/^UPDATE payment_transactions/.test(sql.trim())) writes.txUpdates.push({ sql, params });
    return [];
  });
  db.transaction.mockImplementation(async (callback) => callback({
    execute: jest.fn(async (sql, params) => {
      if (/UPDATE orders/.test(sql)) {
        writes.orderPaid += 1;
        Object.assign(order, { payment_status: 'paid', payment_reference: params[0] });
      }
      if (/SET status = 'succeeded'/.test(sql) && tx) tx.status = 'succeeded';
      return [{}];
    }),
  }));
  return writes;
}

const pendingWaveTx = () => ({ id: 1, order_id: 99, provider: 'wave', status: 'processing', amount: '36720.00', raw_payload: {} });

async function postWaveWebhook(event, { signature, headers } = {}) {
  const rawBody = JSON.stringify(event);
  lastEventSession = event.data;
  const req = mockReq({
    params: { provider: 'wave' },
    body: event,
    rawBody: Buffer.from(rawBody),
    headers: headers ?? { 'Wave-Signature': signature ?? waveSignature(rawBody) },
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

  test('événement sans commande (test du portail, b2b.*) : 200, ignoré, pas de relecture chez Wave', async () => {
    const writes = setupDb(pendingWaveTx());
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const { res } = await postWaveWebhook({ id: 'AE_test', type: 'b2b.payment_received', data: { id: 'b2b-1', amount: '100' } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ applied: false, reason: 'événement sans référence de commande' });
    expect(waveProvider.fetchPayment).not.toHaveBeenCalled();
    expect(writes.orderPaid).toBe(0);
  });

  test('signature trop ancienne (rejeu) : refusée', async () => {
    const writes = setupDb(pendingWaveTx());
    const event = waveEvent();
    const old = String(Math.floor(Date.now() / 1000) - 600);

    const { res } = await postWaveWebhook(event, { signature: waveSignature(JSON.stringify(event), WAVE_SECRET, old) });

    expect(res.statusCode).toBe(401);
    expect(writes.orderPaid).toBe(0);
  });

  test('plusieurs signatures v1 (changement de secret) : acceptée si l’une est valide', async () => {
    const writes = setupDb(pendingWaveTx());
    const event = waveEvent();
    const raw = JSON.stringify(event);
    const t = nowTs();

    const { res } = await postWaveWebhook(event, { signature: `t=${t},v1=${hmac('ancien_secret', t + raw)},v1=${hmac(WAVE_SECRET, t + raw)}` });

    expect(res.statusCode).toBe(200);
    expect(writes.orderPaid).toBe(1);
  });

  test('mode SHARED_SECRET (Authorization: Bearer) : bon secret accepté, mauvais refusé', async () => {
    const writes = setupDb(pendingWaveTx());

    const bad = await postWaveWebhook(waveEvent(), { headers: { Authorization: 'Bearer devine' } });
    expect(bad.res.statusCode).toBe(401);

    const good = await postWaveWebhook(waveEvent(), { headers: { Authorization: `Bearer ${WAVE_SECRET}` } });
    expect(good.res.statusCode).toBe(200);
    expect(writes.orderPaid).toBe(1);
  });

  test('secret du webhook absent : erreur serveur, Wave rejouera plus tard', async () => {
    delete process.env.WAVE_WEBHOOK_SECRET;
    const writes = setupDb(pendingWaveTx());

    const { next } = await postWaveWebhook(waveEvent());

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(writes.orderPaid).toBe(0);
  });
});

describe('webhook Wave : contre-vérification de la session', () => {
  beforeEach(configureWave);

  test('la session est relue chez Wave avant de confirmer', async () => {
    setupDb(pendingWaveTx());
    await postWaveWebhook(waveEvent());
    expect(waveProvider.fetchPayment).toHaveBeenCalledWith('cos-123');
  });

  test('notification « payé » mais session pas encore payée chez Wave : rien n’est confirmé', async () => {
    const writes = setupDb(pendingWaveTx());
    sessionOverride = { checkout_status: 'open', payment_status: 'processing' };

    const { res } = await postWaveWebhook(waveEvent());

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ applied: false, reason: 'paiement encore en cours' });
    expect(writes.orderPaid).toBe(0);
  });

  test('le montant relu chez Wave fait foi', async () => {
    const writes = setupDb(pendingWaveTx());
    sessionOverride = { amount: '100' };

    const { res } = await postWaveWebhook(waveEvent());

    expect(res.body).toMatchObject({ applied: false, reason: 'montant incohérent' });
    expect(writes.orderPaid).toBe(0);
  });

  test('session d’une autre commande : refusée', async () => {
    const writes = setupDb(pendingWaveTx());
    sessionOverride = { client_reference: 'CMD-2026-00002-autre' };

    const { res } = await postWaveWebhook(waveEvent());

    expect(res.statusCode).toBe(400);
    expect(writes.orderPaid).toBe(0);
  });

  test('Wave injoignable : 502 pour que Wave rejoue, rien n’est écrit', async () => {
    const writes = setupDb(pendingWaveTx());
    sessionOverride = new Error('Wave injoignable (délai dépassé)');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { res } = await postWaveWebhook(waveEvent());

    expect(res.statusCode).toBe(502);
    expect(writes.orderPaid).toBe(0);
    expect(writes.txUpdates).toEqual([]);
  });
});

describe('GET /api/payments/status : rattrapage sans webhook', () => {
  beforeEach(configureWave);

  const statusRow = { reference: 'CMD-2026-00001-abcd1234', provider: 'wave', provider_ref: 'cos-123', amount: '36720.00', currency: 'XOF', order_id: 99, client_id: 7 };

  function setupStatusDb(tx) {
    const writes = setupDb(tx);
    const base = db.queryOne.getMockImplementation();
    db.queryOne.mockImplementation(async (sql, params) => {
      if (/FROM payment_transactions pt/.test(sql)) return { ...statusRow, status: tx.status };
      return base(sql, params);
    });
    return writes;
  }

  const waveSession = (overrides) => ({ client_reference: statusRow.reference, amount: '36720', ...overrides });

  async function getStatus(user = { type: 'client', id: 7 }) {
    const req = mockReq({ params: { reference: statusRow.reference }, user });
    const res = mockRes();
    await controller.getStatus(req, res, mockNext());
    return res;
  }

  test('payé chez Wave mais webhook jamais reçu : la commande est confirmée', async () => {
    const writes = setupStatusDb(pendingWaveTx());
    lastEventSession = waveSession({ checkout_status: 'complete', payment_status: 'succeeded' });

    const res = await getStatus();

    expect(writes.orderPaid).toBe(1);
    expect(res.body.data.status).toBe('succeeded');
    expect(res.body.data.provider_ref).toBeUndefined();
  });

  test('session expirée : transaction marquée expirée, commande à payer', async () => {
    const writes = setupStatusDb(pendingWaveTx());
    lastEventSession = waveSession({ checkout_status: 'expired', payment_status: 'processing' });

    await getStatus();

    expect(writes.orderPaid).toBe(0);
    expect(writes.txUpdates[0].params[0]).toBe('expired');
  });

  test('toujours en cours chez Wave : rien ne change', async () => {
    const writes = setupStatusDb(pendingWaveTx());
    lastEventSession = waveSession({ checkout_status: 'open', payment_status: 'processing' });

    const res = await getStatus();

    expect(writes.txUpdates).toEqual([]);
    expect(res.body.data.status).toBe('processing');
  });

  test('Wave injoignable : le statut connu est renvoyé quand même', async () => {
    setupStatusDb(pendingWaveTx());
    sessionOverride = new Error('Wave injoignable');
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const res = await getStatus();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('processing');
  });

  test('sans clé Wave (simulateur) : aucune lecture chez Wave', async () => {
    delete process.env.WAVE_API_KEY;
    setupStatusDb(pendingWaveTx());

    await getStatus();

    expect(waveProvider.fetchPayment).not.toHaveBeenCalled();
  });
});

describe('double paiement (deux sessions payées pour une même commande)', () => {
  beforeEach(configureWave);

  test('second encaissement : gardé, signalé à rembourser, commande pas reconfirmée', async () => {
    const writes = setupDb(pendingWaveTx(), { payment_status: 'paid', payment_reference: 'CMD-2026-00001-premiere' });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { res } = await postWaveWebhook(waveEvent());

    expect(res.body).toMatchObject({ applied: false, reason: expect.stringMatching(/déjà payée/) });
    expect(writes.orderPaid).toBe(0);
    expect(writes.txUpdates[0].sql).toMatch(/status = 'succeeded'/);
    expect(writes.txUpdates[0].params[2]).toMatch(/rembourser/);
    expect(sendOrderConfirmation).not.toHaveBeenCalled();
  });
});

describe('nouvelle tentative : fermeture de la session précédente', () => {
  beforeEach(configureWave);
  const openTx = () => ({ ...pendingWaveTx(), reference: 'CMD-2026-00001-abcd1234', provider_ref: 'cos-123' });

  test('session encore ouverte : expirée chez Wave, transaction annulée', async () => {
    const writes = setupDb(openTx());
    lastEventSession = { client_reference: 'CMD-2026-00001-abcd1234', amount: '36720', checkout_status: 'open', payment_status: 'processing' };
    const expire = jest.spyOn(waveProvider, 'expireCheckout').mockResolvedValue(true);

    const outcome = await controller._closePreviousAttempt(openTx());

    expect(outcome).toBe('closed');
    expect(expire).toHaveBeenCalledWith('cos-123');
    expect(writes.txUpdates[0].sql).toMatch(/status = 'cancelled'/);
    expect(writes.orderPaid).toBe(0);
  });

  test('payée entre-temps (webhook pas encore reçu) : paiement appliqué, pas de nouvelle session', async () => {
    const writes = setupDb(openTx());
    lastEventSession = { client_reference: 'CMD-2026-00001-abcd1234', amount: '36720', checkout_status: 'complete', payment_status: 'succeeded' };
    const expire = jest.spyOn(waveProvider, 'expireCheckout');

    const outcome = await controller._closePreviousAttempt(openTx());

    expect(outcome).toBe('paid');
    expect(expire).not.toHaveBeenCalled();
    expect(writes.orderPaid).toBe(1);
  });

  test('payée au moment de l’expiration (Wave répond 409) : relue, paiement appliqué', async () => {
    const writes = setupDb(openTx());
    lastEventSession = { client_reference: 'CMD-2026-00001-abcd1234', amount: '36720', checkout_status: 'open', payment_status: 'processing' };
    jest.spyOn(waveProvider, 'expireCheckout').mockImplementation(async () => {
      lastEventSession = { ...lastEventSession, checkout_status: 'complete', payment_status: 'succeeded' };
      return false;
    });

    expect(await controller._closePreviousAttempt(openTx())).toBe('paid');
    expect(writes.orderPaid).toBe(1);
  });

  test('Wave injoignable : « unknown », aucune nouvelle session ne doit être ouverte', async () => {
    const writes = setupDb(openTx());
    sessionOverride = new Error('Wave injoignable');
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(await controller._closePreviousAttempt(openTx())).toBe('unknown');
    expect(writes.txUpdates).toEqual([]);
  });

  test('sans clé Wave (simulateur) : simplement annulée', async () => {
    delete process.env.WAVE_API_KEY;
    const writes = setupDb(openTx());

    expect(await controller._closePreviousAttempt(openTx())).toBe('closed');
    expect(waveProvider.fetchPayment).not.toHaveBeenCalled();
    expect(writes.txUpdates[0].sql).toMatch(/status = 'cancelled'/);
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
