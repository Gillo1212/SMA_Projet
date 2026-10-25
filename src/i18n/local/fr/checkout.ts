/**
 * Traductions françaises — tunnel de commande et paiement.
 * Toute clé ajoutée ici doit l'être aussi dans `../en/checkout.ts`.
 */
export default {
  checkout: {
    back: 'Retour',
    edit: 'Modifier',
    title: 'Finaliser ma commande',

    orderLabel: 'Commande',

    steps: {
      address: 'Adresse',
      delivery: 'Livraison',
      payment: 'Paiement',
      confirmation: 'Confirmation',
    },

    address: {
      title: 'Adresse de livraison',
      firstName: 'Prénom',
      firstNamePlaceholder: 'Jean',
      lastName: 'Nom',
      lastNamePlaceholder: 'Diop',
      email: 'Email',
      emailPlaceholder: 'jean.diop@exemple.com',
      phone: 'Téléphone',
      phonePlaceholder: '+221 77 123 45 67',
      street: 'Adresse complète',
      streetPlaceholder: '123 Avenue Léopold Sédar Senghor',
      city: 'Ville',
      cityPlaceholder: 'Dakar',
      postalCode: 'Code postal',
      postalCodePlaceholder: '12000',
      country: 'Pays',
      continue: 'Continuer vers la livraison',
    },

    account: {
      title: 'Créer un compte SMALIM',
      hint: 'Suivez vos commandes, accédez à vos factures et devis',
      password: 'Mot de passe',
      passwordPlaceholder: 'Min. 8 caractères',
      confirm: 'Confirmer',
      confirmPlaceholder: 'Répétez le mot de passe',
      errorTooShort: 'Le mot de passe doit contenir au moins 8 caractères.',
      errorMismatch: 'Les mots de passe ne correspondent pas.',
    },

    delivery: {
      title: 'Mode de livraison',
      pickup: 'Retrait en magasin',
      pickupDelay: "Disponible aujourd'hui",
      standard: 'Livraison standard',
      standardDelay: '2-3 jours ouvrables',
      express: 'Livraison express',
      expressDelay: '24h',
      free: 'Gratuit',
      continue: 'Continuer vers le paiement',
    },

    payment: {
      title: 'Méthode de paiement',
      waveSubtitle: 'Paiement mobile sécurisé',
      waveHint: 'Paiement 100% sécurisé via Wave',
      orangeSubtitle: 'WebPay sécurisé',
      orangeHint: 'Transaction sécurisée Orange Money',
      continue: 'Vérifier ma commande',
      waveRedirect: 'Vous serez redirigé vers Wave pour finaliser votre paiement de manière sécurisée.',
      orangeRedirect: 'Vous serez redirigé vers Orange Money WebPay pour effectuer le paiement avec votre compte Orange Money.',
    },

    review: {
      title: 'Vérification finale',
      submit: 'Confirmer et payer',
      submitting: 'Redirection vers le paiement…',
      error: "La commande n'a pas pu être enregistrée. Réessayez.",
    },

    summary: {
      title: 'Récapitulatif',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      free: 'Gratuite',
      vat: 'TVA',
      total: 'Total',
      secure: 'Paiement 100% sécurisé',
    },
  },

  paymentReturn: {
    checking: 'Vérification du paiement…',
    checkingHint:
      'Nous attendons la confirmation de votre prestataire. Cela prend généralement quelques secondes : ne fermez pas cette page.',
    successTitle: 'Paiement confirmé',
    successHint: 'Merci ! Votre commande est confirmée et sa préparation va commencer.',
    trackOrder: 'Suivre ma commande',
    continueShopping: 'Continuer mes achats',
    failedTitle: 'Paiement non abouti',
    failedInterrupted: 'Le paiement a été interrompu ou refusé.',
    failedUnconfirmed: "Votre paiement n'a pas pu être confirmé.",
    failedKept: 'Votre commande est conservée : vous pouvez relancer le règlement.',
    seeOrders: 'Voir mes commandes',
    backToCart: 'Retour au panier',
    timeoutTitle: 'Confirmation en attente',
    timeoutHint:
      "Votre paiement est toujours en cours de traitement chez le prestataire. Aucun débit n'est perdu : dès réception, votre commande passera automatiquement en confirmée.",
    errorTitle: 'Statut indisponible',
    missingReference: 'Référence de paiement absente.',
    statusUnavailable: 'Statut du paiement indisponible.',
  },
};
