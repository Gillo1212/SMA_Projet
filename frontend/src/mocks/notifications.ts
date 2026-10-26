export interface AppNotification {
  id: string;
  type: 'order' | 'quote' | 'client' | 'machine' | 'invoice' | 'support' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export const adminNotifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Nouvelle commande',
    message: 'Mamadou Diallo a passé une commande de 485 000 FCFA',
    time: 'Il y a 5 min',
    read: false,
    link: '/admin/commandes',
  },
  {
    id: 'n2',
    type: 'quote',
    title: 'Demande de devis',
    message: 'Fatou Ndiaye a soumis une demande de devis pour 2 machines',
    time: 'Il y a 18 min',
    read: false,
    link: '/admin/devis',
  },
  {
    id: 'n3',
    type: 'client',
    title: 'Nouveau client',
    message: 'Inscription de Cheikh Mbaye - entreprise BTP Dakar SARL',
    time: 'Il y a 1h',
    read: false,
    link: '/admin/clients',
  },
  {
    id: 'n4',
    type: 'support',
    title: 'Ticket support ouvert',
    message: 'Abdou Sow a ouvert un ticket : "Panne moteur compresseur"',
    time: 'Il y a 2h',
    read: true,
    link: '/admin/clients',
  },
  {
    id: 'n5',
    type: 'order',
    title: 'Commande expédiée',
    message: 'Commande #SMA-8821 marquée comme expédiée avec succès',
    time: 'Il y a 3h',
    read: true,
    link: '/admin/commandes',
  },
  {
    id: 'n6',
    type: 'machine',
    title: 'Stock faible',
    message: 'Perceuse SDS+ Pro 900W - plus que 2 unités en stock',
    time: 'Il y a 5h',
    read: true,
    link: '/admin/machines',
  },
  {
    id: 'n7',
    type: 'invoice',
    title: 'Facture en retard',
    message: 'Facture FAC-2024-021 de Serigne Fall - 30 jours de retard',
    time: 'Hier',
    read: true,
    link: '/admin/clients',
  },
];

export const clientNotifications: AppNotification[] = [
  {
    id: 'cn1',
    type: 'order',
    title: 'Commande expédiée',
    message: 'Votre commande #SMA-8817 est en route - livraison prévue demain',
    time: 'Il y a 30 min',
    read: false,
    link: '/espace-client/commandes',
  },
  {
    id: 'cn2',
    type: 'quote',
    title: 'Devis disponible',
    message: 'Votre devis DEV-2024-018 a été préparé - montant : 1 250 000 FCFA',
    time: 'Il y a 2h',
    read: false,
    link: '/espace-client/devis',
  },
  {
    id: 'cn3',
    type: 'invoice',
    title: 'Nouvelle facture',
    message: 'Facture FAC-2024-024 disponible - 185 000 FCFA',
    time: 'Hier',
    read: false,
    link: '/espace-client/factures',
  },
  {
    id: 'cn4',
    type: 'support',
    title: 'Ticket résolu',
    message: 'Votre ticket #SAV-0042 a été résolu par notre équipe technique',
    time: 'Il y a 2 jours',
    read: true,
    link: '/espace-client/support',
  },
  {
    id: 'cn5',
    type: 'machine',
    title: 'Maintenance planifiée',
    message: 'Maintenance préventive de votre Bétonnière 350L le 25/03/2026',
    time: 'Il y a 3 jours',
    read: true,
    link: '/espace-client/machines',
  },
];
