require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { testConnection } = require('./config/database');
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

const app = express();
const PORT = process.env.PORT || 5000;

// ───────────────────────────────────────────
// Middlewares globaux
// ───────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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

app.use('/api/', limiter);
// Limite stricte sur les seules routes qui reçoivent des identifiants ou des
// jetons à deviner. /auth/me est appelé à chaque chargement de page : le
// limiter déconnecterait un utilisateur qui recharge une dizaine de fois.
app.use([
  '/api/auth/admin/login',
  '/api/auth/client/login',
  '/api/auth/client/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
], authLimiter);

// Body parsers
// `verify` conserve les octets reçus : la signature des webhooks de paiement
// se calcule sur le corps brut, pas sur le JSON re-sérialisé.
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// ───────────────────────────────────────────
// Démarrage du serveur
// ───────────────────────────────────────────
async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\nSMALIM Backend démarré sur http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Base de données: ${process.env.DB_NAME}@${process.env.DB_HOST}\n`);
    });
  } catch (error) {
    console.error(' Impossible de démarrer le serveur:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
