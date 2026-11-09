/**
 * Newsletter
 * ──────────
 *   await newsletterService.subscribe(email, 'fr');     // pied de page du site
 *   await newsletterService.unsubscribe(token);         // lien de l'email de bienvenue
 *   const list = await newsletterService.list();        // back-office
 *
 * Backend : /api/newsletter (subscribe, unsubscribe publics ; liste, export CSV,
 * modification et suppression pour l'équipe).
 */
import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';

export type SubscriberStatus = 'subscribed' | 'unsubscribed';

export interface Subscriber {
  id: number;
  email: string;
  status: SubscriberStatus;
  source: string;
  locale: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface BackendSubscriber {
  id: number;
  email: string;
  status: SubscriberStatus;
  source: string;
  locale: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

const normalize = (s: BackendSubscriber): Subscriber => ({
  id: s.id,
  email: s.email,
  status: s.status,
  source: s.source,
  locale: s.locale,
  subscribedAt: s.subscribed_at,
  unsubscribedAt: s.unsubscribed_at,
});

const wait = () => new Promise(r => setTimeout(r, MOCK_DELAY));

export const newsletterService = {
  /** Même réponse que l'adresse soit nouvelle ou déjà inscrite */
  async subscribe(email: string, locale: string, website = ''): Promise<void> {
    if (USE_MOCK) { await wait(); return; }
    await apiClient.post(ENDPOINTS.NEWSLETTER.SUBSCRIBE, {
      email,
      locale: locale.startsWith('en') ? 'en' : 'fr',
      source: 'footer',
      website,
    });
  },

  /** @returns l'adresse désinscrite */
  async unsubscribe(token: string): Promise<string> {
    if (USE_MOCK) { await wait(); return ''; }
    const data = await apiClient.post<{ email: string }>(ENDPOINTS.NEWSLETTER.UNSUBSCRIBE, { token });
    return data.email;
  },

  /** Back-office : toutes les adresses (inscrites et désinscrites) */
  async list(): Promise<Subscriber[]> {
    if (USE_MOCK) { await wait(); return []; }
    const raw = await apiClient.get<BackendSubscriber[]>(ENDPOINTS.NEWSLETTER.LIST, { limit: 500 });
    return raw.map(normalize);
  },

  async setStatus(id: number, status: SubscriberStatus): Promise<Subscriber> {
    const raw = await apiClient.patch<BackendSubscriber>(ENDPOINTS.NEWSLETTER.UPDATE(id), { status });
    return normalize(raw);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.NEWSLETTER.DELETE(id));
  },

  /** Télécharge le fichier CSV des adresses inscrites (séparateur « ; », pour Excel) */
  async downloadCsv(status: SubscriberStatus | 'all' = 'subscribed'): Promise<void> {
    const csv = await apiClient.get<string>(ENDPOINTS.NEWSLETTER.EXPORT, { status });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-smalim-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
