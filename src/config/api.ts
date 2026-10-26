/**
 * API Configuration
 * ─────────────────
 * Pour activer ton backend, crée un fichier .env à la racine :
 *   VITE_API_URL=http://localhost:5000/api
 *
 * Sans cette variable, l'app utilise les données mock locales.
 */

export const API_URL = import.meta.env.VITE_API_URL as string | undefined;

/** true = données locales mock, false = vraies requêtes API */
export const USE_MOCK = !API_URL;

/** Délai simulé (ms) pour les mocks – rend l'UI réaliste */
export const MOCK_DELAY = 250;

export const ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────
  // Backend : POST /api/auth/admin/login  |  POST /api/auth/client/login
  AUTH: {
    ADMIN_LOGIN:    '/auth/admin/login',
    CLIENT_LOGIN:   '/auth/client/login',
    ADMIN_REGISTER: '/auth/admin/register',
    CLIENT_REGISTER:'/auth/client/register',
    REFRESH:        '/auth/refresh',
    ME:             '/auth/me',
    CHANGE_PASSWORD:'/auth/change-password',
    FORGOT_PASSWORD:    '/auth/forgot-password',
    RESET_PASSWORD:     '/auth/reset-password',
    VERIFY_EMAIL:       '/auth/verify-email',
    RESEND_VERIFICATION:'/auth/resend-verification',
  },

  // ── Machines ──────────────────────────────────────────────
  MACHINES: {
    LIST:          '/machines',
    BY_SLUG:       (slug: string) => `/machines/slug/${slug}`,
    DETAIL:        (id: string)   => `/machines/${id}`,
    CREATE:        '/machines',
    UPDATE:        (id: string)   => `/machines/${id}`,
    DELETE:        (id: string)   => `/machines/${id}`,
    CATEGORIES:    '/machines/categories',
  },

  // ── Produits ──────────────────────────────────────────────
  PRODUCTS: {
    LIST:       '/products',
    BY_SLUG:    (slug: string) => `/products/slug/${slug}`,
    DETAIL:     (id: string)   => `/products/${id}`,
    CREATE:     '/products',
    UPDATE:     (id: string)   => `/products/${id}`,
    DELETE:     (id: string)   => `/products/${id}`,
    CATEGORIES: '/products/categories',
  },

  // ── Commandes ─────────────────────────────────────────────
  ORDERS: {
    LIST:          '/orders',
    DETAIL:        (id: string) => `/orders/${id}`,
    CREATE:        '/orders',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    VALIDATE_PROMO:'/orders/validate-promo',
  },

  // ── Devis ─────────────────────────────────────────────────
  // Le backend n'expose qu'une seule route de mise à jour : PATCH /quotes/:id/status
  // Elle accepte aussi `proposed_amount` — il n'existe pas de route /amount séparée.
  QUOTES: {
    LIST:          '/quotes',
    DETAIL:        (id: string) => `/quotes/${id}`,
    CREATE:        '/quotes',
    UPDATE_STATUS: (id: string) => `/quotes/${id}/status`,
    DELETE:        (id: string) => `/quotes/${id}`,
  },

  // ── Clients ───────────────────────────────────────────────
  // Pas de DELETE côté backend : la désactivation passe par TOGGLE_ACTIVE.
  CLIENTS: {
    LIST:                    '/clients',
    DETAIL:                  (id: string) => `/clients/${id}`,
    UPDATE:                  (id: string) => `/clients/${id}`,
    TOGGLE_ACTIVE:           (id: string) => `/clients/${id}/toggle-active`,
    MACHINES:                (id: string) => `/clients/${id}/machines`,
    ADD_MACHINE:             (id: string) => `/clients/${id}/machines`,
    UPDATE_MACHINE:          (id: string, machineId: string) => `/clients/${id}/machines/${machineId}`,
    TICKETS:                 (id: string) => `/clients/${id}/tickets`,
    CREATE_TICKET:           '/clients/tickets',
    INVOICES:                (id: string) => `/clients/${id}/invoices`,
  },

  // ── Blog ──────────────────────────────────────────────────
  // Backend : GET /api/blog  |  GET /api/blog/:slug  |  POST /api/blog
  BLOG: {
    LIST:       '/blog',
    CATEGORIES: '/blog/categories',
    DETAIL:     (id: string)   => `/blog/${id}`,
    BY_SLUG:    (slug: string) => `/blog/${slug}`,
    CREATE:     '/blog',
    UPDATE:     (id: string)   => `/blog/${id}`,
    DELETE:     (id: string)   => `/blog/${id}`,
  },

  // ── Dashboard ─────────────────────────────────────────────
  // Backend : GET /api/dashboard/admin  |  GET /api/dashboard/client
  DASHBOARD: {
    ADMIN:  '/dashboard/admin',
    CLIENT: '/dashboard/client',
    CLIENT_COUNTERS: '/dashboard/client/counters',
    COUNTERS: '/dashboard/counters',
  },

  // ── Paramètres ────────────────────────────────────────────
  SETTINGS: {
    LIST:   '/settings',
    UPDATE: '/settings',
    /** Public : TVA et livraison, pour que le panier affiche le montant facturé */
    PUBLIC: '/settings/public',
    ADMINS: '/settings/admins',
    SMTP_TEST: '/settings/smtp/test',
  },

  // ── Codes promo (back-office) ─────────────────────────────
  PROMO_CODES: {
    LIST:   '/promo-codes',
    CREATE: '/promo-codes',
    UPDATE: (id: number) => `/promo-codes/${id}`,
    DELETE: (id: number) => `/promo-codes/${id}`,
  },

  // ── Paiements ─────────────────────────────────────────────
  // Backend : POST /api/payments/initiate → URL de redirection prestataire
  PAYMENTS: {
    INITIATE: '/payments/initiate',
    STATUS:   (reference: string) => `/payments/status/${reference}`,
    CONFIG:   '/payments/config',
    /** Développement uniquement : rejoue l'issue d'un paiement */
    SIMULATE: '/payments/simulate',
  },
} as const;

/** Clé localStorage pour le token JWT admin */
export const AUTH_TOKEN_KEY = 'smalim_auth_token';
/** Clé localStorage pour l'utilisateur admin connecté */
export const AUTH_USER_KEY  = 'smalim_auth_user';
/** Clé localStorage pour le token JWT client */
export const CLIENT_TOKEN_KEY = 'smalim_client_token';
/** Clé localStorage pour le client connecté */
export const CLIENT_USER_KEY  = 'smalim_client_user';
