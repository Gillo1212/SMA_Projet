# SMALIM Backend - Node.js + MySQL

API REST complète pour la plateforme SMALIM.

## Stack technique
- **Runtime** : Node.js 18+
- **Framework** : Express.js 4
- **Base de données** : MySQL 8.0+
- **Auth** : JWT (access token + refresh token)
- **Sécurité** : Helmet, CORS, Rate Limiting, bcrypt

---

## Installation & Démarrage

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Copier et configurer les variables d'environnement
cp .env.example .env
# → Éditer .env avec vos identifiants MySQL

# 4. Créer la base de données et les tables
npm run migrate

# 5. Insérer les données de démo
npm run seed

# 6. Démarrer le serveur en développement
npm run dev

# OU en production
npm start
```

Le serveur démarre sur **http://localhost:5000**

---

## Comptes de démo (après seed)

| Type | Email | Mot de passe |
|---|---|---|
| Super Admin | admin@smalim.sn | Admin@2024! |
| Client | amadou@sonatel.sn | client2024 |

---

## Endpoints API

### Auth - `/api/auth`
| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/admin/login` | Connexion admin | Non |
| POST | `/client/login` | Connexion client | Non |
| POST | `/client/register` | Inscription client | Non |
| POST | `/refresh` | Renouveler le token | Non |
| GET | `/me` | Profil connecté | Oui |
| PATCH | `/change-password` | Changer mot de passe | Oui |

### Machines - `/api/machines`
| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Liste (filtres: category, search, active, featured) | Non |
| GET | `/categories` | Catégories | Non |
| GET | `/slug/:slug` | Détail par slug | Non |
| GET | `/:id` | Détail par ID | Non |
| POST | `/` | Créer | Admin |
| PUT | `/:id` | Modifier | Admin |
| DELETE | `/:id` | Supprimer | Admin |

### Produits - `/api/products`
Mêmes routes que Machines.

### Commandes - `/api/orders`
| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Liste (admin: toutes, client: les siennes) | Oui |
| GET | `/:id` | Détail avec items + tracking | Oui |
| POST | `/` | Créer une commande | Oui |
| PATCH | `/:id/status` | Changer statut | Admin |
| POST | `/validate-promo` | Valider un code promo | Non |

### Devis - `/api/quotes`
| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Liste | Oui |
| POST | `/` | Soumettre un devis | Optionnel |
| PATCH | `/:id/status` | Mettre à jour statut | Oui |
| DELETE | `/:id` | Supprimer | Admin |

### Clients - `/api/clients`
| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Liste clients | Admin |
| GET | `/:id` | Détail client | Oui |
| PUT | `/:id` | Modifier profil | Oui |
| PATCH | `/:id/toggle-active` | Activer/Désactiver | Admin |
| GET | `/:id/machines` | Parc machines client | Oui |
| POST | `/:id/machines` | Ajouter machine | Admin |
| GET | `/:id/tickets` | Tickets support | Oui |
| POST | `/tickets` | Créer ticket | Client |
| GET | `/:id/invoices` | Factures | Oui |

### Blog - `/api/blog`
| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Articles (publiés pour public, tous pour admin) | Optionnel |
| GET | `/categories` | Catégories | Non |
| GET | `/:slug` | Détail article | Optionnel |
| POST | `/` | Créer article | Admin |
| PUT | `/:id` | Modifier | Admin |
| DELETE | `/:id` | Supprimer | Admin |

### Dashboard - `/api/dashboard`
| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/admin` | Stats complètes admin (KPIs, revenus, commandes) | Admin |
| GET | `/client` | Dashboard client (machines, commandes, factures) | Client |

---

## Structure du projet

```
backend/
├── server.js              # Point d'entrée
├── .env.example           # Variables d'environnement
├── config/
│   └── database.js        # Pool MySQL + helpers
├── middleware/
│   ├── auth.js            # JWT middleware
│   └── errorHandler.js    # Gestionnaire d'erreurs
├── controllers/           # Logique métier
│   ├── auth.controller.js
│   ├── machines.controller.js
│   ├── products.controller.js
│   ├── orders.controller.js
│   ├── quotes.controller.js
│   ├── clients.controller.js
│   ├── blog.controller.js
│   └── dashboard.controller.js
├── routes/                # Routes Express
│   ├── auth.js
│   ├── machines.js
│   ├── products.js
│   ├── orders.js
│   ├── quotes.js
│   ├── clients.js
│   ├── blog.js
│   └── dashboard.js
└── sql/
    ├── schema.sql         # Schéma complet MySQL
    ├── migrate.js         # Script de migration
    └── seed.js            # Données de démo
```

---

## Connexion Frontend ↔ Backend

Dans le frontend React, mettre à jour `src/config/api.ts` :
```typescript
export const API_BASE_URL = 'http://localhost:5000/api';
```

---

## Sécurité
- Tous les mots de passe hashés avec **bcrypt (12 rounds)**
- Tokens JWT signés avec secret fort
- Rate limiting : 200 req/15min (général), 10 req/15min (auth)
- CORS restreint au domaine frontend
- Headers sécurisés via Helmet
- RLS appliqué au niveau des controllers (clients ne voient que leurs données)
