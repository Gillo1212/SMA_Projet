/**
 * Logos des moyens de paiement, utilisés sur l'accueil, le checkout et les
 * fiches machines. Un seul endroit à modifier pour passer aux fichiers
 * officiels (kit marchand Wave Business / Orange Money) : déposer les fichiers
 * dans public/images/payments/ et remplacer les adresses ci-dessous.
 *
 * Provisoire : images héritées de l'outil qui a généré le site (hébergées chez Readdy).
 */
export const PAYMENT_LOGOS = {
  /** Icône d'application Wave (pingouin sur fond bleu, carré) */
  wave: 'https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/768bed2b-5283-47bc-b9e6-f4dae5cf304f_Wave.png?v=c76ba778473ee3601f42a6ffe67df37c',
  /** Emblème Orange Money (deux flèches) */
  orangeMoney: 'https://storage.readdy-site.link/project_files/aa6dbb4c-c575-457d-a3a9-db6ddc27815b/7601a307-e87f-40c7-84ba-40ace6edbf5e_Orange-money.png?v=e2d6d95468557e3a937a2d097b94b09e',
} as const;
