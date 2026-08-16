const { query, queryOne } = require('../config/database');
const { buildSlug } = require('../lib/utils');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, active } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    if (category) { where.push('pc.slug = ?'); params.push(category); }
    if (active !== undefined) { where.push('p.is_active = ?'); params.push(active === 'true' ? 1 : 0); }
    if (search) { where.push('(p.name LIKE ? OR p.brand LIKE ? OR p.reference LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [products, countResult] = await Promise.all([
      query(`
        SELECT p.*, pc.name AS category_name, pc.slug AS category_slug
        FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id
        ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]),
      query(`SELECT COUNT(*) AS total FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id ${whereClause}`, params),
    ]);

    res.json({ success: true, data: products, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total } });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await queryOne(`
      SELECT p.*, pc.name AS category_name FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE p.id = ?
    `, [req.params.id]);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const product = await queryOne(`
      SELECT p.*, pc.name AS category_name FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE p.slug = ? AND p.is_active = 1
    `, [req.params.slug]);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { category_id, name, description, price, stock, unit, brand, reference, image_url, gallery, specifications, is_active, is_featured } = req.body;
    const slug = buildSlug(name) + '-' + Date.now();

    const result = await query(
      `INSERT INTO products (category_id, name, slug, description, price, stock, unit, brand, reference, image_url, gallery, specifications, is_active, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, slug, description, price, stock || 0, unit || 'unité', brand, reference, image_url,
       JSON.stringify(gallery || []), JSON.stringify(specifications || {}), is_active !== undefined ? is_active : 1, is_featured ? 1 : 0]
    );
    const product = await queryOne('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Produit créé', data: product });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const product = await queryOne('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    const { category_id, name, description, price, stock, unit, brand, reference, image_url, gallery, specifications, is_active, is_featured } = req.body;

    await query(
      `UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?, unit=?, brand=?, reference=?,
       image_url=?, gallery=?, specifications=?, is_active=?, is_featured=? WHERE id=?`,
      [category_id, name, description, price, stock, unit, brand, reference, image_url,
       JSON.stringify(gallery || []), JSON.stringify(specifications || {}), is_active, is_featured ? 1 : 0, req.params.id]
    );
    const updated = await queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produit mis à jour', data: updated });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const product = await queryOne('SELECT id FROM products WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    await query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) { next(error); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await query('SELECT * FROM product_categories ORDER BY name ASC');
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};
