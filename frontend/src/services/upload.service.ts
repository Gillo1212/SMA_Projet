/**
 * Service d'envoi d'images (back-office)
 * ───────────────────────────────────────
 * POST /upload/image (admin) → l'image est enregistrée dans backend/uploads/
 * et l'API renvoie son chemin public `/uploads/<fichier>`.
 */

import { apiClient } from './apiClient';
import { USE_MOCK, ENDPOINTS } from '../config/api';
import { resolveMediaUrl } from '../utils/media';

/** Formats et taille acceptés par le backend (middleware/upload.js) */
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif';
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** Contrôle avant envoi : renvoie un message d'erreur, ou null si le fichier convient */
export function checkImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) {
    return `« ${file.name} » n'est pas une image acceptée (JPG, PNG, WebP ou GIF).`;
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return `« ${file.name} » dépasse 10 Mo (${(file.size / 1024 / 1024).toFixed(1)} Mo).`;
  }
  return null;
}

export const uploadService = {
  /** Envoie une image et renvoie l'URL prête à afficher */
  async uploadImage(file: File): Promise<string> {
    if (USE_MOCK) {
      throw new Error("L'envoi d'images demande l'API (VITE_API_URL).");
    }
    const form = new FormData();
    form.append('image', file);
    const res = await apiClient.postForm<{ url: string }>(ENDPOINTS.UPLOAD.IMAGE, form);
    if (!res?.url) throw new Error("L'API n'a pas renvoyé l'adresse de l'image.");
    return resolveMediaUrl(res.url);
  },
};
