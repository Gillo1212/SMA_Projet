/**
 * Comptes du back-office (table admins)
 * ─────────────────────────────────────
 * Lecture : tout admin. Écriture : super_admin uniquement (voir routes/settings).
 * Garde-fous : on ne peut ni se désactiver, ni se supprimer, ni changer son
 * propre rôle, et il reste toujours au moins un super_admin actif.
 */
const bcrypt = require('bcryptjs');
const { query, queryOne } = require('../config/database');

const PUBLIC_FIELDS = 'id, email, first_name, last_name, role, is_active, last_login, created_at';

async function activeSuperAdmins(excludeId) {
  const [row] = await query(
    "SELECT COUNT(*) AS n FROM admins WHERE role = 'super_admin' AND is_active = 1 AND id <> ?",
    [excludeId]
  );
  return Number(row.n);
}

/** Refuse une action qui ferait disparaître le dernier super_admin actif */
async function wouldLoseLastSuperAdmin(target) {
  return target.role === 'super_admin' && target.is_active && (await activeSuperAdmins(target.id)) === 0;
}

exports.getAll = async (req, res, next) => {
  try {
    const admins = await query(`SELECT ${PUBLIC_FIELDS} FROM admins ORDER BY created_at ASC`);
    res.json({ success: true, admins });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    if (await queryOne('SELECT id FROM admins WHERE email = ?', [email])) {
      return res.status(409).json({ success: false, message: 'Cet email est déjà utilisé' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO admins (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashed, first_name.trim(), last_name.trim(), role || 'admin']
    );
    const admin = await queryOne(`SELECT ${PUBLIC_FIELDS} FROM admins WHERE id = ?`, [result.insertId]);
    res.status(201).json({ success: true, message: 'Administrateur créé', admin });
  } catch (error) { next(error); }
};

/** PUT /settings/admins/:id — nom et rôle */
exports.update = async (req, res, next) => {
  try {
    const target = await queryOne('SELECT * FROM admins WHERE id = ?', [req.params.id]);
    if (!target) return res.status(404).json({ success: false, message: 'Administrateur introuvable' });

    const { first_name, last_name, role } = req.body;
    if (role && role !== target.role) {
      if (target.id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Vous ne pouvez pas modifier votre propre rôle' });
      }
      if (role !== 'super_admin' && (await wouldLoseLastSuperAdmin(target))) {
        return res.status(400).json({ success: false, message: 'Il doit rester au moins un super administrateur actif' });
      }
    }
    await query(
      'UPDATE admins SET first_name = ?, last_name = ?, role = ? WHERE id = ?',
      [first_name?.trim() || target.first_name, last_name?.trim() || target.last_name, role || target.role, target.id]
    );
    const admin = await queryOne(`SELECT ${PUBLIC_FIELDS} FROM admins WHERE id = ?`, [target.id]);
    res.json({ success: true, message: 'Administrateur mis à jour', admin });
  } catch (error) { next(error); }
};

/** PATCH /settings/admins/:id/toggle — active ou désactive le compte */
exports.toggle = async (req, res, next) => {
  try {
    const target = await queryOne('SELECT * FROM admins WHERE id = ?', [req.params.id]);
    if (!target) return res.status(404).json({ success: false, message: 'Administrateur introuvable' });
    if (target.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas désactiver votre propre compte' });
    }
    if (await wouldLoseLastSuperAdmin(target)) {
      return res.status(400).json({ success: false, message: 'Il doit rester au moins un super administrateur actif' });
    }
    const is_active = target.is_active ? 0 : 1;
    await query('UPDATE admins SET is_active = ? WHERE id = ?', [is_active, target.id]);
    res.json({ success: true, is_active });
  } catch (error) { next(error); }
};

/**
 * DELETE /settings/admins/:id
 * Un admin auteur d'articles de blog reste référencé (clé étrangère) :
 * il est désactivé plutôt que supprimé.
 */
exports.remove = async (req, res, next) => {
  try {
    const target = await queryOne('SELECT * FROM admins WHERE id = ?', [req.params.id]);
    if (!target) return res.status(404).json({ success: false, message: 'Administrateur introuvable' });
    if (target.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    if (await wouldLoseLastSuperAdmin(target)) {
      return res.status(400).json({ success: false, message: 'Il doit rester au moins un super administrateur actif' });
    }
    const [{ n }] = await query('SELECT COUNT(*) AS n FROM blog_articles WHERE author_id = ?', [target.id]);
    if (Number(n) > 0) {
      await query('UPDATE admins SET is_active = 0 WHERE id = ?', [target.id]);
      return res.json({ success: true, deactivated: true, message: 'Auteur d\'articles : compte désactivé plutôt que supprimé' });
    }
    await query('DELETE FROM admins WHERE id = ?', [target.id]);
    res.json({ success: true, message: 'Administrateur supprimé' });
  } catch (error) { next(error); }
};
