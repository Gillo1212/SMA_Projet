/**
 * Application Express (routes, middlewares), sans démarrage du serveur :
 * server.js la lance, les tests d'API l'utilisent directement (supertest).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const machinesRoutes = require('./routes/machines');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const quotesRoutes = require('./routes/quotes');
const clientsRoutes = require('./routes/clients');
const blogRoutes = require('./routes/blog');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const paymentsRoutes = require('./routes/payments');
const settingsRoutes = require('./routes/settings');
const promoCodesRoutes = require('./routes/promoCodes');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');

const app = express();

// ───────────────────────────────────────────
// Middlewares globaux
// ───────────────────────────────────────────
// Les images de /uploads sont affichées par le frontend, servi depuis une autre
// origine (port 5173 en dev) : la politique CORP par défaut (same-origin) les
// ferait bloquer par le navigateur.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
if (process.env.NODE_ENV !== 'test') app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Derrière un relais (serveur Vite, tunnel ngrok, reverse proxy), l'adresse du
// visiteur est dans X-Forwarded-For : sans cela, la limite de débit compterait
// tout le monde comme une seule adresse. Par défaut, seul un relais local est cru.
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion.' },
});

// Désactivés pendant les tests d'API : ils enchaînent des dizaines de connexions
const isTest = process.env.NODE_ENV === 'test';
if (!isTest) app.use('/api/', limiter);
// Limite stricte sur les seules routes qui reçoivent des identifiants ou des
// jetons à deviner. /auth/me est appelé à chaque chargement de page : le
// limiter déconnecterait un utilisateur qui recharge une dizaine de fois.
if (!isTest) app.use([
  '/api/auth/admin/login',
  '/api/auth/client/login',
  '/api/auth/client/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
], authLimiter);

// Formulaires publics (contact, newsletter) : limite anti-spam par adresse IP
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Trop d’envois depuis cette connexion. Réessayez dans quelques minutes.' },
});
if (!isTest) app.use(['/api/contact', '/api/newsletter/subscribe'], (req, res, next) =>
  (req.method === 'POST' ? publicFormLimiter(req, res, next) : next()));

// Body parsers
// `verify` conserve les octets reçus : la signature des webhooks de paiement
// se calcule sur le corps brut, pas sur le JSON re-sérialisé.
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Fichiers statiques (uploads)
// Même dossier que middleware/upload.js (UPLOAD_DIR)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// ───────────────────────────────────────────
// Routes API
// ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/promo-codes', promoCodesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMALIM API opérationnelle', timestamp: new Date() });
});

// 404 pour routes inconnues
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

module.exports = app;
