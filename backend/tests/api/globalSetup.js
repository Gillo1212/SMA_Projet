/**
 * Crée la base de test à neuf (DROP + CREATE) à partir de sql/schema.sql,
 * une fois avant tous les tests d'API.
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

module.exports = async function globalSetup() {
  const { TEST_DB_NAME } = require('./env');
  const db = TEST_DB_NAME;
  if (!/^[a-z0-9_]+_test$/.test(db)) throw new Error(`Nom de base de test invalide : ${db}`);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${db}\``);
    await connection.query(`CREATE DATABASE \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${db}\``);

    // Même découpage que sql/migrate.js ; la base du schéma est remplacée
    const schema = fs.readFileSync(path.join(__dirname, '..', '..', 'sql', 'schema.sql'), 'utf8')
      .replace(/\bsmalim_db\b/g, db);
    const statements = schema
      .split(/;\s*$/m)
      .map(s => s.replace(/^\s*--.*$/gm, '').trim())
      .filter(Boolean)
      .filter(s => !/^(CREATE DATABASE|USE)\b/i.test(s));

    for (const statement of statements) await connection.query(statement);
  } finally {
    await connection.end();
  }

  fs.rmSync(path.join(__dirname, '..', '.tmp-uploads'), { recursive: true, force: true });
};
