/**
 * Newsletter
 * ──────────
 * Inscription depuis le pied de page du site, désinscription par lien unique
 * (présent dans l'email de bienvenue), liste et export CSV dans le back-office.
 * L'envoi des campagnes se fait dans un outil dédié (Brevo, Mailchimp…) à
 * partir de l'export : un SMTP classique limite le nombre d'envois par jour.
 */
const crypto = require('crypto');
const { query, queryOne } = require('../config/database');
const { sendNewsletterWelcome } = require('../services/email.service');

const newToken = () => crypto.randomBytes(32).toString('hex');

/** Même réponse que l'adresse soit nouvelle ou déjà inscrite (pas d'énumération) */
const SUBSCRIBED = { success: true, message: 'Inscription enregistrée' };

/** POST /api/newsletter/subscribe { email, source?, locale? } (public) */
exports.subscribe = async (req, res, next) => {
  try {
    if (req.body.website) return res.status(201).json(SUBSCRIBED); // champ piège anti-robot

    const email = req.body.email;
    const source = req.body.source || 'footer';
    const locale = req.body.locale === 'en' ? 'en' : 'fr';
    const existing = await queryOne('SELECT * FROM newsletter_subscribers WHERE email = ?', [email]);

    if (existing?.status === 'subscribed') return res.status(200).json(SUBSCRIBED);

    let subscriber;
    if (existing) {
      // Réinscription après désinscription : nouveau lien de désinscription
      await query(
        `UPDATE newsletter_subscribers
         SET status = 'subscribed', source = ?, locale = ?, unsubscribe_token = ?, subscribed_at = NOW(), unsubscribed_at = NULL
         WHERE id = ?`,
        [source, locale, newToken(), existing.id]
      );
      subscriber = await queryOne('SELECT * FROM newsletter_subscribers WHERE id = ?', [existing.id]);
    } else {
      const result = await query(
        'INSERT INTO newsletter_subscribers (email, source, locale, unsubscribe_token) VALUES (?, ?, ?, ?)',
        [email, source, locale, newToken()]
      );
      subscriber = await queryOne('SELECT * FROM newsletter_subscribers WHERE id = ?', [result.insertId]);
    }

    sendNewsletterWelcome(subscriber).catch(err =>
      console.error('[Email] Bienvenue newsletter non envoyé :', err.message)
    );
    res.status(201).json(SUBSCRIBED);
  } catch (error) {
    // Deux inscriptions simultanées de la même adresse
    if (error.code === 'ER_DUP_ENTRY') return res.status(200).json(SUBSCRIBED);
    next(error);
  }
};

/** POST /api/newsletter/unsubscribe { token } (public, lien de l'email) */
exports.unsubscribe = async (req, res, next) => {
  try {
    const subscriber = await queryOne('SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = ?', [req.body.token]);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Lien de désinscription invalide ou déjà utilisé' });
    }
    if (subscriber.status !== 'unsubscribed') {
      await query(
        "UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW() WHERE id = ?",
        [subscriber.id]
      );
    }
    res.json({ success: true, message: 'Désinscription confirmée', data: { email: subscriber.email } });
  } catch (error) { next(error); }
};

function listFilters(q) {
  const where = [];
  const params = [];
  if (['subscribed', 'unsubscribed'].includes(q.status)) { where.push('status = ?'); params.push(q.status); }
  if (q.search) { where.push('email LIKE ?'); params.push(`%${q.search}%`); }
  return { whereClause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
}

/** GET /api/newsletter?status=&search=&page=&limit= (back-office) */
exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100));
    const { whereClause, params } = listFilters(req.query);

    const [subscribers, [{ total }], counts] = await Promise.all([
      query(
        `SELECT id, email, status, source, locale, subscribed_at, unsubscribed_at
         FROM newsletter_subscribers ${whereClause}
         ORDER BY subscribed_at DESC, id DESC LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]
      ),
      query(`SELECT COUNT(*) AS total FROM newsletter_subscribers ${whereClause}`, params),
      query('SELECT status, COUNT(*) AS n FROM newsletter_subscribers GROUP BY status'),
    ]);

    res.json({
      success: true,
      data: subscribers,
      counts: {
        subscribed: Number(counts.find(c => c.status === 'subscribed')?.n ?? 0),
        unsubscribed: Number(counts.find(c => c.status === 'unsubscribed')?.n ?? 0),
      },
      pagination: { page, limit, total: Number(total) },
    });
  } catch (error) { next(error); }
};

/** GET /api/newsletter/export?status=subscribed (back-office) : fichier CSV */
exports.exportCsv = async (req, res, next) => {
  try {
    const { whereClause, params } = listFilters({ status: req.query.status ?? 'subscribed', search: req.query.search });
    const rows = await query(
      `SELECT email, status, source, locale, subscribed_at, unsubscribed_at
       FROM newsletter_subscribers ${whereClause} ORDER BY subscribed_at`,
      params
    );
    const iso = d => (d ? new Date(d).toISOString() : '');
    // Guillemets doublés ; une cellule commençant par = + - @ est neutralisée
    // pour qu'un tableur ne l'exécute pas comme une formule
    const cell = v => {
      const s = String(v ?? '');
      return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
    };
    const lines = [
      ['email', 'statut', 'source', 'langue', 'inscrit_le', 'desinscrit_le'],
      ...rows.map(r => [r.email, r.status === 'subscribed' ? 'inscrit' : 'désinscrit', r.source, r.locale, iso(r.subscribed_at), iso(r.unsubscribed_at)]),
    ];
    const csv = '﻿' + lines.map(l => l.map(cell).join(';')).join('\r\n');
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="newsletter-smalim-${date}.csv"`);
    res.send(csv);
  } catch (error) { next(error); }
};

/** PATCH /api/newsletter/:id { status } (back-office) : désinscrire / réinscrire */
exports.update = async (req, res, next) => {
  try {
    const existing = await queryOne('SELECT * FROM newsletter_subscribers WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Inscrit introuvable' });
    const subscribed = req.body.status === 'subscribed';
    await query(
      `UPDATE newsletter_subscribers
       SET status = ?, unsubscribed_at = ${subscribed ? 'NULL' : 'NOW()'}
       WHERE id = ?`,
      [req.body.status, existing.id]
    );
    const updated = await queryOne(
      'SELECT id, email, status, source, locale, subscribed_at, unsubscribed_at FROM newsletter_subscribers WHERE id = ?',
      [existing.id]
    );
    res.json({ success: true, message: subscribed ? 'Adresse réinscrite' : 'Adresse désinscrite', data: updated });
  } catch (error) { next(error); }
};

/** DELETE /api/newsletter/:id (administrateurs) : effacement sur demande */
exports.delete = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Inscrit introuvable' });
    res.json({ success: true, message: 'Adresse supprimée' });
  } catch (error) { next(error); }
};
