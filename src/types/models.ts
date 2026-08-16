/**
 * Modèles de données centraux
 * ────────────────────────────
 * Ces interfaces correspondent exactement aux entités de ton backend.
 * Chaque service et hook les utilise.
 */

// ── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// ── Machine ────────────────────────────────────────────────────────────────

export interface Machine {
  id: string;
  name: string;
  slug: string;
  type: 'cafe' | 'snacks' | 'boissons' | 'combine';
  /** Libellé de la catégorie */
  category: string;
  /** ID de la catégorie — requis par POST/PUT /machines */
  categoryId?: string;
  price: number;
  priceDisplay: string;
  badge?: string;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  capacity: Record<string, string | number>;
  specifications: Record<string, string>;
  features: string[];
  paymentMethods: string[];
  idealFor: string[];
  maintenanceIncluded: boolean;
  deliveryTime: string;
  /** Libellé dérivé de la quantité réelle */
  stock: 'En stock' | 'Stock limité' | 'Rupture de stock';
  /** Quantité réelle en base — conservée pour ne pas la perdre à l'édition */
  stockQuantity?: number;
}

// ── Produit ────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  sku: string;
  name: string;
  /** Libellé de la catégorie (pilotée par la BDD, pas une liste figée) */
  category: string;
  /** Slug de la catégorie — sert de filtre côté API */
  categorySlug?: string;
  brand: string;
  price: number;
  format: string;
  taste?: string;
  compatibility: string[];
  stock: number;
  isAvailable: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  images: string[];
  description: string;
  ingredients: string;
  allergens: string;
  volumeDiscounts: VolumeDiscount[];
  relatedProducts: string[];
  weight?: string;
}

export interface VolumeDiscount {
  quantity: number;
  discount: number;
}

// ── Commande ───────────────────────────────────────────────────────────────

/** Reflète l'ENUM `orders.status` du backend (7 valeurs) */
export type OrderStatus =
  | 'En attente'
  | 'Confirmée'
  | 'En préparation'
  | 'Expédiée'
  | 'Livrée'
  | 'Annulée'
  | 'Remboursée';

export type PaymentMethod =
  | 'Wave'
  | 'Orange Money'
  | 'Virement bancaire'
  | 'Carte bancaire'
  | 'Espèces'
  | 'Non renseigné';

export type PaymentStatus = 'En attente' | 'Payée' | 'Échouée' | 'Remboursée';

export interface Order {
  /** ID numérique — c'est lui qu'attendent les routes /orders/:id */
  id: string;
  /** Numéro lisible affiché à l'écran (CMD-2024-00042) */
  reference: string;
  client: string;
  email: string;
  phone?: string;
  /** Résumé texte des articles — vide tant que le détail n'est pas chargé */
  produits: string;
  items?: OrderItem[];
  montant: number;
  statut: OrderStatus;
  paiement: PaymentMethod;
  paiementStatut?: PaymentStatus;
  date: string;
  adresseLivraison?: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

// ── Devis ──────────────────────────────────────────────────────────────────

/** Reflète l'ENUM `quotes.status` du backend (6 valeurs) */
export type QuoteStatus =
  | 'Nouveau'
  | 'En cours'
  | 'Devis envoyé'
  | 'Accepté'
  | 'Refusé'
  | 'Expiré';

export interface Quote {
  /** ID numérique — attendu par les routes /quotes/:id */
  id: string;
  /** Numéro lisible affiché à l'écran (DEV-2024-00042) */
  reference: string;
  entreprise: string;
  contact: string;
  email: string;
  phone?: string;
  machine: string;
  machineId?: string;
  /** Nombre d'unités demandées (colonne `quantity`) */
  quantite: number;
  /** @deprecated champ hérité des mocks — utiliser `quantite` */
  employes?: string;
  message: string;
  statut: QuoteStatus;
  date: string;
  budget?: number;
  montantPropose?: number;
  notes?: string;
}

// ── Client ─────────────────────────────────────────────────────────────────

export type ClientStatus = 'Actif' | 'Inactif';

export interface Client {
  id: string;
  nom: string;
  entreprise: string;
  email: string;
  telephone: string;
  ville: string;
  totalCommandes: number;
  totalDepenses: number;
  dateInscription: string;
  statut: ClientStatus;
}

/** Catégorie renvoyée par /machines/categories, /products/categories, /blog/categories */
export interface Category {
  id: string;
  name: string;
  slug: string;
  articlesCount?: number;
}

// ── Blog ───────────────────────────────────────────────────────────────────

/** Les catégories réelles viennent de /blog/categories — ce type reste un alias souple */
export type BlogCategory = string;

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  /** Slug de la catégorie */
  category: BlogCategory;
  /** Libellé affichable de la catégorie */
  categoryName?: string;
  categoryId?: string;
  date: string;
  author: string;
  authorRole: string;
  readTime: string;
  image: string;
  status?: BlogStatus;
  published?: boolean;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalCommandes: number;
  commandesMoisActuel: number;
  /** % vs mois précédent — absent si l'historique est trop court */
  commandesEvolution?: number;
  revenusTotal: number;
  revenusMoisActuel: number;
  revenusEvolution?: number;
  machinesActives: number;
  devisEnAttente: number;
  ticketsOuverts: number;
  clientsTotal: number;
}

export interface RevenueDataPoint {
  month: string;
  value: number;
}

/** Répartition des commandes par statut (30 derniers jours) */
export interface StatusBreakdownItem {
  statut: OrderStatus;
  count: number;
}

// ── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// ── Query params ───────────────────────────────────────────────────────────

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MachineListParams extends ListParams {
  type?: string;
  stock?: string;
}

export interface ProductListParams extends ListParams {
  /** Slug de catégorie tel qu'attendu par le backend */
  category?: string;
  available?: boolean;
}

export interface OrderListParams extends ListParams {
  statut?: OrderStatus;
}

export interface QuoteListParams extends ListParams {
  statut?: QuoteStatus;
}

export interface BlogListParams extends ListParams {
  category?: string;
  status?: BlogStatus;
}
