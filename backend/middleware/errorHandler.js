/**
 * Gestionnaire d'erreurs global Express
 */
const errorHandler = (err, req, res, next) => {
  // Pendant les tests d'API, les refus attendus (4xx) ne polluent pas la sortie
  const expected = (err.statusCode && err.statusCode < 500)
    || ['ER_DUP_ENTRY', 'ER_ROW_IS_REFERENCED_2', 'ER_NO_REFERENCED_ROW_2'].includes(err.code);
  if (!(process.env.NODE_ENV === 'test' && expected)) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  // Erreurs de validation express-validator
  if (err.type === 'validation') {
    return res.status(422).json({
      success: false,
      message: 'Données invalides',
      errors: err.errors,
    });
  }

  // Erreurs MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Cette entrée existe déjà (doublon)',
    });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({
      success: false,
      message: 'Suppression impossible : cet élément est encore utilisé (par exemple une machine installée chez un client). Désactivez-le plutôt.',
    });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide - la ressource liée n\'existe pas',
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expiré', code: 'TOKEN_EXPIRED' });
  }

  // Erreur générique
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Erreur interne du serveur'
    : err.message || 'Une erreur est survenue';

  res.status(statusCode).json({ success: false, message });
};

/**
 * Créer une erreur avec statusCode
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = errorHandler;
module.exports.createError = createError;
