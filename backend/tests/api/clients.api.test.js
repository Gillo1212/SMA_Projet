/** /api/clients (profil, parc machines, tickets, factures) et /api/dashboard — base de test réelle */
const { api, ids, resetDatabase, closeDatabase, auth, query } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

describe('GET /api/clients (admin)', () => {
  test('liste avec statistiques de commandes, sans mot de passe', async () => {
    const res = await api.get('/api/clients').set(auth('admin'));
    expect(res.status).toBe(200);
    const client = res.body.data.find(c => c.id === ids.client);
    expect(client).toMatchObject({ email: 'client@entreprise.test', orders_count: 2 });
    expect(Number(client.total_spent)).toBe(36720 + 18430);
    expect(res.body.data.every(c => c.password === undefined)).toBe(true);
  });

  test('filtres actif et recherche', async () => {
    expect((await api.get('/api/clients?active=false').set(auth('admin'))).body.data.map(c => c.id)).toEqual([ids.inactiveClient]);
    expect((await api.get('/api/clients?search=Autre').set(auth('admin'))).body.data.map(c => c.id)).toEqual([ids.otherClient]);
  });

  test('client : 403', async () => {
    expect((await api.get('/api/clients').set(auth('client'))).status).toBe(403);
  });
});

describe('GET /api/clients/:id', () => {
  test('admin : fiche complète (parc, commandes, factures récentes)', async () => {
    const res = await api.get(`/api/clients/${ids.client}`).set(auth('admin'));
    expect(res.status).toBe(200);
    expect(res.body.data.machines).toHaveLength(1);
    expect(res.body.data.recent_orders).toHaveLength(2);
    expect(res.body.data.recent_invoices).toHaveLength(1);
    expect(res.body.data.password).toBeUndefined();
  });

  test('un client qui demande la fiche d’un autre reçoit la sienne', async () => {
    const res = await api.get(`/api/clients/${ids.otherClient}`).set(auth('client'));
    expect(res.body.data.id).toBe(ids.client);
  });

  test('inconnu : 404', async () => {
    expect((await api.get('/api/clients/9999').set(auth('admin'))).status).toBe(404);
  });
});

describe('PUT /api/clients/:id', () => {
  const profile = { first_name: 'Awa', last_name: 'Diop', company_name: 'Entreprise Test', phone: '+221770000011', address: 'Rue 12', city: 'Dakar', country: 'Sénégal' };

  test('le client modifie son profil', async () => {
    const res = await api.put(`/api/clients/${ids.client}`).set(auth('client')).send(profile);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ phone: '+221770000011', address: 'Rue 12' });
  });

  test('mais pas celui d’un autre : 403', async () => {
    expect((await api.put(`/api/clients/${ids.otherClient}`).set(auth('client')).send(profile)).status).toBe(403);
  });

  test('prénom vide : 400', async () => {
    expect((await api.put(`/api/clients/${ids.client}`).set(auth('client')).send({ ...profile, first_name: '' })).status).toBe(400);
  });

  test('l’admin modifie un client', async () => {
    const res = await api.put(`/api/clients/${ids.otherClient}`).set(auth('admin')).send({ ...profile, first_name: 'Moussa', last_name: 'Fall', company_name: 'Autre SARL' });
    expect(res.status).toBe(200);
    expect(res.body.data.first_name).toBe('Moussa');
  });

  test('l’email ne change pas par cette route', async () => {
    await api.put(`/api/clients/${ids.client}`).set(auth('client')).send({ ...profile, email: 'pirate@example.test' });
    const [row] = await query('SELECT email FROM clients WHERE id = ?', [ids.client]);
    expect(row.email).toBe('client@entreprise.test');
  });
});

describe('PATCH /api/clients/:id/toggle-active', () => {
  test('désactivation puis réactivation ; un compte désactivé est bloqué', async () => {
    expect((await api.patch(`/api/clients/${ids.otherClient}/toggle-active`).set(auth('admin'))).status).toBe(200);
    expect((await api.get('/api/auth/me').set(auth('otherClient'))).status).toBe(403);
    await api.patch(`/api/clients/${ids.otherClient}/toggle-active`).set(auth('admin'));
    expect((await api.get('/api/auth/me').set(auth('otherClient'))).status).toBe(200);
  });

  test('client : 403 ; inconnu : 404', async () => {
    expect((await api.patch(`/api/clients/${ids.client}/toggle-active`).set(auth('client'))).status).toBe(403);
    expect((await api.patch('/api/clients/9999/toggle-active').set(auth('admin'))).status).toBe(404);
  });
});

describe('parc machines', () => {
  let addedId;

  test('le client voit son parc', async () => {
    const res = await api.get(`/api/clients/${ids.client}/machines`).set(auth('client'));
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ machine_name: 'Lecon Good Taste 50S', category_name: 'Machines à café', serial_number: 'SN-0001' });
    expect((await api.get(`/api/clients/${ids.client}/machines`).set(auth('otherClient'))).body.data).toEqual([]);
  });

  test('l’admin installe une machine chez un client', async () => {
    const res = await api.post(`/api/clients/${ids.otherClient}/machines`).set(auth('admin'))
      .send({ machine_id: ids.machine, serial_number: 'SN-0002', installation_date: '2026-11-01', location: 'Accueil' });
    expect(res.status).toBe(201);
    addedId = res.body.id;
    expect((await api.get(`/api/clients/${ids.otherClient}/machines`).set(auth('otherClient'))).body.data).toHaveLength(1);
  });

  test('machine inexistante : 400 (pas d’erreur 500)', async () => {
    const res = await api.post(`/api/clients/${ids.otherClient}/machines`).set(auth('admin')).send({ machine_id: 9999 });
    expect(res.status).toBe(400);
  });

  test('l’admin change le statut ; le client ne peut pas', async () => {
    const res = await api.patch(`/api/clients/${ids.otherClient}/machines/${addedId}`).set(auth('admin'))
      .send({ status: 'maintenance', last_service_date: '2026-11-05', next_service_date: '2027-05-05' });
    expect(res.status).toBe(200);
    const [row] = await query('SELECT status FROM client_machines WHERE id = ?', [addedId]);
    expect(row.status).toBe('maintenance');
    expect((await api.patch(`/api/clients/${ids.otherClient}/machines/${addedId}`).set(auth('otherClient')).send({ status: 'active' })).status).toBe(403);
  });

  test('client : ne peut pas ajouter de machine (403)', async () => {
    expect((await api.post(`/api/clients/${ids.client}/machines`).set(auth('client')).send({ machine_id: ids.machine })).status).toBe(403);
  });
});

describe('tickets de support', () => {
  test('le client ouvre un ticket', async () => {
    const res = await api.post('/api/clients/tickets').set(auth('client'))
      .send({ subject: 'Écran éteint', description: 'Plus d’affichage depuis ce matin.', category: 'panne', priority: 'urgent', machine_id: ids.machine });
    expect(res.status).toBe(201);
    expect(res.body.ticket_number).toMatch(/^TKT-\d{6}-\d{4}$/);
    const [row] = await query('SELECT client_id, priority FROM support_tickets WHERE id = ?', [res.body.id]);
    expect(row).toEqual({ client_id: ids.client, priority: 'urgent' });
  });

  test('sujet manquant ou catégorie inconnue : 400', async () => {
    expect((await api.post('/api/clients/tickets').set(auth('client')).send({ description: 'x' })).status).toBe(400);
    expect((await api.post('/api/clients/tickets').set(auth('client')).send({ subject: 'x', description: 'x', category: 'autre-chose' })).status).toBe(400);
  });

  test('un admin n’ouvre pas de ticket client : 403', async () => {
    expect((await api.post('/api/clients/tickets').set(auth('admin')).send({ subject: 'x', description: 'x' })).status).toBe(403);
  });

  test('liste : le client voit les siens, l’admin ceux d’un client', async () => {
    expect((await api.get(`/api/clients/${ids.client}/tickets`).set(auth('client'))).body.data).toHaveLength(2);
    expect((await api.get(`/api/clients/${ids.client}/tickets`).set(auth('otherClient'))).body.data).toEqual([]);
    expect((await api.get(`/api/clients/${ids.client}/tickets`).set(auth('admin'))).body.data).toHaveLength(2);
  });
});

describe('factures', () => {
  test('le client voit ses factures, filtre par statut', async () => {
    expect((await api.get(`/api/clients/${ids.client}/invoices`).set(auth('client'))).body.data).toHaveLength(1);
    expect((await api.get(`/api/clients/${ids.client}/invoices?status=overdue`).set(auth('client'))).body.data).toEqual([]);
    expect((await api.get(`/api/clients/${ids.client}/invoices`).set(auth('otherClient'))).body.data).toEqual([]);
  });
});

describe('/api/dashboard', () => {
  test('admin : statistiques et compteurs', async () => {
    const stats = await api.get('/api/dashboard/admin').set(auth('admin'));
    expect(stats.status).toBe(200);
    expect(stats.body.success).toBe(true);
    const counters = await api.get('/api/dashboard/counters').set(auth('admin'));
    expect(counters.status).toBe(200);
    expect(counters.body.data).toBeDefined();
  });

  test('client : tableau de bord et compteurs', async () => {
    const dash = await api.get('/api/dashboard/client').set(auth('client'));
    expect(dash.status).toBe(200);
    const counters = await api.get('/api/dashboard/client/counters').set(auth('client'));
    expect(counters.status).toBe(200);
  });

  test('chacun son tableau de bord', async () => {
    expect((await api.get('/api/dashboard/admin').set(auth('client'))).status).toBe(403);
    expect((await api.get('/api/dashboard/counters').set(auth('client'))).status).toBe(403);
    expect((await api.get('/api/dashboard/client').set(auth('admin'))).status).toBe(403);
    expect((await api.get('/api/dashboard/client/counters').set(auth('admin'))).status).toBe(403);
    expect((await api.get('/api/dashboard/admin')).status).toBe(401);
  });
});
