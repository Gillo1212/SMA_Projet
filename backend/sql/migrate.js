const path = require('path');
// Chemin absolu : le script doit fonctionner quel que soit le répertoire courant
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const mysql = require('mysql2/promise');

async function migrate() {
  let connection;
  try {
    // Connexion sans sélectionner de base d'abord
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('📦 Exécution du schéma SQL...');

    // Exécution instruction par instruction pour que la migration reste
    // rejouable : les CREATE INDEX déjà appliqués sont ignorés (MySQL ne
    // supporte pas CREATE INDEX IF NOT EXISTS).
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.replace(/^\s*--.*$/gm, '').trim())
      .filter(Boolean);

    let applied = 0;
    let skipped = 0;

    for (const statement of statements) {
      try {
        await connection.query(statement);
        applied++;
      } catch (err) {
        // 1061 = index déjà existant, 1050 = table déjà existante,
        // 1060 = colonne déjà existante (ALTER TABLE … ADD COLUMN rejoué)
        if (err.errno === 1061 || err.errno === 1050 || err.errno === 1060) {
          skipped++;
          continue;
        }
        throw err;
      }
    }

    console.log(`Migration terminée : ${applied} instruction(s) appliquée(s), ${skipped} ignorée(s) (déjà en place).`);
    console.log(` Base de données "${process.env.DB_NAME}" créée et configurée.`);
  } catch (error) {
    console.error(' Erreur de migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
