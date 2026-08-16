const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../config/database');
const { sendWelcomeEmail } = require('../services/email.service');

const generateTokens = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
  return { token, refreshToken };
};

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

    // Email de bienvenue (non bloquant)
    sendWelcomeEmail({ email, first_name }).catch(err =>
      console.error('[Email] Bienvenue non envoyé:', err.message)
    );

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
