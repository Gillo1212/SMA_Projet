/**
 * Logos des moyens de paiement, utilisés sur l'accueil, le checkout et les
 * fiches machines. Fichiers hébergés dans public/images/payments/ : pour passer
 * aux fichiers officiels (kit marchand Wave Business / Orange Money), il suffit
 * de remplacer ces images (ou les adresses ci-dessous).
 */
export const PAYMENT_LOGOS = {
  /** Icône d'application Wave (pingouin sur fond bleu, carré) */
  wave: '/images/payments/wave.png',
  /** Emblème Orange Money (deux flèches) */
  orangeMoney: '/images/payments/orange-money.png',
} as const;
