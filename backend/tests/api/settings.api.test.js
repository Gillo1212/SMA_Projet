/** /api/settings (paramètres, comptes admin) et /api/promo-codes — base de test réelle */
const { api, ids, PASSWORD, resetDatabase, closeDatabase, auth, query, lastEmail } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

describe('GET /api/settings/public', () => {
  test('TVA, livraison et coordonnées, sans aucun secret', async () => {
    const res = await api.get('/api/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ taxRate: 18, currency: 'XOF', delivery: { standard: { enabled: true, fee: 2500 } } });
    expect(res.body.data.company).toBeDefined();
    expect(JSON.stringify(res.body)).not.toMatch(/smtp_pass|sendgrid_api_key/);
  });
});

describe('paramètres (back-office)', () => {
  test('lecture : admin et commercial ; client 403', async () => {
    expect((await api.get('/api/settings').set(auth('admin'))).status).toBe(200);
    expect((await api.get('/api/settings').set(auth('commercial'))).status).toBe(200);
    expect((await api.get('/api/settings').set(auth('client'))).status).toBe(403);
  });

  test('modification : TVA et frais appliqués aussitôt au calcul public', async () => {
    const res = await api.put('/api/settings').set(auth('admin')).send({ tva_rate: '10', delivery_standard_fee: '3000', free_shipping_threshold: '50000' });
    expect(res.status).toBe(200);
    const pub = await api.get('/api/settings/public');
    expect(pub.body.data).toMatchObject({ taxRate: 10, freeShippingThreshold: 50000, delivery: { standard: { fee: 3000 } } });
    await api.put('/api/settings').set(auth('admin')).send({ tva_rate: '18', delivery_standard_fee: '2500', free_shipping_threshold: '0' });
  });

  test('le commercial consulte mais ne modifie pas (403)', async () => {
    expect((await api.put('/api/settings').set(auth('commercial')).send({ tva_rate: '0' })).status).toBe(403);
  });

  test('valeurs invalides : 400, rien n’est enregistré', async () => {
    const res = await api.put('/api/settings').set(auth('admin')).send({ tva_rate: 'beaucoup', parametre_inconnu: '1' });
    expect(res.status).toBe(400);
    expect(res.body.errors.map(e => e.field)).toEqual(expect.arrayContaining(['tva_rate', 'parametre_inconnu']));
  });

  test('au moins un mode de livraison doit rester actif', async () => {
    const res = await api.put('/api/settings').set(auth('admin'))
      .send({ delivery_pickup_enabled: '0', delivery_standard_enabled: '0', delivery_express_enabled: '0' });
    expect(res.status).toBe(400);
  });

  test('mot de passe SMTP : chiffré en base, jamais renvoyé', async () => {
    await api.put('/api/settings').set(auth('admin')).send({ smtp_pass: 'secret-smtp-123' });
    const [row] = await query("SELECT setting_value FROM settings WHERE setting_key = 'smtp_pass'");
    expect(row.setting_value).not.toContain('secret-smtp-123');
    const res = await api.get('/api/settings').set(auth('admin'));
    expect(res.body.settings).toMatchObject({ smtp_pass: '', smtp_pass_set: '1' });
  });

  test('POST /api/settings/smtp/test : envoi de test (transport de test), adresse invalide 400', async () => {
    const ok = await api.post('/api/settings/smtp/test').set(auth('admin')).send({ to: 'verif@smalim.test' });
    expect(ok.status).toBe(200);
    expect(lastEmail().to).toBe('verif@smalim.test');
    expect((await api.post('/api/settings/smtp/test').set(auth('admin')).send({ to: 'pas-une-adresse' })).status).toBe(400);
    expect((await api.post('/api/settings/smtp/test').set(auth('commercial')).send({ to: 'verif@smalim.test' })).status).toBe(403);
  });
});

describe('comptes administrateurs', () => {
  let createdId;

  test('liste visible par l’équipe, sans mot de passe', async () => {
    const res = await api.get('/api/settings/admins').set(auth('commercial'));
    expect(res.status).toBe(200);
    expect(res.body.admins.length).toBe(4);
    expect(res.body.admins.every(a => a.password === undefined)).toBe(true);
  });

  test('création réservée au super admin ; le nouveau compte peut se connecter', async () => {
    const body = { email: 'recrue@smalim.test', password: 'Recrue-2026', first_name: 'Recrue', last_name: 'Test', role: 'commercial' };
    expect((await api.post('/api/settings/admins').set(auth('admin')).send(body)).status).toBe(403);
    const res = await api.post('/api/settings/admins').set(auth('superAdmin')).send(body);
    expect(res.status).toBe(201);
    createdId = res.body.admin.id;
    expect(res.body.admin.password).toBeUndefined();
    expect((await api.post('/api/auth/admin/login').send({ email: 'recrue@smalim.test', password: 'Recrue-2026' })).status).toBe(200);
    expect((await api.post('/api/settings/admins').set(auth('superAdmin')).send(body)).status).toBe(409);
  });

  test('modification du nom et du rôle', async () => {
    const res = await api.put(`/api/settings/admins/${createdId}`).set(auth('superAdmin')).send({ first_name: 'Promue', role: 'admin' });
    expect(res.status).toBe(200);
    const [row] = await query('SELECT first_name, role FROM admins WHERE id = ?', [createdId]);
    expect(row).toEqual({ first_name: 'Promue', role: 'admin' });
  });

  test('garde-fous : pas sur soi-même, toujours un super admin actif', async () => {
    expect((await api.put(`/api/settings/admins/${ids.superAdmin}`).set(auth('superAdmin')).send({ role: 'admin' })).status).toBe(400);
    expect((await api.patch(`/api/settings/admins/${ids.superAdmin}/toggle`).set(auth('superAdmin'))).status).toBe(400);
    expect((await api.delete(`/api/settings/admins/${ids.superAdmin}`).set(auth('superAdmin'))).status).toBe(400);
  });

  test('désactivation : le compte ne peut plus se connecter', async () => {
    expect((await api.patch(`/api/settings/admins/${createdId}/toggle`).set(auth('superAdmin'))).status).toBe(200);
    expect((await api.post('/api/auth/admin/login').send({ email: 'recrue@smalim.test', password: 'Recrue-2026' })).status).toBe(401);
  });

  test('suppression ; compte inconnu : 404', async () => {
    expect((await api.delete(`/api/settings/admins/${createdId}`).set(auth('superAdmin'))).status).toBe(200);
    expect((await api.delete(`/api/settings/admins/${createdId}`).set(auth('superAdmin'))).status).toBe(404);
    expect((await api.put('/api/settings/admins/9999').set(auth('superAdmin')).send({ first_name: 'X' })).status).toBe(404);
  });

  test('un auteur d’articles est désactivé plutôt que supprimé (ses articles restent)', async () => {
    const created = await api.post('/api/settings/admins').set(auth('superAdmin'))
      .send({ email: 'auteur@smalim.test', password: 'Auteur-2026', first_name: 'Auteur', last_name: 'Test', role: 'admin' });
    const authorId = created.body.admin.id;
    await query('UPDATE blog_articles SET author_id = ? WHERE id = ?', [authorId, ids.draftArticle]);

    const res = await api.delete(`/api/settings/admins/${authorId}`).set(auth('superAdmin'));
    expect(res.status).toBe(200);
    expect(res.body.deactivated).toBe(true);
    const [row] = await query('SELECT is_active FROM admins WHERE id = ?', [authorId]);
    expect(row.is_active).toBe(0);
    expect((await query('SELECT id FROM blog_articles WHERE id = ?', [ids.draftArticle]))).toHaveLength(1);
  });
});

describe('/api/promo-codes', () => {
  let createdId;

  test('liste : équipe seulement', async () => {
    expect((await api.get('/api/promo-codes').set(auth('commercial'))).body.data.length).toBe(4);
    expect((await api.get('/api/promo-codes').set(auth('client'))).status).toBe(403);
  });

  test('création : code mis en majuscules ; le commercial ne crée pas', async () => {
    const body = { code: 'ete2026', type: 'percentage', value: 15, max_uses: 100, expires_at: '2099-08-31T23:59:59Z' };
    expect((await api.post('/api/promo-codes').set(auth('commercial')).send(body)).status).toBe(403);
    const res = await api.post('/api/promo-codes').set(auth('admin')).send(body);
    expect(res.status).toBe(201);
    createdId = res.body.data.id;
    expect(res.body.data).toMatchObject({ code: 'ETE2026', type: 'percentage', max_uses: 100 });
  });

  test('doublon : 409 ; pourcentage > 100 ou valeur nulle : 400', async () => {
    expect((await api.post('/api/promo-codes').set(auth('admin')).send({ code: 'ETE2026', type: 'fixed', value: 1000 })).status).toBe(409);
    expect((await api.post('/api/promo-codes').set(auth('admin')).send({ code: 'TROP', type: 'percentage', value: 150 })).status).toBe(400);
    expect((await api.post('/api/promo-codes').set(auth('admin')).send({ code: 'ZERO', type: 'fixed', value: 0 })).status).toBe(400);
  });

  test('modification partielle et désactivation', async () => {
    const res = await api.patch(`/api/promo-codes/${createdId}`).set(auth('admin')).send({ value: 20, is_active: false });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ value: '20.00', is_active: 0 });
    expect((await api.post('/api/orders/validate-promo').send({ code: 'ETE2026', subtotal: 10000 })).status).toBe(404);
  });

  test('passer en pourcentage avec une valeur > 100 existante : 400', async () => {
    const fixed = await api.post('/api/promo-codes').set(auth('admin')).send({ code: 'FIXE500', type: 'fixed', value: 500 });
    expect((await api.patch(`/api/promo-codes/${fixed.body.data.id}`).set(auth('admin')).send({ type: 'percentage' })).status).toBe(400);
  });

  test('suppression : code jamais utilisé supprimé, code utilisé seulement désactivé', async () => {
    expect((await api.delete(`/api/promo-codes/${createdId}`).set(auth('admin'))).body).toMatchObject({ success: true });
    expect((await query('SELECT id FROM promo_codes WHERE id = ?', [createdId]))).toEqual([]);

    const used = await api.delete('/api/promo-codes/4').set(auth('admin')); // EPUISE, uses_count = 1
    expect(used.body).toMatchObject({ deactivated: true });
    expect((await query('SELECT is_active FROM promo_codes WHERE id = 4'))[0].is_active).toBe(0);
    expect((await api.delete('/api/promo-codes/9999').set(auth('admin'))).status).toBe(404);
  });

  test('connexion super admin toujours possible (aucun effet de bord sur les comptes)', async () => {
    expect((await api.post('/api/auth/admin/login').send({ email: 'super@smalim.test', password: PASSWORD })).status).toBe(200);
  });
});
