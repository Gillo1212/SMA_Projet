# SMALIM — Site e-commerce et back-office pour un réseau de distributeurs automatiques

Plateforme web développée pour **SenMartALIM** (Sénégal), entreprise qui exploite des distributeurs automatiques de boissons et de snacks : un site public avec boutique en ligne et un back-office de gestion, reliés à une API REST.

> 🇬🇧 *E-commerce website and admin back-office for a vending machine business in Senegal: React + TypeScript front end, Node.js/Express REST API, MySQL, and Wave mobile money checkout.*

## Fonctionnalités

**Site public**
- Catalogue de produits et présentation des machines
- Panier, tunnel de commande et paiement en ligne
- Espace client : inscription, connexion, confirmation d'e-mail, mot de passe oublié, historique des commandes
- Blog, newsletter, formulaire de contact et demandes de devis
- Interface bilingue français / anglais (i18n)

**Back-office**
- Tableau de bord de l'activité
- Gestion des produits, machines, commandes, clients, devis et messages
- Gestion du blog, de la newsletter et des paramètres du site
- API de codes promo
- Rôles administrateurs (super admin, admin, commercial)

**Paiement**
- Intégration de l'**API Checkout de Wave** : création de session, webhooks signés (HMAC) et contre-vérification de chaque paiement
- Connecteur Orange Money codé (désactivé pour le moment) et simulateur de paiement pour le développement

## Stack technique

| Partie | Technologies |
|---|---|
| Front-end | React 19, TypeScript, Vite, Tailwind CSS, React Router, i18next |
| Back-end | Node.js, Express 4, MySQL 8, JWT (access + refresh token), Nodemailer, Multer |
| Sécurité | bcrypt, Helmet, CORS, limitation de débit, validation des entrées (express-validator) |
| Tests | Jest et Supertest (tests unitaires et tests d'API) |

## Structure

```
SMA_Projet/
├── frontend/   # Site public et back-office (React + TypeScript)
├── backend/    # API REST (Node.js + Express + MySQL)
│   ├── controllers/  routes/  middleware/  services/payment/
│   ├── sql/          # schéma, migration et données de démonstration
│   └── tests/        # tests unitaires et d'API
└── SMALIM.postman_collection.json   # collection Postman de l'API
```

## Démarrage

```bash
# API
cd backend
npm install
cp .env.example .env   # renseigner les accès MySQL et les clés de paiement
npm run migrate && npm run seed
npm run dev            # http://localhost:5000

# Front-end
cd ../frontend
npm install
npm run dev
```

La documentation détaillée des endpoints se trouve dans [`backend/README.md`](backend/README.md).

---
Développé par **Gilbert NADIELINE** — [LinkedIn](https://www.linkedin.com/in/gilbert-nadieline)
