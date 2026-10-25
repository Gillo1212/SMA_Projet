/**
 * Service Espace client
 * ──────────────────────
 * MOCK → lit les données de src/mocks/clientPortal.ts
 * API  → /dashboard/client, /clients/:id/machines, /clients/:id/invoices,
 *        /clients/:id/tickets, POST /clients/tickets
 *
 * Les routes /clients/:id/* déduisent le client du token quand l'appelant est
 * un client : l'`id` passé dans l'URL n'est utilisé que par les admins. On
 * transmet quand même l'id connu pour rester lisible côté réseau.
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';
import {
  clientMachines as mockMachines,
  clientInvoices as mockInvoices,
  clientTickets as mockTickets,
} from '../mocks/clientPortal';
import { toNumber, formatDate } from './normalize';
import type {
  ClientMachine,
  ClientMachineStatus,
  Invoice,
  InvoiceStatus,
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  ClientDashboardStats,
  ClientProfile,
  Order,
} from '../types/models';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Tables de correspondance backend → frontend ────────────────────────────

const MACHINE_STATUS: Record<string, ClientMachineStatus> = {
  active: 'Opérationnelle',
  maintenance: 'Maintenance',
  inactive: 'Hors service',
};

const INVOICE_STATUS: Record<string, InvoiceStatus> = {
  draft: 'Brouillon',
  sent: 'En attente',
  paid: 'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée',
};

const INVOICE_TYPE: Record<string, Invoice['type']> = {
  invoice: 'Facture',
  credit_note: 'Avoir',
  proforma: 'Proforma',
};

const TICKET_STATUS: Record<string, TicketStatus> = {
  open: 'Ouvert',
  in_progress: 'En cours',
  waiting_client: 'En attente client',
  resolved: 'Résolu',
  closed: 'Fermé',
};

const TICKET_PRIORITY: Record<string, TicketPriority> = {
  low: 'Basse',
  medium: 'Normale',
  high: 'Haute',
  urgent: 'Urgente',
};

const TICKET_CATEGORY: Record<string, TicketCategory> = {
  panne: 'Panne',
  maintenance: 'Maintenance',
  question: 'Question',
  livraison: 'Livraison',
  facturation: 'Facturation',
  autre: 'Autre',
};

/** Inverse d'une table de correspondance, pour les envois vers le backend */
function keyFor<T extends string>(map: Record<string, T>, value: T, fallback: string): string {
  return Object.entries(map).find(([, v]) => v === value)?.[0] ?? fallback;
}

// ── Formes brutes du backend ───────────────────────────────────────────────

interface BackendClientMachine {
  id: number;
  machine_id: number;
  machine_name?: string | null;
  category_name?: string | null;
  brand?: string | null;
  image_url?: string | null;
  serial_number?: string | null;
  installation_date?: string | null;
  location?: string | null;
  status: string;
  last_service_date?: string | null;
  next_service_date?: string | null;
  sales_count?: number | string;
}

interface BackendInvoice {
  id: number;
  invoice_number: string;
  order_id?: number | null;
  type: string;
  amount_ht: number | string;
  amount_ttc: number | string;
  status: string;
  due_date?: string | null;
  created_at?: string;
  notes?: string | null;
}

interface BackendTicket {
  id: number;
  ticket_number: string;
  machine_id?: number | null;
  machine_name?: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  admin_response?: string | null;
  created_at?: string;
}

interface BackendClientDashboard {
  kpis: {
    total_orders: number | string;
    total_spent: number | string;
    active_machines: number | string;
    pending_invoices: number | string;
    pending_invoices_amount: number | string;
    open_tickets: number | string;
  };
  machines: BackendClientMachine[];
  recent_orders: unknown[];
}

// ── Normalisation ──────────────────────────────────────────────────────────

/** Ramène une date backend à un ISO court (YYYY-MM-DD), calculable côté page */
function isoDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

function normalizeMachine(raw: BackendClientMachine): ClientMachine {
  return {
    id: String(raw.id),
    nom: raw.machine_name ?? 'Machine',
    type: raw.category_name ?? raw.brand ?? '-',
    image: raw.image_url ?? '',
    numeroSerie: raw.serial_number ?? undefined,
    // Dates laissées en ISO : les pages calculent des échéances dessus
    dateInstallation: isoDate(raw.installation_date),
    site: raw.location ?? '-',
    statut: MACHINE_STATUS[raw.status] ?? 'Hors service',
    derniereMaintenance: isoDate(raw.last_service_date) || undefined,
    prochaineMaintenance: isoDate(raw.next_service_date),
    totalVentes: toNumber(raw.sales_count),
  };
}

function normalizeInvoice(raw: BackendInvoice): Invoice {
  return {
    id: String(raw.id),
    numero: raw.invoice_number,
    date: formatDate(raw.created_at),
    description: raw.notes ?? (raw.order_id ? `Commande #${raw.order_id}` : 'Facture'),
    montant: toNumber(raw.amount_ttc),
    montantHT: toNumber(raw.amount_ht),
    statut: INVOICE_STATUS[raw.status] ?? 'En attente',
    dateEcheance: raw.due_date ? formatDate(raw.due_date) : undefined,
    commandeId: raw.order_id ? String(raw.order_id) : undefined,
    type: INVOICE_TYPE[raw.type] ?? 'Facture',
  };
}

function normalizeTicket(raw: BackendTicket): SupportTicket {
  return {
    id: String(raw.id),
    reference: raw.ticket_number,
    date: formatDate(raw.created_at),
    sujet: raw.subject,
    description: raw.description,
    categorie: TICKET_CATEGORY[raw.category] ?? 'Autre',
    priorite: TICKET_PRIORITY[raw.priority] ?? 'Normale',
    statut: TICKET_STATUS[raw.status] ?? 'Ouvert',
    reponseAdmin: raw.admin_response ?? undefined,
    machineId: raw.machine_id ? String(raw.machine_id) : undefined,
    machineNom: raw.machine_name ?? undefined,
  };
}

export interface ClientDashboardData {
  stats: ClientDashboardStats;
  machines: ClientMachine[];
}

export interface CreateTicketPayload {
  sujet: string;
  description: string;
  categorie: TicketCategory;
  priorite?: TicketPriority;
  machineId?: string;
}

// ── Service ────────────────────────────────────────────────────────────────

export const clientPortalService = {
  /** @endpoint GET /dashboard/client */
  async getDashboard(): Promise<ClientDashboardData> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return {
        stats: {
          totalCommandes: 0,
          totalDepense: 0,
          machinesActives: mockMachines.length,
          facturesEnAttente: 0,
          facturesEnAttenteMontant: 0,
          ticketsOuverts: 0,
        },
        machines: [],
      };
    }

    const raw = await apiClient.get<BackendClientDashboard>(ENDPOINTS.DASHBOARD.CLIENT);

    return {
      stats: {
        totalCommandes: toNumber(raw.kpis?.total_orders),
        totalDepense: toNumber(raw.kpis?.total_spent),
        machinesActives: toNumber(raw.kpis?.active_machines),
        facturesEnAttente: toNumber(raw.kpis?.pending_invoices),
        facturesEnAttenteMontant: toNumber(raw.kpis?.pending_invoices_amount),
        ticketsOuverts: toNumber(raw.kpis?.open_tickets),
      },
      machines: (raw.machines ?? []).map(normalizeMachine),
    };
  },

  /** @endpoint GET /clients/:id/machines */
  async getMachines(clientId: string): Promise<ClientMachine[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return mockMachines as unknown as ClientMachine[];
    }
    const raw = await apiClient.get<BackendClientMachine[]>(ENDPOINTS.CLIENTS.MACHINES(clientId));
    return (raw ?? []).map(normalizeMachine);
  },

  /** @endpoint GET /clients/:id/invoices */
  async getInvoices(clientId: string): Promise<Invoice[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return mockInvoices as unknown as Invoice[];
    }
    const raw = await apiClient.get<BackendInvoice[]>(ENDPOINTS.CLIENTS.INVOICES(clientId));
    return (raw ?? []).map(normalizeInvoice);
  },

  /** @endpoint GET /clients/:id/tickets */
  async getTickets(clientId: string): Promise<SupportTicket[]> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return mockTickets as unknown as SupportTicket[];
    }
    const raw = await apiClient.get<BackendTicket[]>(ENDPOINTS.CLIENTS.TICKETS(clientId));
    return (raw ?? []).map(normalizeTicket);
  },

  /**
   * Met à jour le profil du client connecté.
   * @endpoint PUT /clients/:id
   */
  async updateProfile(
    clientId: string,
    data: Partial<ClientProfile>,
  ): Promise<void> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      return;
    }

    await apiClient.put(ENDPOINTS.CLIENTS.UPDATE(clientId), {
      first_name: data.prenom,
      last_name: data.nom,
      phone: data.telephone,
      company_name: data.entreprise,
      address: data.adresse,
      city: data.ville,
    });
  },

  /** @endpoint POST /clients/tickets */
  async createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      throw new Error('[MOCK] Création de ticket indisponible sans backend.');
    }

    const raw = await apiClient.post<BackendTicket>(ENDPOINTS.CLIENTS.CREATE_TICKET, {
      subject: payload.sujet,
      description: payload.description,
      category: keyFor(TICKET_CATEGORY, payload.categorie, 'autre'),
      priority: keyFor(TICKET_PRIORITY, payload.priorite ?? 'Normale', 'medium'),
      machine_id: payload.machineId ? Number(payload.machineId) : undefined,
    });

    return normalizeTicket(raw);
  },
};

export type { Order };
