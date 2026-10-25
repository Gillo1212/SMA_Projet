/**
 * Liens de contact construits à partir des coordonnées saisies dans le
 * back-office (« +221 77 123 45 67 », « 77 123 45 67 »…).
 */

/** Chiffres seuls, préfixés de l'indicatif du Sénégal si le numéro est local */
function internationalDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (phone.trim().startsWith('00')) return digits.slice(2);
  // Numéro sénégalais à 9 chiffres saisi sans indicatif
  if (!phone.trim().startsWith('+') && digits.length === 9) return `221${digits}`;
  return digits;
}

export function telHref(phone: string): string {
  return `tel:+${internationalDigits(phone)}`;
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${internationalDigits(phone)}`;
}
