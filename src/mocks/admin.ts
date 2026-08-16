export const adminStats = {
  totalCommandes: 284,
  commandesMoisActuel: 47,
  commandesEvolution: 12.4,
  revenusMoisActuel: 12450000,
  revenusEvolution: 18.5,
  machinesActives: 48,
  devisEnAttente: 12,
  clientsTotal: 156,
  clientsNouveaux: 8,
};

export const revenueData = [
  { month: 'Oct', value: 7800000 },
  { month: 'Nov', value: 9200000 },
  { month: 'Dec', value: 11500000 },
  { month: 'Jan', value: 8900000 },
  { month: 'Fev', value: 10300000 },
  { month: 'Mar', value: 12450000 },
];

export type CommandeStatus = 'En attente' | 'Confirmée' | 'En livraison' | 'Livrée' | 'Annulée';

export interface AdminCommande {
  id: string;
  client: string;
  email: string;
  produits: string;
  montant: number;
  statut: CommandeStatus;
  date: string;
  paiement: 'Wave' | 'Orange Money';
}

export const adminCommandes: AdminCommande[] = [
  { id: 'CMD-2024-0284', client: 'Amadou Diallo', email: 'amadou@sonatel.sn', produits: 'Café Arabica x10, Chips x24', montant: 161000, statut: 'En attente', date: '2024-03-19', paiement: 'Wave' },
  { id: 'CMD-2024-0283', client: 'Fatou Sow', email: 'fatou.sow@orange.sn', produits: 'Coca-Cola x48, Sprite x24', montant: 57600, statut: 'Confirmée', date: '2024-03-18', paiement: 'Orange Money' },
  { id: 'CMD-2024-0282', client: 'Moussa Ndiaye', email: 'mndiaye@cbao.sn', produits: 'Chocolat Chaud x12, Cappuccino x8', montant: 218000, statut: 'En livraison', date: '2024-03-18', paiement: 'Wave' },
  { id: 'CMD-2024-0281', client: 'Aïssatou Ba', email: 'aissatou.ba@gmail.com', produits: 'Eau Minérale x60, Fanta x24', montant: 55200, statut: 'Livrée', date: '2024-03-17', paiement: 'Orange Money' },
  { id: 'CMD-2024-0280', client: 'Omar Faye', email: 'omar.faye@senelec.sn', produits: 'Café Robusta x20, Barres Céréales x30', montant: 286000, statut: 'Livrée', date: '2024-03-17', paiement: 'Wave' },
  { id: 'CMD-2024-0279', client: 'Mariama Diop', email: 'mdiop@dtis.sn', produits: 'Chips Paprika x12, Biscuits x20', montant: 60000, statut: 'Annulée', date: '2024-03-16', paiement: 'Orange Money' },
  { id: 'CMD-2024-0278', client: 'Ibrahim Sarr', email: 'ibrahim.sarr@boa.sn', produits: 'Café Arabica x25, Chocolat x6', montant: 369000, statut: 'Livrée', date: '2024-03-15', paiement: 'Wave' },
  { id: 'CMD-2024-0277', client: 'Rokhaya Tall', email: 'rokhaya@eiffage.sn', produits: 'Coca x100, Eau x60', montant: 116000, statut: 'En attente', date: '2024-03-15', paiement: 'Orange Money' },
  { id: 'CMD-2024-0276', client: 'Seydou Mbaye', email: 'smbaye@tigo.sn', produits: 'Cappuccino x16', montant: 208000, statut: 'Confirmée', date: '2024-03-14', paiement: 'Wave' },
  { id: 'CMD-2024-0275', client: 'Ndéye Fall', email: 'nfall@nsia.sn', produits: 'Sprite x48, Chips x48', montant: 110400, statut: 'Livrée', date: '2024-03-14', paiement: 'Orange Money' },
];

export type DevisStatus = 'Nouveau' | 'En cours' | 'Devis envoyé' | 'Accepté' | 'Refusé';

export interface AdminDevis {
  id: string;
  entreprise: string;
  contact: string;
  email: string;
  machine: string;
  employes: string;
  message: string;
  statut: DevisStatus;
  date: string;
  montantPropose?: number;
}

export const adminDevis: AdminDevis[] = [
  { id: 'DEV-2024-0047', entreprise: 'Groupe Attijariwafa Bank', contact: 'Cheikh Sall', email: 'csall@attijariwafa.sn', machine: 'TCN Distributeur Combiné Snack + Boissons + Café', employes: '500+', message: 'Nous souhaitons équiper nos 8 agences principales avec des distributeurs combinés.', statut: 'Nouveau', date: '2024-03-19' },
  { id: 'DEV-2024-0046', entreprise: 'CFAO Motors Sénégal', contact: 'Aliou Badji', email: 'abadji@cfao.com', machine: 'TCN Machine à Café Commerciale', employes: '200-500', message: 'Besoin de 3 machines café pour nos showrooms Dakar et Thiès.', statut: 'En cours', date: '2024-03-18' },
  { id: 'DEV-2024-0045', entreprise: 'Université Cheikh Anta Diop', contact: 'Dr Aminata Cissé', email: 'acisse@ucad.edu.sn', machine: 'TCN Distributeur Snack & Boissons Standard', employes: '500+', message: 'Projet pilote pour la cafétéria centrale, 2000 étudiants par jour.', statut: 'Devis envoyé', date: '2024-03-17', montantPropose: 9600000 },
  { id: 'DEV-2024-0044', entreprise: 'Total Energies Sénégal', contact: 'Karim Diouf', email: 'kdiouf@totalenergies.sn', machine: 'TCN Distributeur Combiné Snack + Boissons + Café', employes: '500+', message: 'Équipement complet pour notre siège social (4 étages, 600 employés).', statut: 'Accepté', date: '2024-03-15', montantPropose: 15600000 },
  { id: 'DEV-2024-0043', entreprise: 'Clinique du Plateau', contact: 'Dr Sophie Martin', email: 'smartin@clinique-plateau.sn', machine: 'TCN Smart Fridge Réfrigérée 24h', employes: '50-200', message: 'Distributeur boissons pour salle d\'attente et couloirs. Utilisation 24h/24.', statut: 'Devis envoyé', date: '2024-03-14', montantPropose: 2950000 },
  { id: 'DEV-2024-0042', entreprise: 'Dakar Aéroport Services', contact: 'Ibrahima Gaye', email: 'igaye@das.sn', machine: 'TCN Distributeur Combiné Snack + Boissons + Café', employes: '500+', message: 'Besoin urgent de 10 machines pour Terminal 1 et Terminal 2.', statut: 'Accepté', date: '2024-03-12', montantPropose: 52000000 },
  { id: 'DEV-2024-0041', entreprise: 'Pharmacie Guigon', contact: 'M. Traoré', email: 'traore@pharmacie-guigon.sn', machine: 'TCN Mini Machine à Café', employes: '10-50', message: 'Petite machine pour l\'espace attente de notre pharmacie.', statut: 'Refusé', date: '2024-03-10' },
];

export interface AdminClient {
  id: string;
  nom: string;
  entreprise: string;
  email: string;
  telephone: string;
  ville: string;
  totalCommandes: number;
  totalDepenses: number;
  dateInscription: string;
  statut: 'Actif' | 'Inactif';
}

export const adminClients: AdminClient[] = [
  { id: 'CLI-001', nom: 'Amadou Diallo', entreprise: 'Sonatel SA', email: 'amadou@sonatel.sn', telephone: '+221 77 234 56 78', ville: 'Dakar', totalCommandes: 28, totalDepenses: 3420000, dateInscription: '2023-05-12', statut: 'Actif' },
  { id: 'CLI-002', nom: 'Fatou Sow', entreprise: 'Orange Sénégal', email: 'fatou.sow@orange.sn', telephone: '+221 78 345 67 89', ville: 'Dakar', totalCommandes: 14, totalDepenses: 1890000, dateInscription: '2023-07-08', statut: 'Actif' },
  { id: 'CLI-003', nom: 'Moussa Ndiaye', entreprise: 'CBAO Banque', email: 'mndiaye@cbao.sn', telephone: '+221 76 456 78 90', ville: 'Dakar', totalCommandes: 35, totalDepenses: 5670000, dateInscription: '2023-02-20', statut: 'Actif' },
  { id: 'CLI-004', nom: 'Aïssatou Ba', entreprise: 'Indépendant', email: 'aissatou.ba@gmail.com', telephone: '+221 70 567 89 01', ville: 'Thiès', totalCommandes: 8, totalDepenses: 480000, dateInscription: '2023-10-15', statut: 'Inactif' },
  { id: 'CLI-005', nom: 'Omar Faye', entreprise: 'Senelec', email: 'omar.faye@senelec.sn', telephone: '+221 77 678 90 12', ville: 'Dakar', totalCommandes: 22, totalDepenses: 2980000, dateInscription: '2023-04-01', statut: 'Actif' },
  { id: 'CLI-006', nom: 'Mariama Diop', entreprise: 'DTIS Consulting', email: 'mdiop@dtis.sn', telephone: '+221 78 789 01 23', ville: 'Dakar', totalCommandes: 5, totalDepenses: 320000, dateInscription: '2024-01-18', statut: 'Inactif' },
  { id: 'CLI-007', nom: 'Ibrahim Sarr', entreprise: 'BOA Sénégal', email: 'ibrahim.sarr@boa.sn', telephone: '+221 76 890 12 34', ville: 'Dakar', totalCommandes: 41, totalDepenses: 6120000, dateInscription: '2023-01-10', statut: 'Actif' },
  { id: 'CLI-008', nom: 'Rokhaya Tall', entreprise: 'Eiffage Sénégal', email: 'rokhaya@eiffage.sn', telephone: '+221 70 901 23 45', ville: 'Dakar', totalCommandes: 19, totalDepenses: 2450000, dateInscription: '2023-06-22', statut: 'Actif' },
  { id: 'CLI-009', nom: 'Seydou Mbaye', entreprise: 'Tigo Sénégal', email: 'smbaye@tigo.sn', telephone: '+221 77 012 34 56', ville: 'Ziguinchor', totalCommandes: 11, totalDepenses: 1340000, dateInscription: '2023-08-30', statut: 'Actif' },
  { id: 'CLI-010', nom: 'Ndéye Fall', entreprise: 'NSIA Assurances', email: 'nfall@nsia.sn', telephone: '+221 78 123 45 67', ville: 'Saint-Louis', totalCommandes: 7, totalDepenses: 560000, dateInscription: '2024-02-05', statut: 'Actif' },
];
