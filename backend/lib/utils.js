/**
 * Construit un slug URL à partir d'une chaîne.
 * Gère les accents français et caractères spéciaux.
 */
const buildSlug = (str) =>
  str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

module.exports = { buildSlug };
