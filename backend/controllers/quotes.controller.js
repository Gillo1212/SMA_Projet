const { query, queryOne } = require('../config/database');
const { sendQuoteUpdate } = require('../services/email.service');
const adminNotifications = require('../services/adminNotifications.service');

const generateQuoteNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `DEV-${year}-${rand}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    if (req.user?.type === 'client') {
      where.push('q.client_id = ?'); params.push(req.user.id);
    }
    if (status) { where.push('q.status = ?'); params.push(status); }
    if (search) {
      where.push('(q.quote_number LIKE ? OR q.contact_name LIKE ? OR q.company_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [quotes, countResult] = await Promise.all([
      query(`
        SELECT q.*, c.email AS client_email FROM quotes q
        LEFT JOIN clients c ON q.client_id = c.id
        ${whereClause} ORDER BY q.created_at DESC LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]),
      query(`SELECT COUNT(*) AS total FROM quotes q ${whereClause}`, params),
    ]);

    res.json({ success: true, data: quotes, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total } });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const quote = await queryOne(`
      SELECT q.*, c.email AS client_email FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id WHERE q.id = ?
    `, [req.params.id]);
    if (!quote) return res.status(404).json({ success: false, message: 'Devis introuvable' });
    if (req.user?.type === 'client' && quote.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    res.json({ success: true, data: quote });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_name, contact_name, contact_email, contact_phone, machine_type, description, budget, quantity, notes } = req.body;
    const clientId = req.user?.type === 'client' ? req.user.id : null;
    const quoteNumber = generateQuoteNumber();

    const result = await query(
      `INSERT INTO quotes (quote_number, client_id, company_name, contact_name, contact_email, contact_phone, machine_type, description, budget, quantity, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quoteNumber, clientId, company_name, contact_name, contact_email, contact_phone, machine_type, description, budget || null, quantity || 1, notes]
    );
    const quote = await queryOne('SELECT * FROM quotes WHERE id = ?', [result.insertId]);
    adminNotifications.newQuote(quote);
    res.status(201).json({ success: true, message: 'Demande de devis envoyée', data: quote });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, proposed_amount, admin_response, expires_at } = req.body;
    const quote = await queryOne('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    if (!quote) return res.status(404).json({ success: false, message: 'Devis introuvable' });

    // Client : seulement répondre à une proposition reçue, encore valable
    if (req.user?.type === 'client') {
      if (!['accepted', 'refused'].includes(status)) {
        return res.status(403).json({ success: false, message: 'Action non autorisée' });
      }
      if (quote.client_id !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Devis introuvable' });
      }
      if (quote.status !== 'quoted') {
        return res.status(409).json({ success: false, message: "Ce devis n'attend plus de réponse" });
      }
      if (quote.expires_at && new Date(quote.expires_at) < new Date()) {
        return res.status(409).json({ success: false, message: 'Cette proposition a expiré : contactez-nous pour la renouveler' });
      }
      await query('UPDATE quotes SET status = ? WHERE id = ?', [status, quote.id]);
      adminNotifications.quoteAnswered({ ...quote, status });
      return res.json({ success: true, message: `Devis ${status === 'accepted' ? 'accepté' : 'refusé'}` });
    }

    await query(
      'UPDATE quotes SET status=?, proposed_amount=?, admin_response=?, expires_at=? WHERE id=?',
      [status, proposed_amount || quote.proposed_amount, admin_response || quote.admin_response, expires_at || quote.expires_at, req.params.id]
    );

    // Email au contact uniquement quand une proposition chiffrée lui est
    // envoyée : les étapes internes (« en cours »…) ne le concernent pas.
    const updatedQuote = await queryOne('SELECT * FROM quotes WHERE id = ?', [req.params.id]);
    const proposalSent = status === 'quoted' && quote.status !== 'quoted' && updatedQuote.proposed_amount;
    if (proposalSent) {
      const emailTarget = quote.client_id
        ? await queryOne('SELECT email, first_name FROM clients WHERE id = ?', [quote.client_id])
        : { email: quote.contact_email, first_name: quote.contact_name };
      if (emailTarget?.email) {
        sendQuoteUpdate(emailTarget, updatedQuote).catch(err =>
          console.error('[Email] Notification devis non envoyée:', err.message)
        );
      }
    }

    res.json({ success: true, message: 'Devis mis à jour' });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const quote = await queryOne('SELECT id FROM quotes WHERE id = ?', [req.params.id]);
    if (!quote) return res.status(404).json({ success: false, message: 'Devis introuvable' });
    await query('DELETE FROM quotes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Devis supprimé' });
  } catch (error) { next(error); }
};
