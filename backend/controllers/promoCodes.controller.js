const { query, queryOne } = require('../config/database');

const FIELDS = ['code', 'type', 'value', 'min_order_amount', 'max_uses', 'expires_at', 'is_active'];

/** Ne garde que les champs connus, avec null pour « pas de limite » */
function pick(body) {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] === undefined) continue;
    if (f === 'is_active') out[f] = body[f] === true || body[f] === 'true' || body[f] === 1 ? 1 : 0;
    else if (f === 'expires_at') out[f] = body[f] ? new Date(body[f]) : null;
    else out[f] = body[f] === '' ? null : body[f];
  }
  return out;
}

/** GET /api/promo-codes */
exports.getAll = async (req, res, next) => {
  try {
    const promoCodes = await query('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json({ success: true, data: promoCodes });
  } catch (error) { next(error); }
};

/** POST /api/promo-codes */
exports.create = async (req, res, next) => {
  try {
    const data = pick(req.body);
    const cols = Object.keys(data);
    const result = await query(
      `INSERT INTO promo_codes (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
      Object.values(data)
    );
    const promo = await queryOne('SELECT * FROM promo_codes WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Code promo créé', data: promo });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Ce code promo existe déjà' });
    }
    next(error);
  }
};

/** PATCH /api/promo-codes/:id — mise à jour partielle (dont activation) */
exports.update = async (req, res, next) => {
  try {
    const existing = await queryOne('SELECT * FROM promo_codes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Code promo introuvable' });

    const data = pick(req.body);
    // Le type peut changer sans la valeur, ou l'inverse : on vérifie le résultat
    const type = data.type ?? existing.type;
    const value = Number(data.value ?? existing.value);
    if (type === 'percentage' && value > 100) {
      return res.status(400).json({ success: false, message: 'Un pourcentage ne peut pas dépasser 100' });
    }

    const cols = Object.keys(data);
    if (cols.length) {
      await query(
        `UPDATE promo_codes SET ${cols.map(c => `${c} = ?`).join(', ')} WHERE id = ?`,
        [...Object.values(data), req.params.id]
      );
    }
    const promo = await queryOne('SELECT * FROM promo_codes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Code promo mis à jour', data: promo });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Ce code promo existe déjà' });
    }
    next(error);
  }
};

/**
 * DELETE /api/promo-codes/:id
 * Un code déjà utilisé reste référencé par ses commandes (orders.promo_code) :
 * on le désactive plutôt que de le supprimer, pour garder l'historique lisible.
 */
exports.remove = async (req, res, next) => {
  try {
    const existing = await queryOne('SELECT * FROM promo_codes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Code promo introuvable' });

    if (existing.uses_count > 0) {
      await query('UPDATE promo_codes SET is_active = 0 WHERE id = ?', [req.params.id]);
      return res.json({ success: true, message: 'Code déjà utilisé : désactivé plutôt que supprimé', deactivated: true });
    }
    await query('DELETE FROM promo_codes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Code promo supprimé' });
  } catch (error) { next(error); }
};
