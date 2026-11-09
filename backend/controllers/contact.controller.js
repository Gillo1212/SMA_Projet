/**
 * Messages du formulaire de contact
 * ─────────────────────────────────
 * POST /api/contact (public) enregistre le message, prévient l'équipe et
 * accuse réception au visiteur. Le back-office les liste, les marque (lu,
 * répondu, archivé) et y ajoute une note interne.
 */
const { query, queryOne } = require('../config/database');
const { sendContactAcknowledgment } = require('../services/email.service');
const adminNotifications = require('../services/adminNotifications.service');

const STATUSES = ['new', 'read', 'replied', 'archived'];

/** POST /api/contact */
exports.create = async (req, res, next) => {
  try {
    // Champ piège invisible pour un humain : un robot le remplit. On répond
    // comme si tout allait bien, sans rien enregistrer ni envoyer.
    if (req.body.website) {
      return res.status(201).json({ success: true, message: 'Message envoyé' });
    }

    const { name, email, phone, subject, message } = req.body;
    const result = await query(
      `INSERT INTO contact_messages (name, email, phone, subject, message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject || null, message, req.ip || null]
    );
    const saved = await queryOne('SELECT * FROM contact_messages WHERE id = ?', [result.insertId]);

    // Emails non bloquants : le message est enregistré quoi qu'il arrive
    adminNotifications.newContactMessage(saved);
    sendContactAcknowledgment(saved).catch(err =>
      console.error('[Email] Accusé de réception contact non envoyé :', err.message)
    );

    res.status(201).json({ success: true, message: 'Message envoyé', data: { id: saved.id } });
  } catch (error) { next(error); }
};

/** GET /api/contact?status=&search=&page=&limit= (back-office) */
exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const where = [];
    const params = [];

    if (STATUSES.includes(req.query.status)) {
      where.push('m.status = ?'); params.push(req.query.status);
    } else if (req.query.status !== 'all') {
      // Par défaut, les archivés sont masqués
      where.push("m.status <> 'archived'");
    }
    if (req.query.search) {
      const like = `%${req.query.search}%`;
      where.push('(m.name LIKE ? OR m.email LIKE ? OR m.subject LIKE ? OR m.message LIKE ?)');
      params.push(like, like, like, like);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [messages, [{ total }], counts] = await Promise.all([
      query(
        `SELECT m.*, CONCAT(a.first_name, ' ', a.last_name) AS handled_by_name
         FROM contact_messages m
         LEFT JOIN admins a ON a.id = m.handled_by
         ${whereClause}
         ORDER BY m.created_at DESC, m.id DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]
      ),
      query(`SELECT COUNT(*) AS total FROM contact_messages m ${whereClause}`, params),
      query('SELECT status, COUNT(*) AS n FROM contact_messages GROUP BY status'),
    ]);

    res.json({
      success: true,
      data: messages,
      counts: Object.fromEntries(STATUSES.map(s => [s, Number(counts.find(c => c.status === s)?.n ?? 0)])),
      pagination: { page, limit, total: Number(total) },
    });
  } catch (error) { next(error); }
};

/** PATCH /api/contact/:id { status?, admin_note? } (back-office) */
exports.update = async (req, res, next) => {
  try {
    const existing = await queryOne('SELECT * FROM contact_messages WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Message introuvable' });

    const status = req.body.status ?? existing.status;
    const note = req.body.admin_note !== undefined ? (req.body.admin_note || null) : existing.admin_note;
    // Qui a traité le message et quand : à chaque changement de statut
    const statusChanged = status !== existing.status;

    await query(
      `UPDATE contact_messages
       SET status = ?, admin_note = ?,
           handled_by = IF(?, ?, handled_by),
           handled_at = IF(?, NOW(), handled_at)
       WHERE id = ?`,
      [status, note, statusChanged, req.user.id, statusChanged, existing.id]
    );
    const updated = await queryOne(
      `SELECT m.*, CONCAT(a.first_name, ' ', a.last_name) AS handled_by_name
       FROM contact_messages m LEFT JOIN admins a ON a.id = m.handled_by WHERE m.id = ?`,
      [existing.id]
    );
    res.json({ success: true, message: 'Message mis à jour', data: updated });
  } catch (error) { next(error); }
};

/** DELETE /api/contact/:id (administrateurs) */
exports.delete = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Message introuvable' });
    res.json({ success: true, message: 'Message supprimé' });
  } catch (error) { next(error); }
};
