/** /api/auth — base de test réelle */
const crypto = require('crypto');
const { api, ids, PASSWORD, resetDatabase, closeDatabase, auth, query, outbox, lastEmail } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

const sha256 = t => crypto.createHash('sha256').update(t).digest('hex');
/** Jeton en clair extrait du lien d'un email (…?token=xxx) */
const tokenFromEmail = email => /token=([a-f0-9]{64})/.exec(email.html)[1];

describe('POST /api/auth/admin/login', () => {
  test('identifiants corrects : jetons + profil sans mot de passe, last_login mis à jour', async () => {
    const res = await api.post('/api/auth/admin/login').send({ email: 'super@smalim.test', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, user: { id: ids.superAdmin, role: 'super_admin' } });
    expect(res.body.token).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
    const [row] = await query('SELECT last_login FROM admins WHERE id = ?', [ids.superAdmin]);
    expect(row.last_login).not.toBeNull();
  });

  test('mauvais mot de passe : 401', async () => {
    const res = await api.post('/api/auth/admin/login').send({ email: 'super@smalim.test', password: 'faux' });
    expect(res.status).toBe(401);
  });

  test('compte désactivé : 401', async () => {
    const res = await api.post('/api/auth/admin/login').send({ email: 'ancien@smalim.test', password: PASSWORD });
    expect(res.status).toBe(401);
  });

  test('un client ne se connecte pas au back-office', async () => {
    const res = await api.post('/api/auth/admin/login').send({ email: 'client@entreprise.test', password: PASSWORD });
    expect(res.status).toBe(401);
  });

  test('email invalide : 400 (validation)', async () => {
    const res = await api.post('/api/auth/admin/login').send({ email: 'pas-un-email', password: 'x' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/admin/register', () => {
  const body = { email: 'nouvel.admin@smalim.test', password: 'Motdepasse1', first_name: 'Nouvel', last_name: 'Admin', role: 'admin' };

  test('réservé au super administrateur', async () => {
    expect((await api.post('/api/auth/admin/register').send(body)).status).toBe(401);
    expect((await api.post('/api/auth/admin/register').set(auth('admin')).send(body)).status).toBe(403);
  });

  test('super admin : compte créé', async () => {
    const res = await api.post('/api/auth/admin/register').set(auth('superAdmin')).send(body);
    expect(res.status).toBe(201);
  });

  test('email déjà utilisé : 409', async () => {
    const res = await api.post('/api/auth/admin/register').set(auth('superAdmin')).send(body);
    expect(res.status).toBe(409);
  });

  test('mot de passe faible : 400', async () => {
    const res = await api.post('/api/auth/admin/register').set(auth('superAdmin')).send({ ...body, email: 'x@smalim.test', password: 'faible' });
    expect(res.status).toBe(400);
  });
});

describe('client : inscription, vérification de l’email, connexion', () => {
  const email = 'nouveau.client@entreprise.test';

  test('inscription : compte créé, jetons, email de vérification envoyé', async () => {
    const res = await api.post('/api/auth/client/register').send({
      email, password: 'Motdepasse1', first_name: 'Nouveau', last_name: 'Client', phone: '+221 77 123 45 67',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    await new Promise(r => setTimeout(r, 100)); // envoi non bloquant
    expect(lastEmail().to).toBe(email);
    const [row] = await query('SELECT email_verified, password FROM clients WHERE email = ?', [email]);
    expect(row.email_verified).toBe(0);
    expect(row.password).toMatch(/^\$2b\$12\$/); // haché par bcrypt, coût 12
  });

  test('même email : 409', async () => {
    const res = await api.post('/api/auth/client/register').send({ email, password: 'Motdepasse1', first_name: 'A', last_name: 'B' });
    expect(res.status).toBe(409);
  });

  test('téléphone invalide : 400', async () => {
    const res = await api.post('/api/auth/client/register').send({ email: 'tel@entreprise.test', password: 'Motdepasse1', first_name: 'A', last_name: 'B', phone: '12' });
    expect(res.status).toBe(400);
  });

  test('lien de vérification : email confirmé, lien à usage unique', async () => {
    const token = tokenFromEmail(lastEmail());
    const first = await api.post('/api/auth/verify-email').send({ token });
    expect(first.status).toBe(200);
    const [row] = await query('SELECT email_verified FROM clients WHERE email = ?', [email]);
    expect(row.email_verified).toBe(1);
    const again = await api.post('/api/auth/verify-email').send({ token });
    expect(again.status).toBe(400);
  });

  test('renvoi du lien : réponse générique, rien n’est envoyé à un compte déjà vérifié', async () => {
    const before = outbox.length;
    const res = await api.post('/api/auth/resend-verification').send({ email });
    expect(res.status).toBe(200);
    expect(outbox.length).toBe(before);
  });

  test('connexion client', async () => {
    const res = await api.post('/api/auth/client/login').send({ email, password: 'Motdepasse1' });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email });
    expect(res.body.user.password).toBeUndefined();
  });

  test('client désactivé : 401', async () => {
    const res = await api.post('/api/auth/client/login').send({ email: 'inactif@entreprise.test', password: PASSWORD });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  test('admin', async () => {
    const res = await api.get('/api/auth/me').set(auth('admin'));
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: ids.admin, type: 'admin' });
    expect(res.body.user.password).toBeUndefined();
  });

  test('client', async () => {
    const res = await api.get('/api/auth/me').set(auth('client'));
    expect(res.body.user).toMatchObject({ id: ids.client, type: 'client', company_name: 'Entreprise Test' });
  });

  test('sans jeton : 401 ; compte désactivé : 403', async () => {
    expect((await api.get('/api/auth/me')).status).toBe(401);
    expect((await api.get('/api/auth/me').set(auth('inactiveClient'))).status).toBe(403);
  });
});

describe('POST /api/auth/refresh', () => {
  test('jeton de rafraîchissement issu de la connexion → nouveau jeton utilisable', async () => {
    const login = await api.post('/api/auth/client/login').send({ email: 'client@entreprise.test', password: PASSWORD });
    const res = await api.post('/api/auth/refresh').send({ refreshToken: login.body.refreshToken });
    expect(res.status).toBe(200);
    const me = await api.get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`);
    expect(me.status).toBe(200);
  });

  test('jeton invalide : 401', async () => {
    expect((await api.post('/api/auth/refresh').send({ refreshToken: 'nimporte.quoi.ici' })).status).toBe(401);
  });
});

describe('PATCH /api/auth/change-password', () => {
  test('mot de passe actuel faux : 400', async () => {
    const res = await api.patch('/api/auth/change-password').set(auth('otherClient'))
      .send({ current_password: 'faux', new_password: 'Nouveau-mdp-1' });
    expect(res.status).toBe(400);
  });

  test('nouveau mot de passe trop faible : 400', async () => {
    const res = await api.patch('/api/auth/change-password').set(auth('otherClient'))
      .send({ current_password: PASSWORD, new_password: 'faible' });
    expect(res.status).toBe(400);
  });

  test('changement réussi : l’ancien ne marche plus, le nouveau oui', async () => {
    const res = await api.patch('/api/auth/change-password').set(auth('otherClient'))
      .send({ current_password: PASSWORD, new_password: 'Nouveau-mdp-1' });
    expect(res.status).toBe(200);
    expect((await api.post('/api/auth/client/login').send({ email: 'autre@entreprise.test', password: PASSWORD })).status).toBe(401);
    expect((await api.post('/api/auth/client/login').send({ email: 'autre@entreprise.test', password: 'Nouveau-mdp-1' })).status).toBe(200);
  });
});

describe('mot de passe oublié', () => {
  test('email inconnu : même réponse, aucun email', async () => {
    const before = outbox.length;
    const known = await api.post('/api/auth/forgot-password').send({ email: 'client@entreprise.test' });
    await new Promise(r => setTimeout(r, 100));
    const afterKnown = outbox.length;
    const unknown = await api.post('/api/auth/forgot-password').send({ email: 'personne@entreprise.test' });
    await new Promise(r => setTimeout(r, 100));
    expect(known.body).toEqual(unknown.body);
    expect(afterKnown).toBe(before + 1);
    expect(outbox.length).toBe(afterKnown);
  });

  test('lien reçu : la base ne garde que le hachage, le lien change le mot de passe une seule fois', async () => {
    const token = tokenFromEmail(lastEmail());
    const [stored] = await query('SELECT token_hash FROM auth_tokens WHERE type = ? ORDER BY id DESC LIMIT 1', ['password_reset']);
    expect(stored.token_hash).toBe(sha256(token));

    const res = await api.post('/api/auth/reset-password').send({ token, password: 'Reinit-mdp-1' });
    expect(res.status).toBe(200);
    expect((await api.post('/api/auth/client/login').send({ email: 'client@entreprise.test', password: 'Reinit-mdp-1' })).status).toBe(200);
    expect((await api.post('/api/auth/reset-password').send({ token, password: 'Encore-mdp-1' })).status).toBe(400);
  });

  test('admin : lien de réinitialisation pour le back-office', async () => {
    await api.post('/api/auth/forgot-password').send({ email: 'admin@smalim.test', type: 'admin' });
    await new Promise(r => setTimeout(r, 100));
    expect(lastEmail().to).toBe('admin@smalim.test');
  });

  test('jeton inconnu : 400', async () => {
    expect((await api.post('/api/auth/reset-password').send({ token: 'f'.repeat(64), password: 'Reinit-mdp-1' })).status).toBe(400);
  });
});
