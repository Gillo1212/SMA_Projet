/** /api/contact (messages du site) et /api/newsletter — base de test réelle */
const { api, resetDatabase, closeDatabase, auth, query, outbox } = require('./setup');

beforeAll(resetDatabase);
afterAll(closeDatabase);

const wait = (ms = 150) => new Promise(r => setTimeout(r, ms));
const message = (overrides = {}) => ({
  name: 'Fatou Ndiaye',
  email: 'fatou@prospect.test',
  phone: '+221 77 000 00 09',
  subject: 'Information produit',
  message: 'Bonjour,\nquel est le délai pour une machine à café ? Budget : 500 $& plus.',
  ...overrides,
});

describe('POST /api/contact (public)', () => {
  test('message enregistré ; l’équipe est prévenue et le visiteur reçoit un accusé de réception', async () => {
    await api.put('/api/settings').set(auth('admin')).send({ notif_admin_email: 'equipe@smalim.test', notif_new_contact: '1' });
    outbox.length = 0;

    const res = await api.post('/api/contact').send(message());
    expect(res.status).toBe(201);
    const [row] = await query('SELECT name, email, phone, subject, message, status FROM contact_messages WHERE id = ?', [res.body.data.id]);
    expect(row).toMatchObject({ name: 'Fatou Ndiaye', email: 'fatou@prospect.test', status: 'new', subject: 'Information produit' });

    await wait();
    const recipients = outbox.map(m => m.to);
    expect(recipients).toEqual(expect.arrayContaining(['equipe@smalim.test', 'fatou@prospect.test']));
    const ack = outbox.find(m => m.to === 'fatou@prospect.test');
    // Message recopié tel quel : retours à la ligne conservés, « $& » non interprété
    expect(ack.html).toContain('Bonjour,<br />quel est le délai');
    expect(ack.html).toContain('500 $&amp; plus');
  });

  test('HTML du visiteur échappé dans l’accusé de réception', async () => {
    outbox.length = 0;
    await api.post('/api/contact').send(message({ email: 'xss@prospect.test', message: '<script>alert(1)</script>' }));
    await wait();
    const ack = outbox.find(m => m.to === 'xss@prospect.test');
    expect(ack.html).not.toContain('<script>');
    expect(ack.html).toContain('&lt;script&gt;');
  });

  test('notification équipe désactivée : seul l’accusé de réception part', async () => {
    await api.put('/api/settings').set(auth('admin')).send({ notif_new_contact: '0' });
    outbox.length = 0;
    await api.post('/api/contact').send(message({ email: 'calme@prospect.test' }));
    await wait();
    expect(outbox.map(m => m.to)).toEqual(['calme@prospect.test']);
    await api.put('/api/settings').set(auth('admin')).send({ notif_new_contact: '1' });
  });

  test('champs manquants ou invalides : 400', async () => {
    for (const body of [message({ name: '' }), message({ email: 'pas-un-email' }), message({ message: '' }), message({ phone: 'abc' }), message({ message: 'x'.repeat(5001) })]) {
      expect((await api.post('/api/contact').send(body)).status).toBe(400);
    }
  });

  test('robot (champ piège rempli) : réponse normale, rien d’enregistré ni envoyé', async () => {
    const before = (await query('SELECT COUNT(*) AS n FROM contact_messages'))[0].n;
    outbox.length = 0;
    const res = await api.post('/api/contact').send(message({ website: 'http://spam.test' }));
    expect(res.status).toBe(201);
    await wait();
    expect((await query('SELECT COUNT(*) AS n FROM contact_messages'))[0].n).toBe(before);
    expect(outbox).toEqual([]);
  });
});

describe('messages dans le back-office', () => {
  let id;

  test('liste : équipe seulement ; compteurs par statut ; pastille du menu', async () => {
    expect((await api.get('/api/contact')).status).toBe(401);
    expect((await api.get('/api/contact').set(auth('client'))).status).toBe(403);
    const res = await api.get('/api/contact').set(auth('commercial'));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.counts.new).toBe(3);
    id = res.body.data.find(m => m.email === 'fatou@prospect.test').id;
    expect((await api.get('/api/dashboard/counters').set(auth('admin'))).body.data.contact_new).toBe(3);
  });

  test('recherche et filtre de statut', async () => {
    expect((await api.get('/api/contact?search=xss').set(auth('admin'))).body.data).toHaveLength(1);
    expect((await api.get('/api/contact?status=replied').set(auth('admin'))).body.data).toEqual([]);
  });

  test('marquer lu puis répondu, avec une note : qui et quand sont enregistrés', async () => {
    await api.patch(`/api/contact/${id}`).set(auth('commercial')).send({ status: 'read' });
    const res = await api.patch(`/api/contact/${id}`).set(auth('admin')).send({ status: 'replied', admin_note: 'Rappelée le 9/11' });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'replied', admin_note: 'Rappelée le 9/11', handled_by_name: 'Adama Admin' });
    expect(res.body.data.handled_at).not.toBeNull();
    expect((await api.get('/api/dashboard/counters').set(auth('admin'))).body.data.contact_new).toBe(2);
  });

  test('archivé : masqué par défaut, visible avec le filtre', async () => {
    await api.patch(`/api/contact/${id}`).set(auth('admin')).send({ status: 'archived' });
    expect((await api.get('/api/contact').set(auth('admin'))).body.data.map(m => m.id)).not.toContain(id);
    expect((await api.get('/api/contact?status=archived').set(auth('admin'))).body.data.map(m => m.id)).toEqual([id]);
    expect((await api.get('/api/contact?status=all').set(auth('admin'))).body.data).toHaveLength(3);
  });

  test('statut invalide : 400 ; message inconnu : 404', async () => {
    expect((await api.patch(`/api/contact/${id}`).set(auth('admin')).send({ status: 'perdu' })).status).toBe(400);
    expect((await api.patch('/api/contact/9999').set(auth('admin')).send({ status: 'read' })).status).toBe(404);
  });

  test('suppression : administrateurs seulement', async () => {
    expect((await api.delete(`/api/contact/${id}`).set(auth('commercial'))).status).toBe(403);
    expect((await api.delete(`/api/contact/${id}`).set(auth('admin'))).status).toBe(200);
    expect((await api.delete(`/api/contact/${id}`).set(auth('admin'))).status).toBe(404);
  });
});

describe('newsletter', () => {
  const tokenOf = async email => (await query('SELECT unsubscribe_token FROM newsletter_subscribers WHERE email = ?', [email]))[0]?.unsubscribe_token;

  test('inscription : enregistrée, email de bienvenue avec lien de désinscription', async () => {
    outbox.length = 0;
    const res = await api.post('/api/newsletter/subscribe').send({ email: 'Lecteur@Exemple.test', locale: 'fr' });
    expect(res.status).toBe(201);
    const [row] = await query("SELECT email, status, source FROM newsletter_subscribers WHERE email = 'lecteur@exemple.test'");
    expect(row).toEqual({ email: 'lecteur@exemple.test', status: 'subscribed', source: 'footer' });
    await wait();
    const token = await tokenOf('lecteur@exemple.test');
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(outbox[0].to).toBe('lecteur@exemple.test');
    expect(outbox[0].html).toContain(`/newsletter/desinscription?token=${token}`);
  });

  test('déjà inscrit : même réponse, pas de doublon ni de second email', async () => {
    outbox.length = 0;
    const res = await api.post('/api/newsletter/subscribe').send({ email: 'lecteur@exemple.test' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Inscription enregistrée');
    await wait();
    expect(outbox).toEqual([]);
    expect((await query("SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE email = 'lecteur@exemple.test'"))[0].n).toBe(1);
  });

  test('email invalide : 400 ; robot : ignoré', async () => {
    expect((await api.post('/api/newsletter/subscribe').send({ email: 'nope' })).status).toBe(400);
    await api.post('/api/newsletter/subscribe').send({ email: 'robot@spam.test', website: 'x' });
    expect(await tokenOf('robot@spam.test')).toBeUndefined();
  });

  test('désinscription par le lien : faite une fois, lien inconnu 404', async () => {
    const token = await tokenOf('lecteur@exemple.test');
    const res = await api.post('/api/newsletter/unsubscribe').send({ token });
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('lecteur@exemple.test');
    const [row] = await query("SELECT status, unsubscribed_at FROM newsletter_subscribers WHERE email = 'lecteur@exemple.test'");
    expect(row.status).toBe('unsubscribed');
    expect(row.unsubscribed_at).not.toBeNull();
    expect((await api.post('/api/newsletter/unsubscribe').send({ token })).status).toBe(200); // second clic sans erreur
    expect((await api.post('/api/newsletter/unsubscribe').send({ token: 'a'.repeat(64) })).status).toBe(404);
    expect((await api.post('/api/newsletter/unsubscribe').send({ token: 'court' })).status).toBe(400);
  });

  test('réinscription : de nouveau inscrit, nouveau lien (l’ancien ne marche plus)', async () => {
    const old = await tokenOf('lecteur@exemple.test');
    expect((await api.post('/api/newsletter/subscribe').send({ email: 'lecteur@exemple.test' })).status).toBe(201);
    const fresh = await tokenOf('lecteur@exemple.test');
    expect(fresh).not.toBe(old);
    expect((await api.post('/api/newsletter/unsubscribe').send({ token: old })).status).toBe(404);
  });

  test('back-office : liste et compteurs ; client 403', async () => {
    await api.post('/api/newsletter/subscribe').send({ email: 'deuxieme@exemple.test' });
    expect((await api.get('/api/newsletter').set(auth('client'))).status).toBe(403);
    const res = await api.get('/api/newsletter').set(auth('commercial'));
    expect(res.status).toBe(200);
    expect(res.body.counts).toEqual({ subscribed: 2, unsubscribed: 0 });
    expect(res.body.data[0].unsubscribe_token).toBeUndefined();
    expect((await api.get('/api/newsletter?search=deux').set(auth('admin'))).body.data).toHaveLength(1);
  });

  test('désinscrire depuis le back-office, puis export CSV des inscrits seulement', async () => {
    const id = (await api.get('/api/newsletter?search=deux').set(auth('admin'))).body.data[0].id;
    expect((await api.patch(`/api/newsletter/${id}`).set(auth('admin')).send({ status: 'unsubscribed' })).body.data.status).toBe('unsubscribed');

    const csv = await api.get('/api/newsletter/export').set(auth('admin'));
    expect(csv.status).toBe(200);
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    expect(csv.headers['content-disposition']).toMatch(/attachment; filename="newsletter-smalim-\d{4}-\d{2}-\d{2}\.csv"/);
    const lines = csv.text.replace(/^﻿/, '').trim().split('\r\n');
    expect(lines[0]).toBe('"email";"statut";"source";"langue";"inscrit_le";"desinscrit_le"');
    expect(lines.slice(1).map(l => l.split(';')[0])).toEqual(['"lecteur@exemple.test"']);
    expect((await api.get('/api/newsletter/export?status=all').set(auth('admin'))).text.trim().split('\r\n')).toHaveLength(3);
  });

  test('export : une adresse qui ressemble à une formule de tableur est neutralisée', async () => {
    await query("INSERT INTO newsletter_subscribers (email, unsubscribe_token) VALUES ('=cmd@exemple.test', REPEAT('b', 64))");
    const csv = await api.get('/api/newsletter/export').set(auth('admin'));
    expect(csv.text).toContain(`"'=cmd@exemple.test"`);
  });

  test('suppression (effacement des données) : administrateurs seulement', async () => {
    const id = (await api.get('/api/newsletter?search=deux').set(auth('admin'))).body.data[0].id;
    expect((await api.delete(`/api/newsletter/${id}`).set(auth('commercial'))).status).toBe(403);
    expect((await api.delete(`/api/newsletter/${id}`).set(auth('admin'))).status).toBe(200);
    expect((await api.patch(`/api/newsletter/${id}`).set(auth('admin')).send({ status: 'subscribed' })).status).toBe(404);
  });
});
