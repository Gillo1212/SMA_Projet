/** Données mock pour l'espace client */

export interface ClientProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise: string;
  poste: string;
  ville: string;
  adresse: string;
  dateInscription: string;
  avatar?: string;
}

export interface ClientOrder {
  id: string;
  date: string;
  produits: string;
  items: { name: string; qty: number; price: number }[];
  montant: number;
  statut: 'En attente' | 'Confirmée' | 'En livraison' | 'Livrée' | 'Annulée';
  paiement: string;
  adresseLivraison: string;
  factureId?: string;
}

export interface ClientQuote {
  id: string;
  date: string;
  machine: string;
  machineImage: string;
  employes: string;
  message: string;
  statut: 'Nouveau' | 'En cours' | 'Devis envoyé' | 'Accepté' | 'Refusé';
  montantPropose?: number;
  commentaireAdmin?: string;
}

export interface ClientMachine {
  id: string;
  nom: string;
  type: string;
  image: string;
  dateInstallation: string;
  site: string;
  statut: 'Opérationnelle' | 'Maintenance' | 'Hors service';
  prochaineMaintenance: string;
  totalVentes: number;
  consommation: string;
}

export interface ClientInvoice {
  id: string;
  numero: string;
  date: string;
  description: string;
  montant: number;
  statut: 'Payée' | 'En attente' | 'En retard';
  commandeId?: string;
  type: 'Commande' | 'Location' | 'Maintenance';
}

export interface SupportTicket {
  id: string;
  date: string;
  sujet: string;
  description: string;
  categorie: 'Panne' | 'Réapprovisionnement' | 'Facturation' | 'Autre';
  priorite: 'Basse' | 'Normale' | 'Haute' | 'Urgente';
  statut: 'Ouvert' | 'En cours' | 'Résolu' | 'Fermé';
  reponseAdmin?: string;
  machineId?: string;
}

// ── Mock Client ────────────────────────────────────────────────────────────

export const mockClient: ClientProfile = {
  id: 'CLI-001',
  nom: 'Diallo',
  prenom: 'Amadou',
  email: 'amadou@sonatel.sn',
  telephone: '+221 77 234 56 78',
  entreprise: 'Sonatel SA',
  poste: 'Responsable des achats',
  ville: 'Dakar',
  adresse: 'Route de la Corniche Ouest, Plateau',
  dateInscription: '2023-05-12',
};

// ── Commandes ──────────────────────────────────────────────────────────────

export const clientOrders: ClientOrder[] = [
  {
    id: 'CMD-2024-0284',
    date: '2024-03-19',
    produits: 'Café Arabica x10, Chips Sel x24',
    items: [
      { name: 'Café Arabica Premium (500g)', qty: 10, price: 12500 },
      { name: 'Chips Sel de Mer (45g)', qty: 24, price: 1500 },
    ],
    montant: 161000,
    statut: 'En attente',
    paiement: 'Wave',
    adresseLivraison: 'Sonatel SA – Route de la Corniche Ouest, Dakar',
    factureId: undefined,
  },
  {
    id: 'CMD-2024-0278',
    date: '2024-03-15',
    produits: 'Café Arabica x25, Chocolat Chaud x6',
    items: [
      { name: 'Café Arabica Premium (500g)', qty: 25, price: 12500 },
      { name: 'Chocolat Chaud Premium (1kg)', qty: 6, price: 9500 },
    ],
    montant: 369000,
    statut: 'Livrée',
    paiement: 'Wave',
    adresseLivraison: 'Sonatel SA – Route de la Corniche Ouest, Dakar',
    factureId: 'FAC-2024-0201',
  },
  {
    id: 'CMD-2024-0265',
    date: '2024-03-08',
    produits: 'Coca-Cola x48, Eau Minérale x30',
    items: [
      { name: 'Coca-Cola Classic (33cl)', qty: 48, price: 800 },
      { name: 'Eau Minérale Evian (50cl)', qty: 30, price: 600 },
    ],
    montant: 56400,
    statut: 'Livrée',
    paiement: 'Orange Money',
    adresseLivraison: 'Sonatel SA – Tour A, Plateau',
    factureId: 'FAC-2024-0187',
  },
  {
    id: 'CMD-2024-0241',
    date: '2024-02-22',
    produits: 'Cappuccino Vanille x16, Biscuits x20',
    items: [
      { name: 'Cappuccino Vanille (750g)', qty: 16, price: 13000 },
      { name: 'Biscuits Chocolat (154g)', qty: 20, price: 1800 },
    ],
    montant: 244000,
    statut: 'Livrée',
    paiement: 'Wave',
    adresseLivraison: 'Sonatel SA – Route de la Corniche Ouest, Dakar',
    factureId: 'FAC-2024-0156',
  },
  {
    id: 'CMD-2024-0198',
    date: '2024-01-31',
    produits: 'Chips Paprika x12, Sprite x24',
    items: [
      { name: 'Chips Paprika Pringles (165g)', qty: 12, price: 2000 },
      { name: 'Sprite Citron (33cl)', qty: 24, price: 800 },
    ],
    montant: 43200,
    statut: 'Annulée',
    paiement: 'Wave',
    adresseLivraison: 'Sonatel SA – Route de la Corniche Ouest, Dakar',
  },
];

// ── Devis ──────────────────────────────────────────────────────────────────

export const clientQuotes: ClientQuote[] = [
  {
    id: 'DEV-2024-0046',
    date: '2024-03-18',
    machine: 'TCN Machine à Café Commerciale',
    machineImage: 'https://readdy.ai/api/search-image?query=modern%20professional%20coffee%20vending%20machine%20sleek%20black%20design%20digital%20touchscreen%20display%20premium%20quality%20corporate%20environment%20standing%20unit&width=200&height=260&seq=client-machine-q1&orientation=portrait',
    employes: '200-500',
    message: 'Besoin de 3 machines café pour nos showrooms Dakar et Thiès.',
    statut: 'En cours',
    commentaireAdmin: 'Votre demande est en cours d\'analyse. Un commercial vous contactera sous 48h.',
  },
  {
    id: 'DEV-2024-0031',
    date: '2024-02-10',
    machine: 'TCN Distributeur Combiné Snack + Boissons + Café',
    machineImage: 'https://readdy.ai/api/search-image?query=large%20premium%20combination%20vending%20machine%20modern%20design%20multiple%20sections%20professional%20quality%20sophisticated%20corporate%20environment&width=200&height=260&seq=client-machine-q2&orientation=portrait',
    employes: '500+',
    message: 'Souhaitons équiper notre siège avec une solution complète café + snacks.',
    statut: 'Accepté',
    montantPropose: 15600000,
    commentaireAdmin: 'Devis accepté ! Contrat signé le 15/02/2024. Installation prévue mi-mars.',
  },
];

// ── Machines installées ────────────────────────────────────────────────────

export const clientMachines: ClientMachine[] = [
  {
    id: 'INST-001',
    nom: 'TCN Machine à Café Commerciale',
    type: 'Distributeur de Café',
    image: 'https://readdy.ai/api/search-image?query=modern%20professional%20coffee%20vending%20machine%20sleek%20black%20design%20digital%20touchscreen%20display%20premium%20quality%20corporate%20environment%20standing%20unit&width=400&height=520&seq=client-inst-001&orientation=portrait',
    dateInstallation: '2024-03-01',
    site: 'Siège Social – Niveau 3',
    statut: 'Opérationnelle',
    prochaineMaintenance: '2024-04-01',
    totalVentes: 1247,
    consommation: '~38 boissons/jour',
  },
  {
    id: 'INST-002',
    nom: 'TCN Distributeur Snack & Boissons Standard',
    type: 'Distributeur de Snacks',
    image: 'https://readdy.ai/api/search-image?query=modern%20snack%20vending%20machine%20glass%20front%20illuminated%20interior%20displaying%20variety%20snacks%20food%20items%20sleek%20contemporary%20design%20professional%20quality%20standing%20unit&width=400&height=520&seq=client-inst-002&orientation=portrait',
    dateInstallation: '2023-11-15',
    site: 'Cafétéria – Rez-de-chaussée',
    statut: 'Opérationnelle',
    prochaineMaintenance: '2024-04-15',
    totalVentes: 4892,
    consommation: '~95 produits/jour',
  },
  {
    id: 'INST-003',
    nom: 'TCN Smart Fridge Réfrigérée 24h',
    type: 'Distributeur de Boissons',
    image: 'https://readdy.ai/api/search-image?query=modern%20refrigerated%20beverage%20vending%20machine%20glass%20door%20illuminated%20interior%20showing%20cold%20drinks%20bottles%20sleek%20professional%20design%20contemporary%20energy%20efficient&width=400&height=520&seq=client-inst-003&orientation=portrait',
    dateInstallation: '2023-11-15',
    site: 'Salle de réunion – Niveau 2',
    statut: 'Maintenance',
    prochaineMaintenance: '2024-03-22',
    totalVentes: 3104,
    consommation: '~62 boissons/jour',
  },
];

// ── Factures ───────────────────────────────────────────────────────────────

export const clientInvoices: ClientInvoice[] = [
  {
    id: 'FAC-2024-0201',
    numero: 'FAC-2024-0201',
    date: '2024-03-15',
    description: 'Commande produits consumables – CMD-2024-0278',
    montant: 369000,
    statut: 'Payée',
    commandeId: 'CMD-2024-0278',
    type: 'Commande',
  },
  {
    id: 'FAC-2024-0187',
    numero: 'FAC-2024-0187',
    date: '2024-03-08',
    description: 'Commande boissons – CMD-2024-0265',
    montant: 56400,
    statut: 'Payée',
    commandeId: 'CMD-2024-0265',
    type: 'Commande',
  },
  {
    id: 'FAC-2024-0175',
    numero: 'FAC-2024-0175',
    date: '2024-03-01',
    description: 'Location mensuelle – 3 machines (mars 2024)',
    montant: 450000,
    statut: 'Payée',
    type: 'Location',
  },
  {
    id: 'FAC-2024-0156',
    numero: 'FAC-2024-0156',
    date: '2024-02-22',
    description: 'Commande café & biscuits – CMD-2024-0241',
    montant: 244000,
    statut: 'Payée',
    commandeId: 'CMD-2024-0241',
    type: 'Commande',
  },
  {
    id: 'FAC-2024-0140',
    numero: 'FAC-2024-0140',
    date: '2024-02-01',
    description: 'Location mensuelle – 3 machines (février 2024)',
    montant: 450000,
    statut: 'En attente',
    type: 'Location',
  },
  {
    id: 'FAC-2024-0110',
    numero: 'FAC-2024-0110',
    date: '2024-01-10',
    description: 'Maintenance préventive – Visite janvier 2024',
    montant: 85000,
    statut: 'En retard',
    type: 'Maintenance',
  },
];

// ── Support ────────────────────────────────────────────────────────────────

export const clientTickets: SupportTicket[] = [
  {
    id: 'TKT-2024-0023',
    date: '2024-03-18',
    sujet: 'Machine boissons ne refroidit plus',
    description: 'La machine TCN Smart Fridge au niveau 2 ne refroidit plus les boissons depuis ce matin. Température ambiante.',
    categorie: 'Panne',
    priorite: 'Haute',
    statut: 'En cours',
    machineId: 'INST-003',
    reponseAdmin: 'Un technicien est planifié pour le 22/03. Désolé pour la gêne occasionnée.',
  },
  {
    id: 'TKT-2024-0018',
    date: '2024-03-10',
    sujet: 'Stock café épuisé – Niveau 3',
    description: 'La machine café du niveau 3 est vide depuis hier. Besoin de réapprovisionnement urgent.',
    categorie: 'Réapprovisionnement',
    priorite: 'Normale',
    statut: 'Résolu',
    machineId: 'INST-001',
    reponseAdmin: 'Réapprovisionnement effectué le 12/03. Merci de votre signalement.',
  },
  {
    id: 'TKT-2024-0009',
    date: '2024-02-15',
    sujet: 'Erreur sur facture FAC-2024-0140',
    description: 'Le montant sur la facture FAC-2024-0140 semble incorrect. Le tarif appliqué ne correspond pas à notre contrat.',
    categorie: 'Facturation',
    priorite: 'Normale',
    statut: 'Ouvert',
  },
];
