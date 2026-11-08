const { api, resetDatabase, closeDatabase, query } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

test('les tests tournent sur la base de test, jamais sur la base de travail', async () => {
  const [{ db }] = await query('SELECT DATABASE() AS db');
  expect(db).toMatch(/_test$/);
});

test('GET /api/health', async () => {
  const res = await api.get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});

test('route inconnue : 404 JSON', async () => {
  const res = await api.get('/api/nexiste-pas');
  expect(res.status).toBe(404);
  expect(res.body).toMatchObject({ success: false });
});

test('les images de /uploads sont affichables depuis le frontend (CORP cross-origin)', async () => {
  const res = await api.get('/api/health');
  expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
});
