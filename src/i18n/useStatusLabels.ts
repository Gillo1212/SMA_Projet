/**
 * Libellés traduits des statuts.
 * ──────────────────────────────
 * Les services convertissent les statuts du backend en valeurs françaises
 * (« Livrée », « Payée »…), utilisées telles quelles pour les couleurs et
 * les filtres, y compris dans le portail admin. On ne traduit donc qu'à
 * l'affichage :
 *
 *   const status = useStatusLabels();
 *   <span>{status.order(order.statut)}</span>
 *
 * Une valeur inconnue est affichée telle quelle.
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const KEYS = {
  order: {
    'En attente': 'pending',
    'Confirmée': 'confirmed',
    'En préparation': 'processing',
    'Expédiée': 'shipped',
    'Livrée': 'delivered',
    'Annulée': 'cancelled',
    'Remboursée': 'refunded',
  },
  quote: {
    'Nouveau': 'new',
    'En cours': 'inProgress',
    'Devis envoyé': 'sent',
    'Accepté': 'accepted',
    'Refusé': 'declined',
    'Expiré': 'expired',
  },
  machine: {
    'Opérationnelle': 'operational',
    'Maintenance': 'maintenance',
    'Hors service': 'outOfService',
  },
  invoice: {
    'Payée': 'paid',
    'En attente': 'pending',
    'En retard': 'overdue',
    'Brouillon': 'draft',
    'Annulée': 'cancelled',
  },
  invoiceType: {
    'Facture': 'invoice',
    'Avoir': 'creditNote',
    'Proforma': 'proforma',
  },
  ticket: {
    'Ouvert': 'open',
    'En cours': 'inProgress',
    'En attente client': 'waitingClient',
    'Résolu': 'resolved',
    'Fermé': 'closed',
  },
  priority: {
    'Basse': 'low',
    'Normale': 'normal',
    'Haute': 'high',
    'Urgente': 'urgent',
  },
  category: {
    'Panne': 'breakdown',
    'Maintenance': 'maintenance',
    'Question': 'question',
    'Livraison': 'delivery',
    'Facturation': 'billing',
    'Autre': 'other',
  },
} as const satisfies Record<string, Record<string, string>>;

type Domain = keyof typeof KEYS;

export function useStatusLabels(): Record<Domain, (value: string) => string> {
  const { t } = useTranslation();
  // Stable tant que la langue ne change pas : utilisable en dépendance de hook
  return useMemo(() => {
    const label = (domain: Domain) => (value: string) => {
      const key = (KEYS[domain] as Record<string, string>)[value];
      return key ? t(`statuses.${domain}.${key}`) : value;
    };
    return {
      order: label('order'),
      quote: label('quote'),
      machine: label('machine'),
      invoice: label('invoice'),
      invoiceType: label('invoiceType'),
      ticket: label('ticket'),
      priority: label('priority'),
      category: label('category'),
    };
  }, [t]);
}
