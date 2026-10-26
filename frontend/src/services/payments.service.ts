/**
 * Service Paiements
 * ──────────────────
 * Le montant n'est jamais transmis par le client : le backend le relit sur la
 * commande. On envoie seulement l'identifiant de commande, et on récupère
 * l'URL du prestataire vers laquelle rediriger.
 *
 *   const session = await paymentsService.initiate(orderId);
 *   window.location.href = session.checkoutUrl;
 */

import { apiClient } from './apiClient';
import { USE_MOCK, MOCK_DELAY, ENDPOINTS } from '../config/api';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export type PaymentProvider = 'wave' | 'orange_money' | 'bank_transfer' | 'cash' | 'card';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface PaymentSession {
  reference: string;
  checkoutUrl: string;
  provider: PaymentProvider;
  /** true quand aucun compte marchand n'est configuré côté backend */
  simulated: boolean;
}

export interface PaymentStatusResult {
  reference: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  failureReason?: string;
  orderId: string;
  orderNumber: string;
  /** Statut de paiement porté par la commande elle-même */
  orderPaymentStatus: string;
  orderStatus: string;
}

interface BackendSession {
  reference: string;
  checkout_url: string;
  provider: PaymentProvider;
  simulated: boolean;
}

interface BackendStatus {
  reference: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  amount: number | string;
  currency: string;
  failure_reason?: string | null;
  order_id: number | string;
  order_number: string;
  payment_status: string;
  order_status: string;
}

function normalizeStatus(raw: BackendStatus): PaymentStatusResult {
  return {
    reference: raw.reference,
    status: raw.status,
    provider: raw.provider,
    amount: Number(raw.amount),
    currency: raw.currency,
    failureReason: raw.failure_reason ?? undefined,
    orderId: String(raw.order_id),
    orderNumber: raw.order_number,
    orderPaymentStatus: raw.payment_status,
    orderStatus: raw.order_status,
  };
}

export const paymentsService = {
  /**
   * Ouvre une session de paiement pour une commande existante.
   * @endpoint POST /payments/initiate
   */
  async initiate(orderId: string): Promise<PaymentSession> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      throw new Error('[MOCK] Connecte ton API pour lancer un paiement.');
    }

    const raw = await apiClient.post<BackendSession>(ENDPOINTS.PAYMENTS.INITIATE, {
      order_id: Number(orderId),
    });

    return {
      reference: raw.reference,
      checkoutUrl: raw.checkout_url,
      provider: raw.provider,
      simulated: raw.simulated,
    };
  },

  /**
   * Interroge l'état d'une transaction. Le frontend s'en sert au retour du
   * prestataire, le temps que le webhook parvienne au backend.
   * @endpoint GET /payments/status/:reference
   */
  async getStatus(reference: string): Promise<PaymentStatusResult> {
    if (USE_MOCK) {
      await delay(MOCK_DELAY);
      throw new Error('[MOCK] Connecte ton API pour suivre un paiement.');
    }
    const raw = await apiClient.get<BackendStatus>(ENDPOINTS.PAYMENTS.STATUS(reference));
    return normalizeStatus(raw);
  },

  /**
   * Rejoue l'issue d'un paiement — développement uniquement, le backend
   * refuse cette route en production.
   * @endpoint POST /payments/simulate
   */
  async simulate(reference: string, status: 'succeeded' | 'failed' | 'cancelled'): Promise<void> {
    await apiClient.post(ENDPOINTS.PAYMENTS.SIMULATE, { reference, status });
  },
};
