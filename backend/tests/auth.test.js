/**
 * Authentification : connexion, jeton de rafraîchissement, réinitialisation
 * du mot de passe et middleware `authenticate`.
 */
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

jest.mock('../config/database', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));
jest.mock('../services/email.service', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(),
  sendPasswordReset: jest.fn().mockResolvedValue(),
  sendEmailVerification: jest.fn().mockResolvedValue(),
}));
jest.mock('../services/adminNotifications.service', () => ({ newClient: jest.fn() }));

const db = require('../config/database');
const { sendPasswordReset } = require('../services/email.service');
const auth = require('../controllers/auth.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { mockReq, mockRes, mockNext } = require('./helpers/http');

const PASSWORD = 'Motdepasse-test-1';
let passwordHash;

beforeAll(async () => {
  process.env.JWT_SECRET = 'jwt_test_secret';
  process.env.JWT_REFRESH_SECRET = 'jwt_refresh_test_secret';
  // Coût réduit : le test vérifie la logique, pas la robustesse du hachage
  passwordHash = await bcrypt.hash(PASSWORD, 4);
});

const admin = () => ({ id: 1, email: 'admin@example.test', password: passwordHash, role: 'super_admin', first_name: 'Ada', is_active: 1 });
const client = () => ({ id: 7, email: 'client@example.test', password: passwordHash, first_name: 'Awa', is_active: 1 });

describe('connexion', () => {
  test.each([
    ['admin', 'adminLogin', admin],
    ['client', 'clientLogin', client],
  ])('%s : bons identifiants → jetons, sans le hachage du mot de passe', async (type, action, user) => {
    db.queryOne.mockResolvedValue(user());
    db.query.mockResolvedValue([]);
    const res = mockRes();

    await auth[action](mockReq({ body: { email: user().email, password: PASSWORD } }), res, mockNext());

    expect(res.statusCode).toBe(200);
    expect(res.body.user.password).toBeUndefined();
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ id: user().id, type });
    expect(jwt.verify(res.body.refreshToken, process.env.JWT_REFRESH_SECRET).id).toBe(user().id);
  });

  test('mauvais mot de passe et email inconnu : même réponse (pas d’énumération des comptes)', async () => {
    db.queryOne.mockResolvedValueOnce(client());
    const wrongPassword = mockRes();
    await auth.clientLogin(mockReq({ body: { email: 'client@example.test', password: 'faux' } }), wrongPassword, mockNext());

    db.queryOne.mockResolvedValueOnce(null);
    const unknownEmail = mockRes();
    await auth.clientLogin(mockReq({ body: { email: 'personne@example.test', password: PASSWORD } }), unknownEmail, mockNext());

    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownEmail.statusCode).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  test('compte désactivé : la requête ne cherche que les comptes actifs', async () => {
    db.queryOne.mockResolvedValue(null);
    await auth.adminLogin(mockReq({ body: { email: 'admin@example.test', password: PASSWORD } }), mockRes(), mockNext());
    expect(db.queryOne.mock.calls[0][0]).toMatch(/is_active = 1/);
  });

  test('compatible avec les anciens hachages bcryptjs ($2a$)', async () => {
    const legacy = await bcrypt.hash(PASSWORD, 4);
    db.queryOne.mockResolvedValue({ ...client(), password: legacy.replace(/^\$2b\$/, '$2a$') });
    db.query.mockResolvedValue([]);
    const res = mockRes();

    await auth.clientLogin(mockReq({ body: { email: 'client@example.test', password: PASSWORD } }), res, mockNext());

    expect(res.statusCode).toBe(200);
  });
});

describe('jeton de rafraîchissement', () => {
  test('valide → nouveau jeton d’accès', async () => {
    const refreshToken = jwt.sign({ id: 7, email: 'client@example.test', type: 'client' }, process.env.JWT_REFRESH_SECRET);
    const res = mockRes();

    await auth.refreshToken(mockReq({ body: { refreshToken } }), res, mockNext());

    expect(res.statusCode).toBe(200);
    expect(jwt.verify(res.body.token, process.env.JWT_SECRET)).toMatchObject({ id: 7, type: 'client' });
  });

  test('un jeton d’accès ne sert pas de jeton de rafraîchissement', async () => {
    const accessToken = jwt.sign({ id: 7, type: 'client' }, process.env.JWT_SECRET);
    const res = mockRes();

    await auth.refreshToken(mockReq({ body: { refreshToken: accessToken } }), res, mockNext());

    expect(res.statusCode).toBe(401);
  });

  test('expiré → 401', async () => {
    const expired = jwt.sign({ id: 7, type: 'client' }, process.env.JWT_REFRESH_SECRET, { expiresIn: -10 });
    const res = mockRes();
    await auth.refreshToken(mockReq({ body: { refreshToken: expired } }), res, mockNext());
    expect(res.statusCode).toBe(401);
  });

  test('absent → 400', async () => {
    const res = mockRes();
    await auth.refreshToken(mockReq({ body: {} }), res, mockNext());
    expect(res.statusCode).toBe(400);
  });
});

describe('mot de passe oublié / réinitialisation', () => {
  const sha256 = (t) => crypto.createHash('sha256').update(t).digest('hex');

  test('email inconnu : réponse identique, aucun email envoyé', async () => {
    db.queryOne.mockResolvedValueOnce(client());
    db.query.mockResolvedValue([]);
    const known = mockRes();
    await auth.forgotPassword(mockReq({ body: { email: 'client@example.test' } }), known, mockNext());

    db.queryOne.mockResolvedValueOnce(null);
    const unknown = mockRes();
    await auth.forgotPassword(mockReq({ body: { email: 'personne@example.test' } }), unknown, mockNext());

    expect(known.body).toEqual(unknown.body);
    expect(sendPasswordReset).toHaveBeenCalledTimes(1);
  });

  test('le lien envoyé contient le jeton, la base n’en garde que le hachage', async () => {
    db.queryOne.mockResolvedValueOnce(client());
    db.query.mockResolvedValue([]);

    await auth.forgotPassword(mockReq({ body: { email: 'client@example.test' } }), mockRes(), mockNext());

    const sentToken = sendPasswordReset.mock.calls[0][1];
    const insert = db.query.mock.calls.find(([sql]) => /INSERT INTO auth_tokens/.test(sql));
    expect(insert[1]).toContain(sha256(sentToken));
    expect(insert[1]).not.toContain(sentToken);
    // Les anciens liens du même compte sont invalidés
    expect(db.query.mock.calls.some(([sql]) => /DELETE FROM auth_tokens/.test(sql))).toBe(true);
  });

  const tokenRow = (overrides = {}) => ({
    id: 3, user_id: 7, user_type: 'client', type: 'password_reset',
    used_at: null, expires_at: new Date(Date.now() + 60_000), ...overrides,
  });

  test('jeton valide : mot de passe changé et jeton consommé', async () => {
    db.queryOne.mockResolvedValue(tokenRow());
    db.query.mockResolvedValue([]);
    const res = mockRes();

    await auth.resetPassword(mockReq({ body: { token: 'abc', password: 'Nouveau-mdp-2' } }), res, mockNext());

    expect(res.statusCode).toBe(200);
    expect(db.queryOne.mock.calls[0][1][0]).toBe(sha256('abc'));
    const sqls = db.query.mock.calls.map(([sql]) => sql);
    expect(sqls.some(sql => /UPDATE auth_tokens SET used_at/.test(sql))).toBe(true);
    const update = db.query.mock.calls.find(([sql]) => /UPDATE clients SET password/.test(sql));
    expect(await bcrypt.compare('Nouveau-mdp-2', update[1][0])).toBe(true);
  });

  test.each([
    ['déjà utilisé', { used_at: new Date() }],
    ['expiré', { expires_at: new Date(Date.now() - 1000) }],
  ])('jeton %s : refusé', async (_label, overrides) => {
    db.queryOne.mockResolvedValue(tokenRow(overrides));
    db.query.mockResolvedValue([]);
    const res = mockRes();

    await auth.resetPassword(mockReq({ body: { token: 'abc', password: 'Nouveau-mdp-2' } }), res, mockNext());

    expect(res.statusCode).toBe(400);
    expect(db.query.mock.calls.some(([sql]) => /SET password/.test(sql))).toBe(false);
  });

  test('jeton inconnu : refusé', async () => {
    db.queryOne.mockResolvedValue(null);
    const res = mockRes();
    await auth.resetPassword(mockReq({ body: { token: 'inconnu', password: 'x' } }), res, mockNext());
    expect(res.statusCode).toBe(400);
  });
});

describe('middleware authenticate', () => {
  const bearer = (payload, secret = process.env.JWT_SECRET, options) =>
    ({ authorization: `Bearer ${jwt.sign(payload, secret, options)}` });

  test('jeton valide : req.user renseigné', async () => {
    db.queryOne.mockResolvedValue({ id: 7, email: 'client@example.test', is_active: 1 });
    const req = mockReq({ headers: bearer({ id: 7, type: 'client' }) });
    const next = mockNext();

    await authenticate(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: 7, type: 'client' });
  });

  test('sans en-tête : 401', async () => {
    const res = mockRes();
    await authenticate(mockReq(), res, mockNext());
    expect(res.statusCode).toBe(401);
  });

  test('signé avec un autre secret : 401', async () => {
    const res = mockRes();
    await authenticate(mockReq({ headers: bearer({ id: 1, type: 'admin' }, 'autre_secret') }), res, mockNext());
    expect(res.statusCode).toBe(401);
  });

  test('expiré : 401 avec le code TOKEN_EXPIRED', async () => {
    const res = mockRes();
    await authenticate(mockReq({ headers: bearer({ id: 7, type: 'client' }, undefined, { expiresIn: -10 }) }), res, mockNext());
    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });

  test('compte désactivé depuis l’émission du jeton : 403', async () => {
    db.queryOne.mockResolvedValue({ id: 7, is_active: 0 });
    const res = mockRes();
    await authenticate(mockReq({ headers: bearer({ id: 7, type: 'client' }) }), res, mockNext());
    expect(res.statusCode).toBe(403);
  });

  test('compte supprimé : 401', async () => {
    db.queryOne.mockResolvedValue(null);
    const res = mockRes();
    await authenticate(mockReq({ headers: bearer({ id: 7, type: 'client' }) }), res, mockNext());
    expect(res.statusCode).toBe(401);
  });

  test('requireAdmin refuse un client', () => {
    const res = mockRes();
    const next = mockNext();
    requireAdmin(mockReq({ user: { id: 7, type: 'client' } }), res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
