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
  category: string;
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
  stock: 'En stock' | 'Stock limité' | 'Rupture de stock';
}

// ── Produit ────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Café & Poudres' | 'Snacks' | 'Boissons';
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

export type OrderStatus =
  | 'En attente'
  | 'Confirmée'
  | 'En livraison'
  | 'Livrée'
  | 'Annulée';

export type PaymentMethod = 'Wave' | 'Orange Money' | 'Carte bancaire' | 'Espèces';

export interface Order {
  id: string;
  client: string;
  email: string;
  phone?: string;
  produits: string;
  items?: OrderItem[];
  montant: number;
  statut: OrderStatus;
  paiement: PaymentMethod;
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

export type QuoteStatus =
  | 'Nouveau'
  | 'En cours'
  | 'Devis envoyé'
  | 'Accepté'
  | 'Refusé';

export interface Quote {
  id: string;
  entreprise: string;
  contact: string;
  email: string;
  phone?: string;
  machine: string;
  machineId?: string;
  employes: string;
  message: string;
  statut: QuoteStatus;
  date: string;
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

// ── Blog ───────────────────────────────────────────────────────────────────

export type BlogCategory =
  | 'actualites'
  | 'conseils'
  | 'innovations'
  | 'temoignages';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  date: string;
  author: string;
  authorRole: string;
  readTime: string;
  image: string;
  published?: boolean;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalCommandes: number;
  commandesMoisActuel: number;
  commandesEvolution: number;
  revenusMoisActuel: number;
  revenusEvolution: number;
  machinesActives: number;
  devisEnAttente: number;
  clientsTotal: number;
  clientsNouveaux: number;
}

export interface RevenueDataPoint {
  month: string;
  value: number;
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
  category?: string;
  available?: boolean;
}

export interface OrderListParams extends ListParams {
  statut?: OrderStatus;
}

export interface QuoteListParams extends ListParams {
  statut?: QuoteStatus;
}
