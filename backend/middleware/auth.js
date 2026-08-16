const jwt = require('jsonwebtoken');
const { queryOne } = require('../config/database');

/**
 * Middleware d'authentification - vérifie le token JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token d\'authentification manquant' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier que l'utilisateur existe toujours en DB
    let user = null;
    if (decoded.type === 'admin') {
      user = await queryOne('SELECT id, email, role, is_active FROM admins WHERE id = ?', [decoded.id]);
    } else {
      user = await queryOne('SELECT id, email, company_name, is_active FROM clients WHERE id = ?', [decoded.id]);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Compte désactivé' });
    }

    req.user = { ...user, type: decoded.type };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expiré', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

/**
 * Middleware - réservé aux admins
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.type !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
  }
  next();
};

/**
 * Middleware - réservé aux super admins
 */
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.type !== 'admin' || req.user?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux super administrateurs' });
  }
  next();
};

/**
 * Middleware - clients uniquement
 */
const requireClient = (req, res, next) => {
  if (req.user?.type !== 'client') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux clients' });
  }
  next();
};

/**
 * Middleware optionnel - authentifie si token présent, sinon continue.
 * Recharge toujours l'utilisateur depuis la DB pour valider is_active.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = null;
      if (decoded.type === 'admin') {
        user = await queryOne('SELECT id, email, role, is_active FROM admins WHERE id = ?', [decoded.id]);
      } else {
        user = await queryOne('SELECT id, email, company_name, is_active FROM clients WHERE id = ?', [decoded.id]);
      }

      // Ne pas attacher l'utilisateur s'il est introuvable ou désactivé
      if (user && user.is_active) {
        req.user = { ...user, type: decoded.type };
      }
    }
  } catch {
    // Ignore les erreurs - l'auth est optionnelle ici
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireSuperAdmin, requireClient, optionalAuth };
