const { query, queryOne, transaction } = require('../config/database');
const { buildSlug } = require('../lib/utils');

// ── MACHINES ────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, active, featured } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = [];
    let params = [];

    if (category) { where.push('mc.slug = ?'); params.push(category); }
    if (active !== undefined) { where.push('m.is_active = ?'); params.push(active === 'true' ? 1 : 0); }
    if (featured === 'true') { where.push('m.is_featured = 1'); }
    if (search) { where.push('(m.name LIKE ? OR m.brand LIKE ? OR m.model_ref LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [machines, countResult] = await Promise.all([
      query(`
        SELECT m.*, mc.name AS category_name, mc.slug AS category_slug
        FROM machines m
        LEFT JOIN machine_categories mc ON m.category_id = mc.id
        ${whereClause}
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]),
      query(`SELECT COUNT(*) AS total FROM machines m LEFT JOIN machine_categories mc ON m.category_id = mc.id ${whereClause}`, params),
    ]);

    res.json({
      success: true,
      data: machines,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total },
    });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const machine = await queryOne(`
      SELECT m.*, mc.name AS category_name, mc.slug AS category_slug
      FROM machines m
      LEFT JOIN machine_categories mc ON m.category_id = mc.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (!machine) return res.status(404).json({ success: false, message: 'Machine introuvable' });

    await query('UPDATE machines SET views_count = views_count + 1 WHERE id = ?', [machine.id]);
    res.json({ success: true, data: machine });
  } catch (error) { next(error); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const machine = await queryOne(`
      SELECT m.*, mc.name AS category_name, mc.slug AS category_slug
      FROM machines m
      LEFT JOIN machine_categories mc ON m.category_id = mc.id
      WHERE m.slug = ? AND m.is_active = 1
    `, [req.params.slug]);

    if (!machine) return res.status(404).json({ success: false, message: 'Machine introuvable' });
    await query('UPDATE machines SET views_count = views_count + 1 WHERE id = ?', [machine.id]);
    res.json({ success: true, data: machine });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { category_id, name, description, price, stock, unit, brand, model_ref, delivery_delay, image_url, gallery, specifications, payment_modes, is_active, is_featured } = req.body;
    const slug = buildSlug(name) + '-' + Date.now();

    const result = await query(
      `INSERT INTO machines (category_id, name, slug, description, price, stock, unit, brand, model_ref, delivery_delay, image_url, gallery, specifications, payment_modes, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, slug, description, price, stock || 0, unit || 'unité', brand, model_ref, delivery_delay, image_url,
       JSON.stringify(gallery || []), JSON.stringify(specifications || {}), JSON.stringify(payment_modes || []),
       is_active !== undefined ? is_active : 1, is_featured ? 1 : 0]
    );

    const machine = await queryOne('SELECT * FROM machines WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Machine créée', data: machine });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const machine = await queryOne('SELECT id FROM machines WHERE id = ?', [req.params.id]);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine introuvable' });

    const { category_id, name, description, price, stock, unit, brand, model_ref, delivery_delay, image_url, gallery, specifications, payment_modes, is_active, is_featured } = req.body;

    await query(
      `UPDATE machines SET category_id=?, name=?, description=?, price=?, stock=?, unit=?, brand=?, model_ref=?,
       delivery_delay=?, image_url=?, gallery=?, specifications=?, payment_modes=?, is_active=?, is_featured=? WHERE id = ?`,
      [category_id, name, description, price, stock, unit, brand, model_ref, delivery_delay, image_url,
       JSON.stringify(gallery || []), JSON.stringify(specifications || {}), JSON.stringify(payment_modes || []),
       is_active, is_featured ? 1 : 0, req.params.id]
    );

    const updated = await queryOne('SELECT * FROM machines WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Machine mise à jour', data: updated });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const machine = await queryOne('SELECT id FROM machines WHERE id = ?', [req.params.id]);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine introuvable' });
    await query('DELETE FROM machines WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Machine supprimée' });
  } catch (error) { next(error); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await query('SELECT * FROM machine_categories ORDER BY name ASC');
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};
