# CLAUDE.md - Frontend SMALIM

## Vue d'ensemble

Application React 19 TypeScript construite avec Vite 7. Interface utilisateur double : portail admin et espace client, plus un site public.

## Structure des fichiers

```
frontend/src/
├── App.tsx                     # Composant racine (providers)
├── config/
│   └── api.ts                  # Constantes d'endpoints API
├── contexts/
│   ├── AuthContext.tsx          # Auth admin (JWT)
│   ├── ClientAuthContext.tsx    # Auth client (JWT)
│   └── CartContext.tsx          # Panier d'achats
├── services/                   # Couche API (axios)
│   ├── apiClient.ts            # Client axios configuré
│   ├── auth.service.ts
│   ├── machines.service.ts
│   ├── products.service.ts
│   ├── orders.service.ts
│   ├── quotes.service.ts
│   ├── clients.service.ts
│   ├── blog.service.ts
│   └── dashboard.service.ts
├── hooks/                      # Custom React hooks
├── pages/                      # Pages (lazy-loaded)
│   ├── home/
│   ├── machines/               # Catalogue + détail + comparateur + devis
│   ├── produits/               # Catalogue consommables
│   ├── panier/                 # Panier
│   ├── checkout/               # Paiement
│   ├── blog/
│   ├── contact/
│   ├── connexion/              # Login admin
│   ├── inscription/            # Inscription client
│   ├── admin/                  # Dashboard admin complet
│   └── espace-client/          # Portail client
├── components/                 # Composants réutilisables
├── types/                      # Types TypeScript
├── i18n/
│   └── local/                  # Fichiers de traduction FR/EN
├── mocks/                      # Données mock pour le développement
│   ├── machines.ts
│   ├── products.ts
│   ├── admin.ts
│   ├── clientPortal.ts
│   └── blog.ts
├── router/
│   ├── config.tsx              # Définition des routes (lazy imports)
│   └── index.ts
└── styles/                     # Styles globaux
```

## Alias de chemin

L'alias `@` pointe vers `./src`. Utiliser dans les imports :

```ts
import { useAuth } from '@/contexts/AuthContext';
import { MachineCard } from '@/components/MachineCard';
```

## Authentification

### Deux contextes séparés

```tsx
// Pour les pages admin
import { useAuth } from '@/contexts/AuthContext';
const { user, login, logout, isAuthenticated } = useAuth();

// Pour les pages client
import { useClientAuth } from '@/contexts/ClientAuthContext';
const { client, login, logout, isAuthenticated } = useClientAuth();
```

### Protection des routes

- Routes admin : wrappées avec le contexte `AuthContext`
- Routes client : wrappées avec `ClientAuthContext`
- Redirection automatique si non authentifié

## Appels API

### Client axios (`services/apiClient.ts`)

Le client est pré-configuré avec :
- Base URL : `VITE_API_URL` (défaut : `http://localhost:5000/api`)
- Injection automatique du token JWT dans les headers
- Gestion des erreurs 401 (refresh token ou logout)

### Pattern d'utilisation des services

```ts
import { machinesService } from '@/services/machines.service';

// Dans un composant ou hook
const machines = await machinesService.getAll({ category: 'coffee', active: true });
const machine = await machinesService.getBySlug('machine-a-cafe-pro');
```

## Internationalisation

```tsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <h1>{t('home.hero.titleLine1')}</h1>;
```

**Français par défaut** et langue de repli. Le choix de l'utilisateur est persisté en localStorage (`smalim_language`) et prime sur la langue du navigateur.

### Organisation des fichiers

`src/i18n/local/<lang>/<domaine>.ts` — un module par domaine, fusionné en profondeur au chargement :

| Fichier | Contenu |
|---------|---------|
| `common.ts` | navigation, pied de page, libellés partagés |
| `home.ts` | page d'accueil |
| `shop.ts` | catalogues, panier, blog |
| `checkout.ts` | tunnel de commande et retour de paiement |
| `pages.ts` | catalogue produits, fiche produit, contact |
| `machineDetail.ts` | fiche machine, comparateur, demande de devis |
| `marketing.ts` | sections Features / About / Testimonials de l'accueil |
| `about.ts` | page « Qui sommes-nous », page 404 |
| `auth.ts` | connexion, inscription, mot de passe, confirmation d'email |
| `clientPortal.ts` | espace client + libellés des statuts (`statuses.*`) |

Chaque module exporte un objet **imbriqué** dont la première clé est la section (`nav`, `cart`, `checkout`…).

### Règles

- Toute clé ajoutée dans `fr/` doit l'être dans `en/`, à l'identique.
- Ne pas traduire les noms propres (Wave, Orange Money, Sénégal, SMALIM).
- Pour un texte coupé par un `<br />`, découper en clés numérotées (`titleLine1`, `titleLine2`) plutôt que d'insérer du HTML dans la traduction.

### Vérifier la cohérence

Deux contrôles utiles avant de livrer : comparer les clés `fr/` et `en/` (aucune ne doit manquer d'un côté), et vérifier que chaque `t('…')` du code correspond à une clé définie.

### Statuts

Les services convertissent les statuts du backend en valeurs françaises (« Livrée », « Payée »…), utilisées pour les couleurs et les filtres. Ne pas les traduire dans les services : passer par `useStatusLabels()` (`src/i18n/useStatusLabels.ts`) au moment de l'affichage.

```tsx
const status = useStatusLabels();
<span>{status.order(order.statut)}</span>
```

### État de la traduction

Traduits : tout le site public, les pages d'authentification et l'espace client.

**Restent en français** : le portail admin (outil interne, choix assumé), la page de simulation de paiement (outil de dev), les messages d'erreur renvoyés par le backend et les données du catalogue.

## Sélecteur de langue

`components/feature/LanguageSwitcher.tsx`, intégré à la navbar et à l'en-tête de l'espace client. La prop `variant` adapte les couleurs au fond (`light` sur la navbar transparente en haut de page).

## Panier

```tsx
import { useCart } from '@/contexts/CartContext';

const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCart();
```

## Données mock

Le dossier `src/mocks/` contient des données statiques pour le développement sans backend. Utiliser pendant le développement d'une nouvelle page avant que l'API soit prête.

## Auto-imports Vite

Configurés dans `vite.config.ts` - pas besoin d'importer manuellement :
- `useState`, `useEffect`, `useCallback`, etc. (React hooks)
- `useNavigate`, `useParams`, `Link` (react-router)

## Scripts npm

```bash
npm run dev          # Démarrer le serveur de dev (port 5173)
npm run build        # Build production vers dist/
npm run preview      # Prévisualiser le build de production
npm run lint         # ESLint
npm run type-check   # Vérification TypeScript (tsc --noEmit)
```

## Variables d'environnement

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Conventions de code

- **Composants** : PascalCase, un fichier par composant
- **Hooks personnalisés** : préfixe `use`, dans `src/hooks/`
- **Types** : définis dans `src/types/`, importer via `@/types/`
- **Services** : toujours async/await, jamais d'appel axios direct dans les composants
- **Tailwind** : utilitaires CSS uniquement, pas de fichiers CSS custom sauf `styles/`

## Ajouter une nouvelle page

1. Créer `pages/ma-page/MaPage.tsx`
2. Ajouter le lazy import dans `router/config.tsx`
3. Définir la route dans la config du router
4. Créer le service API correspondant dans `services/` si nécessaire
5. Ajouter les types dans `types/`

## Pages admin (`/admin/*`)

Accessibles uniquement aux utilisateurs avec `type: "admin"`. Structure :
- `/admin` - Dashboard avec KPIs
- `/admin/machines` - CRUD machines
- `/admin/produits` - CRUD consommables
- `/admin/commandes` - Gestion des commandes
- `/admin/devis` - Gestion des devis
- `/admin/clients` - Gestion des clients
- `/admin/blog` - CMS articles
- `/admin/parametres` - Paramètres système

## Espace client (`/espace-client/*`)

Accessible uniquement aux clients authentifiés :
- `/espace-client` - Dashboard client
- `/espace-client/commandes` - Mes commandes
- `/espace-client/devis` - Mes demandes de devis
- `/espace-client/machines` - Ma flotte de machines
- `/espace-client/factures` - Mes factures
- `/espace-client/support` - Tickets de support
- `/espace-client/profil` - Mon profil

Structure : `layout.tsx` (en-tête, tiroir mobile, animation d'entrée par page), `components/ClientSidebar.tsx` (bureau et tiroir), `components/ClientBottomNav.tsx` (onglets du bas sous `lg`), `components/clientNav.ts` (menu partagé, pastilles via `useClientCounters`).

- **Mobile d'abord** : contenu en une colonne, `grid grid-cols-1 sm:…` (sans `grid-cols-1`, une colonne implicite s'élargit au texte non coupé et la page déborde), `pb-28` sous la barre d'onglets, tableaux remplacés par des cartes sous `md`.
- **Fenêtres** : `components/admin/Modal`, `ConfirmDialog`, `Toasts` avec les libellés traduits (`closeLabel`, `cancelLabel`, `dismissLabel`). Le focus va sur `[data-autofocus]`, sinon sur la fenêtre (pas de clavier qui s'ouvre sur mobile).
- **Liens profonds** : `/espace-client/commandes?commande=<id>` ouvre la commande ; `/espace-client/support?nouveau=livraison&commande=<réf>` ouvre un ticket prérempli, `?nouveau=1` un ticket vide.
- **Animations** : `motion-safe:animate-fade-up` (pages), `animate-sheet-up` / `animate-fade-in` (fenêtres), définies dans `tailwind.config.ts`.
