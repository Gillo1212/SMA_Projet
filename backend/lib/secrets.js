/**
 * Chiffrement des secrets stockés en base (ex. mot de passe SMTP)
 * ────────────────────────────────────────────────────────────────
 * AES-256-GCM, clé dérivée de SETTINGS_SECRET (ou, à défaut, de JWT_SECRET).
 * Format stocké : « v1:<iv>:<tag>:<données> » en base64.
 *
 * Changer la clé rend les secrets existants illisibles : il faut alors les
 * ressaisir depuis le back-office.
 */
const crypto = require('crypto');

const PREFIX = 'v1';

function key() {
  const source = process.env.SETTINGS_SECRET || process.env.JWT_SECRET;
  if (!source) throw new Error('SETTINGS_SECRET (ou JWT_SECRET) doit être défini pour chiffrer les secrets');
  return crypto.createHash('sha256').update(source).digest();
}

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return [PREFIX, iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':');
}

/** Renvoie null si la valeur est vide ou illisible (clé changée, valeur corrompue) */
function decrypt(stored) {
  if (!stored) return null;
  const [prefix, iv, tag, data] = String(stored).split(':');
  if (prefix !== PREFIX || !iv || !tag || !data) return null;
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

module.exports = { encrypt, decrypt };
