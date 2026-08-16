# CLAUDE.md - Backend SMALIM

## Vue d'ensemble

API REST Express.js servant de backend à la plateforme SMALIM. Connectée à une base MySQL `smalim_db`.

## Structure des fichiers

```
backend/
├── server.js                   # Point d'entrée Express (middleware, routes)
├── config/
│   └── database.js             # Pool MySQL, helpers query/transaction
├── middleware/
│   ├── auth.js                 # JWT : authenticate, requireAdmin, requireClient
│   └── errorHandler.js         # Gestionnaire d'erreurs global
├── controllers/                # Logique métier
│   ├── auth.controller.js
│   ├── machines.controller.js
│   ├── products.controller.js
│   ├── orders.controller.js
│   ├── quotes.controller.js
│   ├── clients.controller.js
│   ├── blog.controller.js
│   └── dashboard.controller.js
├── routes/                     # Définitions des routes
├── services/
│   └── email.service.js        # Envoi d'emails (SMTP)
├── sql/
│   ├── schema.sql              # Schéma complet MySQL
│   ├── migrate.js              # Script d'initialisation BDD
│   └── seed.js                 # Données de démonstration
├── lib/
│   └── utils.js                # Fonctions utilitaires
├── templates/                  # Templates d'emails
└── uploads/                    # Fichiers uploadés
```

## Base de données

**Nom :** `smalim_db`

### Tables principales

| Table | Description |
|-------|-------------|
| `admins` | Comptes admin (rôles: super_admin, admin, commercial) |
| `clients` | Comptes clients avec infos entreprise |
| `machines` | Produits machines avec stock, prix, images |
| `machine_categories` | Catégories de machines |
| `products` | Consommables avec stock, prix |
| `product_categories` | Catégories de consommables |
| `orders` | Commandes avec statut de paiement/livraison |
| `order_items` | Lignes de commande |
| `order_tracking` | Historique de statut des commandes |
| `quotes` | Demandes de devis |
| `client_machines` | Flotte de machines installées chez les clients |
| `invoices` | Factures (invoice / credit_note / proforma) |
| `support_tickets` | Tickets de support client |
| `ticket_messages` | Messages dans les tickets |
| `blog_categories` | Catégories d'articles |
| `blog_articles` | Articles (draft / published / archived) |
| `promo_codes` | Codes promotionnels (percentage / fixed) |

### Helpers disponibles dans `config/database.js`

```js
const { query, transaction, queryOne, queryCount } = require('./config/database');

// Requête simple
const rows = await query('SELECT * FROM machines WHERE active = ?', [1]);

// Requête qui retourne un seul enregistrement
const machine = await queryOne('SELECT * FROM machines WHERE id = ?', [id]);

// Transaction
await transaction(async (conn) => {
  await conn.query('INSERT INTO orders ...', [...]);
  await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [qty, id]);
});
```

## Authentification

### Middleware disponibles (`middleware/auth.js`)

```js
authenticate        // Valide le JWT (admin ou client)
requireAdmin        // Restreint aux admins (tous rôles)
requireSuperAdmin   // Restreint au rôle super_admin uniquement
requireClient       // Restreint aux clients
optionalAuth        // Auth si token présent, sinon continue
```

### Format du token JWT

```json
{
  "id": 1,
  "email": "admin@smalim.sn",
  "role": "super_admin",        // Pour admins
  "type": "admin"               // "admin" ou "client"
}
```

### Usage dans les routes

```js
router.get('/admin/data', authenticate, requireAdmin, controller.method);
router.post('/client/order', authenticate, requireClient, controller.method);
router.get('/public/blog', optionalAuth, controller.method);
```

## Sécurité

- **Mots de passe** : bcryptjs, 12 rounds - ne jamais retourner le hash dans les réponses
- **CORS** : limité à l'origine frontend (configurable via `FRONTEND_URL` dans `.env`)
- **Rate limiting** : 200 req/15min général, 10 req/15min sur les routes auth
- **Helmet** : headers HTTP de sécurité activés
- **Validation** : express-validator sur tous les inputs utilisateur

## Conventions de réponse API

```js
// Succès
res.json({ data: result, message: "Action réussie" });

// Erreur client (400, 401, 403, 404)
res.status(400).json({ error: "Message explicite" });

// Erreur serveur (500) - ne pas exposer les détails en production
res.status(500).json({ error: "Erreur interne du serveur" });
```

## Uploads de fichiers

- Middleware : `multer`
- Répertoire : `uploads/`
- Taille max : 10MB
- Servis via : `GET /uploads/:filename` (Express static)
- Types acceptés : images (jpg, jpeg, png, webp, gif)

## Scripts npm

```bash
npm run dev        # Démarrer avec nodemon (rechargement auto)
npm start          # Démarrer en mode production
npm run migrate    # Créer/mettre à jour la BDD depuis schema.sql
npm run seed       # Charger les données de démonstration
```

## Ajouter une nouvelle ressource

1. Créer `controllers/maRessource.controller.js` avec les méthodes CRUD
2. Créer `routes/maRessource.js` avec les routes et middleware d'auth appropriés
3. Monter la route dans `server.js` : `app.use('/api/ma-ressource', maRessourceRoutes)`
4. Ajouter les tables nécessaires dans `sql/schema.sql`

## Variables d'environnement requises

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smalim_db
JWT_SECRET=votre_secret_jwt_fort
FRONTEND_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
STRIPE_SECRET_KEY=
```
