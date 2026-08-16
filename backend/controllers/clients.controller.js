const bcrypt = require('bcryptjs');
const { query, queryOne } = require('../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, active } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    if (active !== undefined) { where.push('is_active = ?'); params.push(active === 'true' ? 1 : 0); }
    if (search) {
      where.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR company_name LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [clients, countResult] = await Promise.all([
      query(`
        SELECT id, email, first_name, last_name, company_name, phone, city, country, is_active, last_login, created_at
        FROM clients ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]),
      query(`SELECT COUNT(*) AS total FROM clients ${whereClause}`, params),
    ]);

    // Agréger stats commandes par client
    const clientIds = clients.map(c => c.id);
    if (clientIds.length) {
      const stats = await query(`
        SELECT client_id, COUNT(*) AS orders_count, SUM(total_amount) AS total_spent
        FROM orders WHERE client_id IN (${clientIds.map(() => '?').join(',')}) GROUP BY client_id
      `, clientIds);
      const statsMap = Object.fromEntries(stats.map(s => [s.client_id, s]));
      clients.forEach(c => {
        c.orders_count = statsMap[c.id]?.orders_count || 0;
        c.total_spent = statsMap[c.id]?.total_spent || 0;
      });
    }

    res.json({ success: true, data: clients, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total } });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const clientId = req.user?.type === 'client' ? req.user.id : req.params.id;
    const client = await queryOne(
      'SELECT id, email, first_name, last_name, company_name, phone, address, city, country, is_active, last_login, created_at FROM clients WHERE id = ?',
      [clientId]
    );
    if (!client) return res.status(404).json({ success: false, message: 'Client introuvable' });

    const [machines, orders, invoices] = await Promise.all([
      query(`
        SELECT cm.*, m.name AS machine_name, m.image_url FROM client_machines cm
        LEFT JOIN machines m ON cm.machine_id = m.id WHERE cm.client_id = ?
      `, [clientId]),
      query('SELECT id, order_number, status, total_amount, payment_status, created_at FROM orders WHERE client_id = ? ORDER BY created_at DESC LIMIT 5', [clientId]),
      query('SELECT id, invoice_number, type, amount_ttc, status, due_date, created_at FROM invoices WHERE client_id = ? ORDER BY created_at DESC LIMIT 5', [clientId]),
    ]);

    res.json({ success: true, data: { ...client, machines, recent_orders: orders, recent_invoices: invoices } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    // Sécurité : un client ne peut modifier que son propre profil
    if (req.user?.type === 'client' && parseInt(req.params.id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }
    const clientId = req.user?.type === 'client' ? req.user.id : req.params.id;
    const { first_name, last_name, company_name, phone, address, city, country } = req.body;

    await query(
      'UPDATE clients SET first_name=?, last_name=?, company_name=?, phone=?, address=?, city=?, country=? WHERE id=?',
      [first_name, last_name, company_name, phone, address, city, country, clientId]
    );
    const updated = await queryOne('SELECT id, email, first_name, last_name, company_name, phone, address, city, country FROM clients WHERE id = ?', [clientId]);
    res.json({ success: true, message: 'Profil mis à jour', data: updated });
  } catch (error) { next(error); }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const client = await queryOne('SELECT id, is_active FROM clients WHERE id = ?', [req.params.id]);
    if (!client) return res.status(404).json({ success: false, message: 'Client introuvable' });
    await query('UPDATE clients SET is_active = ? WHERE id = ?', [client.is_active ? 0 : 1, req.params.id]);
    res.json({ success: true, message: `Client ${client.is_active ? 'désactivé' : 'activé'}` });
  } catch (error) { next(error); }
};

// ── Machines du parc client ──────────────────────────────────
exports.getClientMachines = async (req, res, next) => {
  try {
    const clientId = req.user?.type === 'client' ? req.user.id : req.params.id;
    const machines = await query(`
      SELECT cm.*, m.name AS machine_name, m.image_url, m.brand, mc.name AS category_name
      FROM client_machines cm
      LEFT JOIN machines m ON cm.machine_id = m.id
      LEFT JOIN machine_categories mc ON m.category_id = mc.id
      WHERE cm.client_id = ? ORDER BY cm.installation_date DESC
    `, [clientId]);
    res.json({ success: true, data: machines });
  } catch (error) { next(error); }
};

exports.addClientMachine = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const { machine_id, serial_number, installation_date, location, notes } = req.body;
    const result = await query(
      'INSERT INTO client_machines (client_id, machine_id, serial_number, installation_date, location, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, machine_id, serial_number, installation_date, location, notes]
    );
    res.status(201).json({ success: true, message: 'Machine ajoutée au parc client', id: result.insertId });
  } catch (error) { next(error); }
};

exports.updateClientMachineStatus = async (req, res, next) => {
  try {
    const { status, last_service_date, next_service_date } = req.body;
    await query(
      'UPDATE client_machines SET status=?, last_service_date=?, next_service_date=? WHERE id=? AND client_id=?',
      [status, last_service_date, next_service_date, req.params.machineId, req.params.id]
    );
    res.json({ success: true, message: 'Statut machine mis à jour' });
  } catch (error) { next(error); }
};

// ── Support / Tickets ────────────────────────────────────────
exports.getTickets = async (req, res, next) => {
  try {
    const clientId = req.user?.type === 'client' ? req.user.id : req.params.id;
    const tickets = await query(`
      SELECT t.*, m.name AS machine_name FROM support_tickets t
      LEFT JOIN machines m ON t.machine_id = m.id
      WHERE t.client_id = ? ORDER BY t.created_at DESC
    `, [clientId]);
    res.json({ success: true, data: tickets });
  } catch (error) { next(error); }
};

exports.createTicket = async (req, res, next) => {
  try {
    const clientId = req.user?.id;
    const { machine_id, subject, description, category, priority } = req.body;
    const date = new Date();
    const ticketNumber = `TKT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const result = await query(
      'INSERT INTO support_tickets (ticket_number, client_id, machine_id, subject, description, category, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ticketNumber, clientId, machine_id || null, subject, description, category || 'question', priority || 'medium']
    );
    res.status(201).json({ success: true, message: 'Ticket créé', id: result.insertId, ticket_number: ticketNumber });
  } catch (error) { next(error); }
};

// ── Factures ────────────────────────────────────────────────
exports.getInvoices = async (req, res, next) => {
  try {
    const clientId = req.user?.type === 'client' ? req.user.id : req.params.id;
    const { status } = req.query;
    let where = ['client_id = ?'];
    let params = [clientId];

    if (status) { where.push('status = ?'); params.push(status); }

    const invoices = await query(
      `SELECT * FROM invoices WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
      params
    );
    res.json({ success: true, data: invoices });
  } catch (error) { next(error); }
};
