/** /api/quotes — base de test réelle */
const { api, ids, resetDatabase, closeDatabase, auth, query, lastEmail, outbox } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

const wait = (ms = 100) => new Promise(r => setTimeout(r, ms));
const quoteBody = (overrides = {}) => ({
  contact_name: 'Fatou Ndiaye',
  contact_email: 'fatou@prospect.test',
  contact_phone: '+221770000009',
  company_name: 'Prospect SA',
  machine_type: 'Distributeur snacks',
  description: 'Trois distributeurs pour nos sites.',
  budget: 3000000,
  quantity: 3,
  ...overrides,
});

describe('POST /api/quotes', () => {
  test('visiteur : demande enregistrée sans compte rattaché', async () => {
    const res = await api.post('/api/quotes').send(quoteBody());
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ client_id: null, status: 'pending', quantity: 3, contact_email: 'fatou@prospect.test' });
    expect(res.body.data.quote_number).toMatch(/^DEV-\d{4}-\d{5}$/);
  });

  test('client connecté : demande rattachée à son compte', async () => {
    const res = await api.post('/api/quotes').set(auth('client')).send(quoteBody({ contact_email: 'client@entreprise.test' }));
    expect(res.status).toBe(201);
    expect(res.body.data.client_id).toBe(ids.client);
  });

  test('champs requis manquants ou invalides : 400', async () => {
    for (const body of [
      quoteBody({ contact_name: '' }),
      quoteBody({ contact_email: 'pas-un-email' }),
      quoteBody({ description: '' }),
      quoteBody({ machine_type: '' }),
      quoteBody({ quantity: 0 }),
    ]) {
      expect((await api.post('/api/quotes').send(body)).status).toBe(400);
    }
  });
});

describe('GET /api/quotes', () => {
  test('client : uniquement ses devis', async () => {
    const res = await api.get('/api/quotes').set(auth('client'));
    expect(res.status).toBe(200);
    expect(res.body.data.every(q => q.client_id === ids.client)).toBe(true);
    expect((await api.get('/api/quotes').set(auth('otherClient'))).body.data).toEqual([]);
  });

  test('admin : tous, filtres statut et recherche', async () => {
    const all = await api.get('/api/quotes').set(auth('admin'));
    expect(all.body.pagination.total).toBeGreaterThanOrEqual(5);
    const quoted = await api.get('/api/quotes?status=quoted').set(auth('admin'));
    expect(quoted.body.data.every(q => q.status === 'quoted')).toBe(true);
    const search = await api.get('/api/quotes?search=Prospect').set(auth('admin'));
    expect(search.body.data.length).toBeGreaterThan(0);
  });

  test('détail : le sien oui, celui d’un autre 403, inconnu 404 ; visiteur 401', async () => {
    expect((await api.get(`/api/quotes/${ids.quote}`).set(auth('client'))).status).toBe(200);
    expect((await api.get(`/api/quotes/${ids.quote}`).set(auth('otherClient'))).status).toBe(403);
    expect((await api.get('/api/quotes/9999').set(auth('admin'))).status).toBe(404);
    expect((await api.get(`/api/quotes/${ids.quote}`)).status).toBe(401);
  });
});

describe('PATCH /api/quotes/:id/status — côté équipe', () => {
  test('passage « en cours » : pas d’email au client', async () => {
    const before = outbox.length;
    const res = await api.patch(`/api/quotes/${ids.quote}/status`).set(auth('commercial')).send({ status: 'processing' });
    expect(res.status).toBe(200);
    await wait();
    expect(outbox.length).toBe(before);
  });

  test('proposition chiffrée : montant, réponse, validité enregistrés et email au client', async () => {
    const res = await api.patch(`/api/quotes/${ids.quote}/status`).set(auth('admin')).send({
      status: 'quoted', proposed_amount: 2400000, admin_response: 'Deux machines installées.', expires_at: '2099-12-31',
    });
    expect(res.status).toBe(200);
    const [quote] = await query('SELECT status, proposed_amount, admin_response, expires_at FROM quotes WHERE id = ?', [ids.quote]);
    expect(quote).toMatchObject({ status: 'quoted', proposed_amount: '2400000.00', admin_response: 'Deux machines installées.' });
    expect(quote.expires_at).not.toBeNull();
    await wait();
    expect(lastEmail().to).toBe('client@entreprise.test');
  });

  test('demande d’un visiteur : l’email part à l’adresse de contact', async () => {
    const created = await api.post('/api/quotes').send(quoteBody({ contact_email: 'contact@visiteur.test' }));
    await api.patch(`/api/quotes/${created.body.data.id}/status`).set(auth('admin')).send({ status: 'quoted', proposed_amount: 500000 });
    await wait();
    expect(lastEmail().to).toBe('contact@visiteur.test');
  });

  test('statut invalide : 400 ; devis inconnu : 404', async () => {
    expect((await api.patch(`/api/quotes/${ids.quote}/status`).set(auth('admin')).send({ status: 'gagne' })).status).toBe(400);
    expect((await api.patch('/api/quotes/9999/status').set(auth('admin')).send({ status: 'processing' })).status).toBe(404);
  });
});

describe('PATCH /api/quotes/:id/status — réponse du client', () => {
  test('accepter une proposition valable', async () => {
    const res = await api.patch(`/api/quotes/${ids.quotedQuote}/status`).set(auth('client')).send({ status: 'accepted' });
    expect(res.status).toBe(200);
    const [quote] = await query('SELECT status FROM quotes WHERE id = ?', [ids.quotedQuote]);
    expect(quote.status).toBe('accepted');
  });

  test('répondre deux fois : 409', async () => {
    expect((await api.patch(`/api/quotes/${ids.quotedQuote}/status`).set(auth('client')).send({ status: 'refused' })).status).toBe(409);
  });

  test('proposition expirée : 409', async () => {
    const res = await api.patch(`/api/quotes/${ids.expiredQuote}/status`).set(auth('client')).send({ status: 'accepted' });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/expiré/);
  });

  test('un client ne choisit pas un statut interne (403) ni le devis d’un autre (404)', async () => {
    expect((await api.patch(`/api/quotes/${ids.quote}/status`).set(auth('client')).send({ status: 'quoted', proposed_amount: 1 })).status).toBe(403);
    expect((await api.patch(`/api/quotes/${ids.quote}/status`).set(auth('otherClient')).send({ status: 'accepted' })).status).toBe(404);
  });
});

describe('DELETE /api/quotes/:id', () => {
  test('admin seulement', async () => {
    expect((await api.delete(`/api/quotes/${ids.expiredQuote}`).set(auth('client'))).status).toBe(403);
    expect((await api.delete(`/api/quotes/${ids.expiredQuote}`).set(auth('admin'))).status).toBe(200);
    expect((await api.delete(`/api/quotes/${ids.expiredQuote}`).set(auth('admin'))).status).toBe(404);
  });
});
