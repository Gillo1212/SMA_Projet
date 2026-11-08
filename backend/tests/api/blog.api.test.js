/** /api/blog — base de test réelle */
const { api, ids, resetDatabase, closeDatabase, auth, query } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

const articleBody = (overrides = {}) => ({
  category_id: ids.blogCategory,
  title: 'Nouvel article',
  excerpt: 'Résumé de test',
  content: '<p>Contenu de test</p>',
  read_time: 4,
  status: 'draft',
  ...overrides,
});

describe('lecture publique', () => {
  test('GET /api/blog : seulement les articles publiés, avec catégorie et auteur', async () => {
    const res = await api.get('/api/blog');
    expect(res.status).toBe(200);
    expect(res.body.data.map(a => a.slug)).toEqual(['article-publie']);
    expect(res.body.data[0]).toMatchObject({ category_slug: 'actualites', author_first: 'Sana' });
  });

  test('un client ne voit pas non plus les brouillons', async () => {
    const res = await api.get('/api/blog?status=draft').set(auth('client'));
    expect(res.body.data.map(a => a.status)).toEqual(['published']);
  });

  test('admin : tous les articles, filtre par statut', async () => {
    expect((await api.get('/api/blog').set(auth('admin'))).body.data).toHaveLength(2);
    expect((await api.get('/api/blog?status=draft').set(auth('admin'))).body.data.map(a => a.slug)).toEqual(['brouillon']);
  });

  test('recherche et filtre de catégorie', async () => {
    expect((await api.get('/api/blog?search=publié')).body.data).toHaveLength(1);
    expect((await api.get('/api/blog?category=inconnue')).body.data).toEqual([]);
  });

  test('GET /api/blog/categories : nombre d’articles publiés', async () => {
    const res = await api.get('/api/blog/categories');
    expect(res.body.data[0]).toMatchObject({ slug: 'actualites', articles_count: 1 });
  });

  test('article publié : contenu + vue comptée ; brouillon : 403 au public, visible par l’admin ; inconnu : 404', async () => {
    const res = await api.get('/api/blog/article-publie');
    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe('<p>Contenu</p>');
    const [row] = await query('SELECT views_count FROM blog_articles WHERE id = ?', [ids.publishedArticle]);
    expect(row.views_count).toBe(1);

    expect((await api.get('/api/blog/brouillon')).status).toBe(403);
    expect((await api.get('/api/blog/brouillon').set(auth('admin'))).status).toBe(200);
    expect((await api.get('/api/blog/inconnu')).status).toBe(404);
  });
});

describe('gestion (admin)', () => {
  let createdId;

  test('création en brouillon : auteur = admin connecté, pas de date de publication', async () => {
    const res = await api.post('/api/blog').set(auth('admin')).send(articleBody());
    expect(res.status).toBe(201);
    createdId = res.body.data.id;
    expect(res.body.data).toMatchObject({ author_id: ids.admin, status: 'draft', published_at: null });
    expect(res.body.data.slug).toMatch(/^nouvel-article-\d+$/);
  });

  test('image de couverture envoyée depuis l’admin (chemin /uploads/…) acceptée', async () => {
    const res = await api.post('/api/blog').set(auth('admin')).send(articleBody({ title: 'Avec image', image_url: '/uploads/1794100584118-106835393.webp' }));
    expect(res.status).toBe(201);
    expect(res.body.data.image_url).toBe('/uploads/1794100584118-106835393.webp');
  });

  test('image en URL complète acceptée ; adresse invalide refusée', async () => {
    expect((await api.post('/api/blog').set(auth('admin')).send(articleBody({ title: 'URL', image_url: 'https://cdn.example.test/a.jpg' }))).status).toBe(201);
    expect((await api.post('/api/blog').set(auth('admin')).send(articleBody({ title: 'Mauvaise', image_url: 'javascript:alert(1)' }))).status).toBe(400);
  });

  test('publication : la date de publication est posée une fois', async () => {
    const res = await api.put(`/api/blog/${createdId}`).set(auth('admin')).send(articleBody({ status: 'published' }));
    expect(res.status).toBe(200);
    const [first] = await query('SELECT published_at FROM blog_articles WHERE id = ?', [createdId]);
    expect(first.published_at).not.toBeNull();
    await api.put(`/api/blog/${createdId}`).set(auth('admin')).send(articleBody({ status: 'published', title: 'Titre corrigé' }));
    const [second] = await query('SELECT published_at, title FROM blog_articles WHERE id = ?', [createdId]);
    expect(second).toEqual({ published_at: first.published_at, title: 'Titre corrigé' });
  });

  test('validation : titre, contenu, catégorie, statut', async () => {
    for (const body of [articleBody({ title: '' }), articleBody({ content: '' }), articleBody({ category_id: 'x' }), articleBody({ status: 'supprimé' })]) {
      expect((await api.post('/api/blog').set(auth('admin')).send(body)).status).toBe(400);
    }
  });

  test('catégorie inexistante : 400 (pas d’erreur 500)', async () => {
    expect((await api.post('/api/blog').set(auth('admin')).send(articleBody({ category_id: 9999 }))).status).toBe(400);
  });

  test('client : 403 ; visiteur : 401', async () => {
    expect((await api.post('/api/blog').set(auth('client')).send(articleBody())).status).toBe(403);
    expect((await api.put(`/api/blog/${createdId}`).send(articleBody())).status).toBe(401);
  });

  test('suppression ; article inconnu : 404', async () => {
    expect((await api.delete(`/api/blog/${createdId}`).set(auth('admin'))).status).toBe(200);
    expect((await api.delete(`/api/blog/${createdId}`).set(auth('admin'))).status).toBe(404);
    expect((await api.put('/api/blog/9999').set(auth('admin')).send(articleBody())).status).toBe(404);
  });
});
