/** /api/machines, /api/products, /api/upload — base de test réelle */
const path = require('path');
const { api, ids, resetDatabase, closeDatabase, auth, query } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

const machineBody = (overrides = {}) => ({
  category_id: ids.machineCategory,
  name: 'Machine de test',
  description: 'Une machine pour les tests.',
  price: 1200000,
  stock: 4,
  brand: 'TestBrand',
  model_ref: 'T-1',
  delivery_delay: '5 jours',
  image_url: '/uploads/test.webp',
  gallery: ['/uploads/test.webp'],
  specifications: { poids: '20 kg' },
  payment_modes: ['wave', 'cash'],
  is_active: true,
  is_featured: false,
  ...overrides,
});

describe('machines — lecture publique', () => {
  test('GET /api/machines : liste avec catégorie, sans les machines retirées du catalogue', async () => {
    const res = await api.get('/api/machines');
    expect(res.status).toBe(200);
    const names = res.body.data.map(m => m.name);
    expect(names).toContain('Lecon Good Taste 50S');
    expect(names).not.toContain('Ancienne machine');
    expect(res.body.data[0]).toHaveProperty('category_name');
  });

  test('un admin voit aussi les machines retirées', async () => {
    const res = await api.get('/api/machines').set(auth('admin'));
    expect(res.body.data.map(m => m.name)).toContain('Ancienne machine');
  });

  test('filtres : catégorie, recherche, mises en avant', async () => {
    expect((await api.get('/api/machines?category=machines-a-cafe')).body.data.length).toBeGreaterThan(0);
    expect((await api.get('/api/machines?category=machines-a-glace')).body.data).toEqual([]);
    expect((await api.get('/api/machines?search=Lecon')).body.data.map(m => m.id)).toEqual([ids.machine]);
    expect((await api.get('/api/machines?featured=true')).body.data.every(m => m.is_featured === 1)).toBe(true);
  });

  test('GET /api/machines/categories', async () => {
    const res = await api.get('/api/machines/categories');
    expect(res.body.data.map(c => c.slug)).toEqual(expect.arrayContaining(['machines-a-cafe', 'machines-a-glace']));
  });

  test('GET /api/machines/slug/:slug : fiche + compteur de vues', async () => {
    const res = await api.get('/api/machines/slug/lecon-good-taste-50s');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: ids.machine, category_name: 'Machines à café' });
    const [row] = await query('SELECT views_count FROM machines WHERE id = ?', [ids.machine]);
    expect(row.views_count).toBeGreaterThan(0);
  });

  test('fiche d’une machine retirée ou inconnue : 404', async () => {
    expect((await api.get('/api/machines/slug/ancienne-machine')).status).toBe(404);
    expect((await api.get('/api/machines/slug/inconnue')).status).toBe(404);
    expect((await api.get('/api/machines/9999')).status).toBe(404);
  });

  test('GET /api/machines/:id', async () => {
    const res = await api.get(`/api/machines/${ids.machine}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Lecon Good Taste 50S');
  });
});

describe('machines — gestion (admin)', () => {
  let createdId;

  test('client ou visiteur : refusé', async () => {
    expect((await api.post('/api/machines').send(machineBody())).status).toBe(401);
    expect((await api.post('/api/machines').set(auth('client')).send(machineBody())).status).toBe(403);
  });

  test('création : slug généré, catégorie renvoyée, chemins d’images relatifs conservés', async () => {
    const res = await api.post('/api/machines').set(auth('admin')).send(machineBody());
    expect(res.status).toBe(201);
    createdId = res.body.data.id;
    expect(res.body.data).toMatchObject({ name: 'Machine de test', category_name: 'Machines à café', image_url: '/uploads/test.webp' });
    expect(res.body.data.slug).toMatch(/^machine-de-test/);
    expect(res.body.data.gallery).toEqual(['/uploads/test.webp']);
  });

  test('création sans catégorie : 400', async () => {
    const res = await api.post('/api/machines').set(auth('admin')).send(machineBody({ category_id: undefined }));
    expect(res.status).toBe(400);
  });

  test('modification : tous les champs enregistrés', async () => {
    const res = await api.put(`/api/machines/${createdId}`).set(auth('admin'))
      .send(machineBody({ name: 'Machine modifiée', stock: 0, model_ref: 'T-2', is_featured: true }));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Machine modifiée', stock: 0, model_ref: 'T-2', is_featured: 1, brand: 'TestBrand', category_name: 'Machines à café' });
  });

  test('modification partielle : les champs non envoyés gardent leur valeur', async () => {
    const res = await api.put(`/api/machines/${createdId}`).set(auth('admin'))
      .send({ category_id: ids.machineCategory, name: 'Nom seul', price: 1000 });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ name: 'Nom seul', brand: 'TestBrand', model_ref: 'T-2', unit: 'unité', stock: 0 });
    expect(res.body.data.specifications).toEqual({ poids: '20 kg' });
  });

  test('modification d’une machine inconnue : 404', async () => {
    expect((await api.put('/api/machines/9999').set(auth('admin')).send(machineBody())).status).toBe(404);
  });

  test('suppression', async () => {
    expect((await api.delete(`/api/machines/${createdId}`).set(auth('admin'))).status).toBe(200);
    expect((await api.get(`/api/machines/${createdId}`)).status).toBe(404);
    expect((await api.delete(`/api/machines/${createdId}`).set(auth('admin'))).status).toBe(404);
  });

  test('une machine installée chez un client ne peut pas être supprimée (409, pas d’erreur 500)', async () => {
    const res = await api.delete(`/api/machines/${ids.machine}`).set(auth('admin'));
    expect(res.status).toBe(409);
  });
});

const productBody = (overrides = {}) => ({
  category_id: ids.productCategory,
  name: 'Gobelets de test',
  description: 'Lot de 100.',
  price: 2500,
  stock: 20,
  unit: 'lot',
  brand: 'TestBrand',
  reference: 'GOB-100',
  image_url: '/uploads/gobelets.webp',
  gallery: ['/uploads/gobelets.webp'],
  specifications: { contenance: '20 cl' },
  is_active: true,
  is_featured: false,
  ...overrides,
});

describe('consommables', () => {
  let createdId;

  test('GET /api/products : sans les produits retirés pour le public', async () => {
    const res = await api.get('/api/products');
    expect(res.status).toBe(200);
    const names = res.body.data.map(p => p.name);
    expect(names).toEqual(expect.arrayContaining(['Café de Colombie', 'Chocolat chaud']));
    expect(names).not.toContain('Produit retiré');
  });

  test('un admin voit aussi les produits retirés', async () => {
    const res = await api.get('/api/products').set(auth('admin'));
    expect(res.body.data.map(p => p.name)).toContain('Produit retiré');
  });

  test('filtres et catégories', async () => {
    expect((await api.get('/api/products?search=Colombie')).body.data.map(p => p.id)).toEqual([ids.product]);
    expect((await api.get('/api/products?category=cafes-et-boissons')).body.data.length).toBeGreaterThan(0);
    expect((await api.get('/api/products/categories')).body.data[0]).toMatchObject({ slug: 'cafes-et-boissons' });
  });

  test('fiche par id et par slug', async () => {
    expect((await api.get(`/api/products/${ids.product}`)).body.data.name).toBe('Café de Colombie');
    expect((await api.get('/api/products/slug/cafe-de-colombie')).body.data.id).toBe(ids.product);
    expect((await api.get('/api/products/slug/produit-retire')).status).toBe(404);
    expect((await api.get('/api/products/9999')).status).toBe(404);
  });

  test('création, modification, suppression (admin)', async () => {
    expect((await api.post('/api/products').set(auth('client')).send(productBody())).status).toBe(403);

    const created = await api.post('/api/products').set(auth('admin')).send(productBody());
    expect(created.status).toBe(201);
    createdId = created.body.data.id;
    expect(created.body.data).toMatchObject({ category_name: 'Cafés et boissons', reference: 'GOB-100' });

    const updated = await api.put(`/api/products/${createdId}`).set(auth('admin')).send(productBody({ price: 3000, stock: 5 }));
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ price: '3000.00', stock: 5, category_name: 'Cafés et boissons' });

    expect((await api.delete(`/api/products/${createdId}`).set(auth('admin'))).status).toBe(200);
    expect((await api.get(`/api/products/${createdId}`)).status).toBe(404);
  });

  test('prix négatif : 400', async () => {
    expect((await api.post('/api/products').set(auth('admin')).send(productBody({ price: -1 }))).status).toBe(400);
  });
});

describe('POST /api/upload/image', () => {
  const image = path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'images', 'products', 'kingsmill-iced-cappuccino', '1.webp');

  test('admin : image enregistrée et servie avec CORP cross-origin', async () => {
    const res = await api.post('/api/upload/image').set(auth('admin')).attach('image', image);
    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^\/uploads\/\d+-\d+\.webp$/);
    const file = await api.get(res.body.url);
    expect(file.status).toBe(200);
    expect(file.headers['content-type']).toBe('image/webp');
    expect(file.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  test('fichier qui n’est pas une image : 400', async () => {
    const res = await api.post('/api/upload/image').set(auth('admin'))
      .attach('image', Buffer.from('pas une image'), { filename: 'photo.jpg', contentType: 'text/plain' });
    expect(res.status).toBe(400);
  });

  // Sans pièce jointe pour les refus : le serveur répond avant de lire le
  // fichier, et un envoi en cours couperait parfois la connexion (EPIPE).
  test('sans fichier : 400 ; client : 403 ; visiteur : 401', async () => {
    expect((await api.post('/api/upload/image').set(auth('admin'))).status).toBe(400);
    expect((await api.post('/api/upload/image').set(auth('client'))).status).toBe(403);
    expect((await api.post('/api/upload/image')).status).toBe(401);
  });
});
