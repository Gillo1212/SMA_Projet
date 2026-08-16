require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
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
    await connection.query(sql);
    console.log('Migration terminée avec succès !');
    console.log(` Base de données "${process.env.DB_NAME}" créée et configurée.`);
  } catch (error) {
    console.error(' Erreur de migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
