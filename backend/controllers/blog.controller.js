const { query, queryOne } = require('../config/database');
const { buildSlug } = require('../lib/utils');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    // Public : uniquement les articles publiés
    if (!req.user || req.user.type !== 'admin') {
      where.push('a.status = ?'); params.push('published');
    } else if (status) {
      where.push('a.status = ?'); params.push(status);
    }
    if (category) { where.push('bc.slug = ?'); params.push(category); }
    if (search) { where.push('(a.title LIKE ? OR a.excerpt LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [articles, countResult] = await Promise.all([
      query(`
        SELECT a.id, a.title, a.slug, a.excerpt, a.image_url, a.read_time, a.status, a.views_count, a.published_at, a.created_at,
               bc.name AS category_name, bc.slug AS category_slug,
               adm.first_name AS author_first, adm.last_name AS author_last
        FROM blog_articles a
        LEFT JOIN blog_categories bc ON a.category_id = bc.id
        LEFT JOIN admins adm ON a.author_id = adm.id
        ${whereClause} ORDER BY a.published_at DESC, a.created_at DESC LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]),
      query(`SELECT COUNT(*) AS total FROM blog_articles a LEFT JOIN blog_categories bc ON a.category_id = bc.id ${whereClause}`, params),
    ]);

    res.json({ success: true, data: articles, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total } });
  } catch (error) { next(error); }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const article = await queryOne(`
      SELECT a.*, bc.name AS category_name, bc.slug AS category_slug,
             adm.first_name AS author_first, adm.last_name AS author_last
      FROM blog_articles a
      LEFT JOIN blog_categories bc ON a.category_id = bc.id
      LEFT JOIN admins adm ON a.author_id = adm.id
      WHERE a.slug = ?
    `, [req.params.slug]);

    if (!article) return res.status(404).json({ success: false, message: 'Article introuvable' });
    if (article.status !== 'published' && req.user?.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Article non disponible' });
    }

    await query('UPDATE blog_articles SET views_count = views_count + 1 WHERE id = ?', [article.id]);
    res.json({ success: true, data: article });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { category_id, title, excerpt, content, image_url, read_time, status } = req.body;
    const slug = buildSlug(title) + '-' + Date.now();
    const published_at = status === 'published' ? new Date() : null;

    const result = await query(
      `INSERT INTO blog_articles (category_id, author_id, title, slug, excerpt, content, image_url, read_time, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, req.user.id, title, slug, excerpt, content, image_url, read_time || 5, status || 'draft', published_at]
    );
    const article = await queryOne('SELECT * FROM blog_articles WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Article créé', data: article });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const article = await queryOne('SELECT * FROM blog_articles WHERE id = ?', [req.params.id]);
    if (!article) return res.status(404).json({ success: false, message: 'Article introuvable' });

    const { category_id, title, excerpt, content, image_url, read_time, status } = req.body;
    const published_at = status === 'published' && !article.published_at ? new Date() : article.published_at;

    await query(
      `UPDATE blog_articles SET category_id=?, title=?, excerpt=?, content=?, image_url=?, read_time=?, status=?, published_at=? WHERE id=?`,
      [category_id, title, excerpt, content, image_url, read_time, status, published_at, req.params.id]
    );
    res.json({ success: true, message: 'Article mis à jour' });
  } catch (error) { next(error); }
};

exports.delete = async (req, res, next) => {
  try {
    const article = await queryOne('SELECT id FROM blog_articles WHERE id = ?', [req.params.id]);
    if (!article) return res.status(404).json({ success: false, message: 'Article introuvable' });
    await query('DELETE FROM blog_articles WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Article supprimé' });
  } catch (error) { next(error); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await query(`
      SELECT bc.*, COUNT(a.id) AS articles_count
      FROM blog_categories bc LEFT JOIN blog_articles a ON bc.id = a.category_id AND a.status = 'published'
      GROUP BY bc.id ORDER BY bc.name ASC
    `);
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};
