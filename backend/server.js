require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { logEmailConfig } = require('./services/email.service');
const { logPaymentConfig } = require('./services/payment');

const PORT = process.env.PORT || 5000;

// ───────────────────────────────────────────
// Démarrage du serveur
// ───────────────────────────────────────────
async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`\nSMALIM Backend démarré sur http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Base de données: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
      logPaymentConfig();
      logEmailConfig().then(() => console.log(''));
    });
  } catch (error) {
    console.error(' Impossible de démarrer le serveur:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
