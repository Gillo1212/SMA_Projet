/**
 * Messages de contact
 * ───────────────────
 *   await contactService.send({ name, email, phone, subject, message });   // page Contact
 *   const messages = await contactService.list();                           // back-office
 *
 * Backend : POST /api/contact (public), GET / PATCH / DELETE /api/contact (back-office).
 */
import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';

export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  adminNote: string | null;
  handledByName: string | null;
  handledAt: string | null;
  createdAt: string;
}

interface BackendContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactStatus;
  admin_note: string | null;
  handled_by_name: string | null;
  handled_at: string | null;
  created_at: string;
}

const normalize = (m: BackendContactMessage): ContactMessage => ({
  id: m.id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  subject: m.subject,
  message: m.message,
  status: m.status,
  adminNote: m.admin_note,
  handledByName: m.handled_by_name?.trim() || null,
  handledAt: m.handled_at,
  createdAt: m.created_at,
});

const wait = () => new Promise(r => setTimeout(r, MOCK_DELAY));

export const contactService = {
  /** Formulaire public. `website` : champ piège anti-robot, laissé vide par un humain. */
  async send(data: { name: string; email: string; phone?: string; subject?: string; message: string; website?: string }): Promise<void> {
    if (USE_MOCK) { await wait(); return; }
    await apiClient.post(ENDPOINTS.CONTACT.SEND, data);
  },

  /** Back-office : tous les messages, archivés compris (filtrés à l'affichage) */
  async list(): Promise<ContactMessage[]> {
    if (USE_MOCK) { await wait(); return []; }
    const raw = await apiClient.get<BackendContactMessage[]>(ENDPOINTS.CONTACT.LIST, { status: 'all', limit: 200 });
    return raw.map(normalize);
  },

  async update(id: number, changes: { status?: ContactStatus; adminNote?: string | null }): Promise<ContactMessage> {
    const payload: Record<string, unknown> = {};
    if (changes.status) payload.status = changes.status;
    if (changes.adminNote !== undefined) payload.admin_note = changes.adminNote;
    const raw = await apiClient.patch<BackendContactMessage>(ENDPOINTS.CONTACT.UPDATE(id), payload);
    return normalize(raw);
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.CONTACT.DELETE(id));
  },
};
