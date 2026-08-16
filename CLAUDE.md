# CLAUDE.md - SMA-PROJECT (SMALIM)

## Présentation du projet

**SMALIM** est une plateforme e-commerce B2B full-stack destinée à la vente d'équipements industriels (distributeurs automatiques, machines à café, machines à glace, équipements de réfrigération) et de consommables associés (gobelets, café, snacks, pièces détachées) sur le marché sénégalais.

## Architecture générale

```
SMA-PROJECT/
├── backend/     # API REST Node.js/Express + MySQL
└── frontend/    # Application React TypeScript (Vite)
```

**Communication :** Frontend (port 5173) → Backend API (port 5000) via `http://localhost:5000/api`

## Stack technologique

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js, Express 4.18, MySQL 8 |
| Frontend | React 19, TypeScript 5.8, Vite 7 |
| Style | Tailwind CSS 3 |
| Auth | JWT (access + refresh tokens, 7j) |
| Paiement | Stripe, Wave, Orange Money |
| Email | SMTP via nodemailer |
| i18n | i18next (FR/EN) |

## Fonctionnalités principales

- **Catalogue** : machines industrielles + consommables avec catégories, filtres, slugs
- **Authentification double** : portail admin (super_admin / admin / commercial) + portail client
- **Commandes** : panier, checkout, suivi de statut, codes promo
- **Devis** : système de demande de devis pour commandes personnalisées
- **Gestion client** : flotte de machines installées, factures, tickets support
- **Blog CMS** : articles avec catégories, statut draft/published/archived
- **Dashboard admin** : KPIs, revenus, statistiques
- **Internationalisation** : FR/EN

## Démarrage rapide

```bash
# Backend
cd backend
cp .env.example .env   # Configurer les variables
npm install
npm run migrate        # Créer la BDD et les tables
npm run seed           # Charger les données de démonstration
npm run dev            # Démarrer sur le port 5000

# Frontend
cd frontend
npm install
npm run dev            # Démarrer sur le port 5173
```

## Comptes de démonstration (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | admin@smalim.sn | Admin@2024! |
| Client | amadou@sonatel.sn | client2024 |

## Variables d'environnement critiques

Voir `backend/.env.example` pour la liste complète. Les clés essentielles :
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - connexion MySQL
- `JWT_SECRET` - secret de signature des tokens JWT
- `SMTP_*` - configuration email
- `STRIPE_SECRET_KEY` - clé Stripe

## Conventions importantes

- **Langue du code** : anglais (variables, fonctions, commentaires techniques)
- **API** : RESTful, base `/api`, JSON uniquement
- **Erreurs backend** : toujours retourner `{ error: "message" }` avec le bon code HTTP
- **Sécurité** : ne jamais exposer les hash de mots de passe dans les réponses API
- **Uploads** : fichiers stockés dans `backend/uploads/`, servis via `/uploads` (Express static)

## Liens vers les guides détaillés

- [Guide Backend](./backend/CLAUDE.md)
- [Guide Frontend](./frontend/CLAUDE.md)
