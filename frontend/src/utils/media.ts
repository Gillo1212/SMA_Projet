/**
 * URL des images téléversées
 * ───────────────────────────
 * Le backend enregistre les images envoyées depuis l'admin sous `/uploads/…`
 * (chemin relatif à l'API). Le frontend est servi depuis une autre origine
 * (port 5173 en dev, éventuellement un autre domaine en production) : affiché
 * tel quel, `/uploads/x.jpg` pointerait vers le serveur du frontend.
 *
 * - En lecture, `resolveMediaUrl` préfixe ces chemins avec l'origine de l'API.
 * - En écriture, `toStoredMediaUrl` retire ce préfixe : la base garde un chemin
 *   relatif, valable même si le domaine de l'API change.
 *
 * Les autres URL (`/images/…` du dossier public, liens externes) ne sont pas touchées.
 */

import { API_URL } from '../config/api';

const UPLOADS_PREFIX = '/uploads/';

/** Origine de l'API (`http://localhost:5000`), vide si l'URL est absente ou relative */
const API_ORIGIN = (() => {
  if (!API_URL) return '';
  try {
    return new URL(API_URL).origin;
  } catch {
    return ''; // URL relative (`/api`) : même origine que le frontend
  }
})();

export function resolveMediaUrl(url: string): string;
export function resolveMediaUrl(url: string | null | undefined): string | undefined;
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return url ?? undefined;
  return url.startsWith(UPLOADS_PREFIX) ? `${API_ORIGIN}${url}` : url;
}

export function toStoredMediaUrl(url: string): string {
  if (API_ORIGIN && url.startsWith(`${API_ORIGIN}${UPLOADS_PREFIX}`)) {
    return url.slice(API_ORIGIN.length);
  }
  return url;
}
