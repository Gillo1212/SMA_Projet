const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, queryOne } = require('../config/database');
const {
  sendWelcomeEmail,
  sendPasswordReset,
  sendEmailVerification,
} = require('../services/email.service');
const adminNotifications = require('../services/adminNotifications.service');

const generateTokens = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
  return { token, refreshToken };
};

// ── Helpers tokens à usage unique ───────────────────────────
const RESET_TTL_MS = 60 * 60 * 1000;             // 1 heure
const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Génère un token aléatoire, en stocke le hash SHA-256 et retourne le token en clair.
 * Les tokens précédents du même type pour cet utilisateur sont invalidés.
 */
async function issueAuthToken({ userId, userType, type, ttlMs }) {
  await query(
    'DELETE FROM auth_tokens WHERE user_id = ? AND user_type = ? AND type = ?',
    [userId, userType, type]
  );

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ttlMs);

  await query(
    'INSERT INTO auth_tokens (user_id, user_type, type, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)',
    [userId, userType, type, hashToken(token), expiresAt]
  );

  return token;
}

/**
 * Retourne la ligne auth_tokens correspondante si le token est valide
 * (existant, non consommé, non expiré), sinon null.
 */
async function consumeAuthToken(token, type) {
  const row = await queryOne(
    'SELECT * FROM auth_tokens WHERE token_hash = ? AND type = ?',
    [hashToken(token), type]
  );
  if (!row) return null;
  if (row.used_at) return null;
  if (new Date(row.expires_at) < new Date()) return null;

  await query('UPDATE auth_tokens SET used_at = NOW() WHERE id = ?', [row.id]);
  return row;
}

// ── Admin Auth ──────────────────────────────────────────────
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await queryOne('SELECT * FROM admins WHERE email = ? AND is_active = 1', [email]);
    if (!admin) return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    await query('UPDATE admins SET last_login = NOW() WHERE id = ?', [admin.id]);

    const { token, refreshToken } = generateTokens({ id: admin.id, email: admin.email, type: 'admin', role: admin.role });

    const { password: _, ...adminData } = admin;
    res.json({ success: true, token, refreshToken, user: adminData });
  } catch (error) { next(error); }
};

exports.adminRegister = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    const existing = await queryOne('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO admins (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashed, first_name, last_name, role || 'admin']
    );

    res.status(201).json({ success: true, message: 'Compte admin créé', id: result.insertId });
  } catch (error) { next(error); }
};

// ── Client Auth ─────────────────────────────────────────────
exports.clientLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const client = await queryOne('SELECT * FROM clients WHERE email = ? AND is_active = 1', [email]);
    if (!client) return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const isValid = await bcrypt.compare(password, client.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    await query('UPDATE clients SET last_login = NOW() WHERE id = ?', [client.id]);

    const { token, refreshToken } = generateTokens({ id: client.id, email: client.email, type: 'client' });

    const { password: _, ...clientData } = client;
    res.json({ success: true, token, refreshToken, user: clientData });
  } catch (error) { next(error); }
};

exports.clientRegister = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, company_name, phone, city } = req.body;
    const existing = await queryOne('SELECT id FROM clients WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO clients (email, password, first_name, last_name, company_name, phone, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashed, first_name, last_name, company_name || null, phone || null, city || null]
    );

    const { token, refreshToken } = generateTokens({ id: result.insertId, email, type: 'client' });

    // Email de confirmation d'adresse (non bloquant).
    // Le mail de bienvenue est envoyé après validation du lien (voir verifyEmail).
    issueAuthToken({
      userId: result.insertId,
      userType: 'client',
      type: 'email_verification',
      ttlMs: VERIFICATION_TTL_MS,
    })
      .then(verificationToken =>
        sendEmailVerification({ email, first_name }, verificationToken)
      )
      .catch(err =>
        console.error('[Email] Vérification non envoyée:', err.message)
      );

    adminNotifications.newClient({ first_name, last_name, email, company_name, phone });
    res.status(201).json({ success: true, message: 'Compte créé avec succès', token, refreshToken });
  } catch (error) { next(error); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token manquant' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, type: decoded.type, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ success: true, token: newToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Refresh token invalide ou expiré' });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    let user = null;
    if (req.user.type === 'admin') {
      user = await queryOne('SELECT id, email, first_name, last_name, role, last_login, created_at FROM admins WHERE id = ?', [req.user.id]);
    } else {
      user = await queryOne('SELECT id, email, first_name, last_name, company_name, phone, address, city, country, last_login, created_at FROM clients WHERE id = ?', [req.user.id]);
    }
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, user: { ...user, type: req.user.type } });
  } catch (error) { next(error); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const table = req.user.type === 'admin' ? 'admins' : 'clients';
    const user = await queryOne(`SELECT password FROM ${table} WHERE id = ?`, [req.user.id]);

    const isValid = await bcrypt.compare(current_password, user.password);
    if (!isValid) return res.status(400).json({ success: false, message: 'Mot de passe actuel incorrect' });

    const hashed = await bcrypt.hash(new_password, 12);
    await query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashed, req.user.id]);
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) { next(error); }
};

// ── Mot de passe oublié / réinitialisation ──────────────────

/**
 * Réponse volontairement identique que le compte existe ou non,
 * pour ne pas permettre d'énumérer les emails enregistrés.
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, type } = req.body;
    const userType = type === 'admin' ? 'admin' : 'client';
    const table = userType === 'admin' ? 'admins' : 'clients';

    const genericResponse = {
      success: true,
      message: 'Si un compte existe pour cet email, un lien de réinitialisation vient d\'être envoyé.',
    };

    const user = await queryOne(
      `SELECT id, email, first_name FROM ${table} WHERE email = ? AND is_active = 1`,
      [email]
    );
    if (!user) return res.json(genericResponse);

    const token = await issueAuthToken({
      userId: user.id,
      userType,
      type: 'password_reset',
      ttlMs: RESET_TTL_MS,
    });

    // Envoi non bloquant : la réponse ne doit pas dépendre du SMTP
    sendPasswordReset(user, token, userType).catch(err =>
      console.error('[Email] Reset mot de passe non envoyé:', err.message)
    );

    res.json(genericResponse);
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const record = await consumeAuthToken(token, 'password_reset');
    if (!record) {
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
    }

    const table = record.user_type === 'admin' ? 'admins' : 'clients';
    const hashed = await bcrypt.hash(password, 12);
    await query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashed, record.user_id]);

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) { next(error); }
};

// ── Vérification d'email ────────────────────────────────────

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const record = await consumeAuthToken(token, 'email_verification');
    if (!record) {
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
    }

    // Seuls les clients portent un flag email_verified
    if (record.user_type !== 'client') {
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
    }

    const client = await queryOne(
      'SELECT id, email, first_name, email_verified FROM clients WHERE id = ?',
      [record.user_id]
    );
    if (!client) {
      return res.status(404).json({ success: false, message: 'Compte introuvable' });
    }

    if (!client.email_verified) {
      await query('UPDATE clients SET email_verified = 1 WHERE id = ?', [client.id]);
      sendWelcomeEmail(client).catch(err =>
        console.error('[Email] Bienvenue non envoyé:', err.message)
      );
    }

    res.json({ success: true, message: 'Adresse email confirmée' });
  } catch (error) { next(error); }
};

/**
 * Renvoie un lien de vérification. Réponse générique comme forgotPassword.
 */
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const genericResponse = {
      success: true,
      message: 'Si un compte non confirmé existe pour cet email, un nouveau lien vient d\'être envoyé.',
    };

    const client = await queryOne(
      'SELECT id, email, first_name, email_verified FROM clients WHERE email = ? AND is_active = 1',
      [email]
    );
    if (!client || client.email_verified) return res.json(genericResponse);

    const token = await issueAuthToken({
      userId: client.id,
      userType: 'client',
      type: 'email_verification',
      ttlMs: VERIFICATION_TTL_MS,
    });

    sendEmailVerification(client, token).catch(err =>
      console.error('[Email] Vérification non envoyée:', err.message)
    );

    res.json(genericResponse);
  } catch (error) { next(error); }
};
