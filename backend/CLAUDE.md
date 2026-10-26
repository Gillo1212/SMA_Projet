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

## Paiements

### Flux

1. `POST /api/orders` crée la commande. **Le serveur calcule le sous-total, la TVA (18 %) et les frais de port** à partir des prix en base et du `delivery_mode` : les montants envoyés par le client sont ignorés.
2. `POST /api/payments/initiate { order_id }` ouvre une session chez le prestataire et renvoie l'`checkout_url` de redirection.
3. Le prestataire notifie `POST /api/payments/webhook/:provider` — c'est cette notification qui fait foi, pas le retour navigateur.
4. Le frontend interroge `GET /api/payments/status/:reference` le temps que le webhook arrive.

### Prestataires (`services/payment/`)

| Fichier | Rôle |
|---------|------|
| `wave.provider.js` | Wave Checkout, signature webhook HMAC-SHA256 |
| `orangeMoney.provider.js` | Orange Money WebPay (OAuth + `notif_token`) |
| `simulator.provider.js` | Repli développement — refusé si `NODE_ENV=production` |
| `index.js` | Choix du prestataire et repli automatique |

Sans clés configurées, `getProvider()` retombe sur le simulateur : le tunnel reste parcourable en développement, via la page frontend `/paiement/simulation`.

### Garanties

- **Idempotence** : un webhook rejoué n'applique rien une seconde fois.
- **Contrôle de montant** : si le prestataire annonce une somme différente de celle attendue, la transaction est marquée `failed` et la commande reste impayée.
- **Cloisonnement** : un client ne peut ni payer ni consulter la commande d'un autre.
- **Corps brut** : `express.json({ verify })` conserve les octets reçus, indispensable pour valider la signature Wave.

### Variables d'environnement

Voir `.env.example`, section Paiement : `BACKEND_URL`, `WAVE_API_KEY`, `WAVE_WEBHOOK_SECRET`, `ORANGE_MONEY_CLIENT_ID` / `_SECRET` / `_MERCHANT_KEY`.

> Les URL et formats de payload des deux prestataires proviennent de leur documentation publique. **À confirmer avec la documentation de votre contrat marchand** avant la mise en production : ces intégrations n'ont pas été testées contre les API réelles.

## Paramètres de la plateforme

- Table `settings` (clé → valeur), lue via `services/settings.service.js`. **Seules les clés déclarées dans `DEFINITIONS` sont acceptées**, chacune avec une valeur par défaut et un validateur : pour ajouter un paramètre, le déclarer là.
- `getShopConfig()` fournit les règles de calcul d'une commande : `taxRate` (en %), `delivery.{pickup,standard,express}.{enabled,fee}`, `freeShippingThreshold` (0 = désactivé, livraison standard uniquement).
- Routes : `GET /api/settings/public` (public), `GET /api/settings` (admin), `PUT /api/settings` (`super_admin`, `admin`). Codes promo : CRUD `/api/promo-codes`.
- `orders.create` fige `delivery_mode` et `tax_rate` sur la commande : changer un paramètre ne réécrit pas l'historique.
- Le frontend réplique le calcul dans `frontend/src/utils/orderTotals.ts` : toute modification de la formule doit être faite **des deux côtés**.
- **Secrets** (clé déclarée avec `secret: true`, ex. `smtp_pass`) : chiffrés via `lib/secrets.js` (AES-256-GCM, clé `SETTINGS_SECRET` ou `JWT_SECRET`), jamais renvoyés au navigateur (`getAllForAdmin()` les remplace par `<clé>_set`). Une valeur vide en PUT conserve le secret existant.
- **Email** : fournisseurs `smtp` (Gmail en dev), `gmail`, `sendgrid` (prod). `getSmtpConfig()` prend toute la configuration du back-office dès que `email_provider` y est choisi, sinon tout le `.env` (`EMAIL_PROVIDER`). SendGrid passe par son relais SMTP (`smtp.sendgrid.net:587`, utilisateur `apikey`, mot de passe = clé API) : un seul transport nodemailer pour tous. `problems` signale une configuration incomplète (clé absente, expéditeur manquant) ; le résumé est journalisé au démarrage, en erreur si `NODE_ENV=production`. Le transport est reconstruit à chaque changement (`settings.onChange`). Test : `POST /api/settings/smtp/test`.
- **Passage en production sur SendGrid** : `EMAIL_PROVIDER=sendgrid`, `SENDGRID_API_KEY` (permission « Mail Send ») et `EMAIL_FROM` vérifié dans SendGrid (Sender Authentication), puis redémarrer.
- **Notifications équipe** : `services/adminNotifications.service.js` (nouvelle commande, devis, client, stock faible), selon les clés `notif_*`. Toujours non bloquantes.
- **Comptes admin** : `/api/settings/admins` (écriture `super_admin`) ; on ne peut ni se désactiver, ni se supprimer, ni changer son propre rôle.

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
