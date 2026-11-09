/**
 * Provider Wave : forme exacte des appels à l'API Checkout (aucun appel réseau,
 * `fetch` est simulé) et traduction des sessions en statuts internes.
 */
const crypto = require('crypto');
const wave = require('../services/payment/wave.provider');

const ENV_KEYS = ['WAVE_API_KEY', 'WAVE_API_SIGNING_SECRET', 'WAVE_API_URL'];
const savedEnv = {};
beforeAll(() => { for (const k of ENV_KEYS) savedEnv[k] = process.env[k]; });
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]; else process.env[k] = savedEnv[k];
  }
});

beforeEach(() => {
  process.env.WAVE_API_KEY = 'wave_sn_prod_test';
  delete process.env.WAVE_API_SIGNING_SECRET;
  delete process.env.WAVE_API_URL;
});

/** Simule une réponse de l'API Wave et garde la requête envoyée */
function mockFetch(status, body) {
  const spy = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  return spy;
}

const checkoutParams = {
  reference: 'CMD-2026-00001-abcd1234',
  amount: 36720,
  currency: 'xof',
  successUrl: 'https://smalim.sn/paiement/retour?reference=CMD-2026-00001-abcd1234',
  errorUrl: 'https://smalim.sn/paiement/retour?reference=CMD-2026-00001-abcd1234&echec=1',
};

describe('createCheckout', () => {
  test('POST /v1/checkout/sessions : montant en chaîne, devise en majuscules, clé en Bearer', async () => {
    const fetchSpy = mockFetch(200, { id: 'cos-1', wave_launch_url: 'https://pay.wave.com/c/cos-1' });

    const session = await wave.createCheckout(checkoutParams);

    expect(session).toMatchObject({ providerRef: 'cos-1', checkoutUrl: 'https://pay.wave.com/c/cos-1' });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://api.wave.com/v1/checkout/sessions');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer wave_sn_prod_test');
    expect(init.headers['Wave-Signature']).toBeUndefined();
    expect(JSON.parse(init.body)).toEqual({
      amount: '36720',
      currency: 'XOF',
      success_url: checkoutParams.successUrl,
      error_url: checkoutParams.errorUrl,
      client_reference: checkoutParams.reference,
    });
  });

  test('montant arrondi : le franc CFA n’a pas de décimales', async () => {
    const fetchSpy = mockFetch(200, { id: 'cos-1', wave_launch_url: 'x' });
    await wave.createCheckout({ ...checkoutParams, amount: 36720.4 });
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).amount).toBe('36720');
  });

  test('clé créée avec signature des requêtes : en-tête Wave-Signature valide', async () => {
    process.env.WAVE_API_SIGNING_SECRET = 'wave_sn_AKS_test';
    const fetchSpy = mockFetch(200, { id: 'cos-1', wave_launch_url: 'x' });

    await wave.createCheckout(checkoutParams);

    const { headers, body } = fetchSpy.mock.calls[0][1];
    const [, t, v1] = headers['Wave-Signature'].match(/^t=(\d+),v1=([0-9a-f]{64})$/);
    expect(Math.abs(Date.now() / 1000 - Number(t))).toBeLessThan(5);
    expect(v1).toBe(crypto.createHmac('sha256', 'wave_sn_AKS_test').update(t + body).digest('hex'));
  });

  test('adresses de retour en http:// : refusées avant tout appel à Wave', async () => {
    const fetchSpy = mockFetch(200, {});
    await expect(wave.createCheckout({ ...checkoutParams, successUrl: 'http://localhost:5173/paiement/retour' }))
      .rejects.toThrow(/HTTPS/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test.each([
    ['missing-signature', /WAVE_API_SIGNING_SECRET/],
    ['ip-not-allowed', /adresse IP/],
  ])('erreur Wave « %s » : message de configuration explicite', async (code, message) => {
    mockFetch(code === 'ip-not-allowed' ? 403 : 401, { code, message: 'raw' });
    await expect(wave.createCheckout(checkoutParams)).rejects.toThrow(message);
  });

  test('erreur de validation : détails repris dans le message', async () => {
    mockFetch(400, { code: 'request-validation-error', message: 'Invalid request', details: [{ loc: 'amount', msg: 'invalid', type: 'x' }] });
    await expect(wave.createCheckout(checkoutParams)).rejects.toThrow('Invalid request — amount: invalid');
  });

  test('Wave injoignable : erreur lisible', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(Object.assign(new Error('aborted'), { name: 'TimeoutError' }));
    await expect(wave.createCheckout(checkoutParams)).rejects.toThrow('Wave injoignable (délai dépassé)');
  });
});

describe('expireCheckout', () => {
  test('POST /v1/checkout/sessions/:id/expire : true si la session est fermée', async () => {
    const fetchSpy = mockFetch(200, {});
    expect(await wave.expireCheckout('cos-1')).toBe(true);
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.wave.com/v1/checkout/sessions/cos-1/expire');
    expect(fetchSpy.mock.calls[0][1].method).toBe('POST');
  });

  test('déjà payée ou expirée (409) : false, pas d’erreur', async () => {
    mockFetch(409, { code: 'checkout-session-already-completed', message: 'x' });
    expect(await wave.expireCheckout('cos-1')).toBe(false);
  });

  test('autre erreur : remontée', async () => {
    mockFetch(500, { code: 'service-unavailable', message: 'Service unavailable' });
    await expect(wave.expireCheckout('cos-1')).rejects.toThrow('Service unavailable');
  });
});

describe('fetchPayment / parseSession', () => {
  test('GET /v1/checkout/sessions/:id', async () => {
    const fetchSpy = mockFetch(200, { id: 'cos-1', client_reference: 'R', amount: '36720', checkout_status: 'complete', payment_status: 'succeeded' });

    const result = await wave.fetchPayment('cos-1');

    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.wave.com/v1/checkout/sessions/cos-1');
    expect(fetchSpy.mock.calls[0][1].method).toBe('GET');
    expect(result).toMatchObject({ reference: 'R', status: 'succeeded', amount: 36720, providerRef: 'cos-1' });
  });

  test.each([
    [{ checkout_status: 'complete', payment_status: 'succeeded' }, 'succeeded'],
    [{ checkout_status: 'complete', payment_status: 'cancelled' }, 'failed'], // complète mais pas payée
    [{ checkout_status: 'failed', payment_status: 'cancelled' }, 'failed'],
    [{ checkout_status: 'open', payment_status: 'cancelled' }, 'failed'],
    [{ checkout_status: 'expired', payment_status: 'processing' }, 'expired'],
    [{ checkout_status: 'open', payment_status: 'processing' }, 'pending'],
  ])('session %o → %s', (session, expected) => {
    expect(wave.parseSession(session).status).toBe(expected);
  });
});
