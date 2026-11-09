/**
 * Environnement des tests d'API — chargé avant tout module (setupFiles) et
 * par globalSetup.
 *
 * Les valeurs posées ici gagnent sur le .env (dotenv ne remplace jamais une
 * variable déjà définie) : base de test dédiée, aucun prestataire de paiement
 * réel, aucun email envoyé (transport en mémoire, voir email.service).
 */
const path = require('path');

const TEST_DB_NAME = process.env.TEST_DB_NAME || 'smalim_test';

const overrides = {
  NODE_ENV: 'test',
  DB_NAME: TEST_DB_NAME,
  JWT_SECRET: 'test_jwt_secret',
  JWT_REFRESH_SECRET: 'test_jwt_refresh_secret',
  JWT_EXPIRES_IN: '1h',
  JWT_REFRESH_EXPIRES_IN: '1d',
  // Paiements : simulateur uniquement, jamais les API réelles
  WAVE_API_KEY: '',
  WAVE_WEBHOOK_SECRET: '',
  WAVE_API_SIGNING_SECRET: '',
  ORANGE_MONEY_CLIENT_ID: '',
  ORANGE_MONEY_CLIENT_SECRET: '',
  ORANGE_MONEY_MERCHANT_KEY: '',
  // Emails : transport en mémoire ; destinataires réels visibles dans les tests
  EMAIL_PROVIDER: 'smtp',
  SMTP_HOST: 'smtp.test.invalid',
  SMTP_USER: 'test@smalim.test',
  SMTP_PASS: 'test',
  EMAIL_FROM: 'test@smalim.test',
  EMAIL_REDIRECT_TO: '',
  // Images envoyées pendant les tests : dossier jetable
  UPLOAD_DIR: path.join('tests', '.tmp-uploads'),
  FRONTEND_URL: 'http://frontend.test',
  BACKEND_URL: 'http://backend.test',
};

Object.assign(process.env, overrides);

// Identifiants MySQL (hôte, utilisateur, mot de passe) : ceux du .env
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

if (!/_test$/.test(process.env.DB_NAME)) {
  throw new Error(`Tests d'API refusés : la base « ${process.env.DB_NAME} » ne se termine pas par _test.`);
}

module.exports = { TEST_DB_NAME };
