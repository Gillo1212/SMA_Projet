/**
 * English translations — checkout funnel and payment.
 * Every key here must mirror `../fr/checkout.ts`.
 */
export default {
  checkout: {
    title: 'Complete my order',

    orderLabel: 'Order',

    steps: {
      address: 'Address',
      delivery: 'Delivery',
      payment: 'Payment',
      confirmation: 'Confirmation',
    },

    address: {
      title: 'Shipping address',
      firstName: 'First name',
      firstNamePlaceholder: 'Jean',
      lastName: 'Last name',
      lastNamePlaceholder: 'Diop',
      email: 'Email',
      emailPlaceholder: 'jean.diop@example.com',
      phone: 'Phone',
      phonePlaceholder: '+221 77 123 45 67',
      street: 'Full address',
      streetPlaceholder: '123 Avenue Léopold Sédar Senghor',
      city: 'City',
      cityPlaceholder: 'Dakar',
      postalCode: 'Postal code',
      postalCodePlaceholder: '12000',
      country: 'Country',
      continue: 'Continue to delivery',
    },

    account: {
      title: 'Create a SMALIM account',
      hint: 'Track your orders, access your invoices and quotes',
      password: 'Password',
      passwordPlaceholder: 'Min. 8 characters',
      confirm: 'Confirm',
      confirmPlaceholder: 'Repeat the password',
      errorTooShort: 'The password must be at least 8 characters long.',
      errorMismatch: 'The passwords do not match.',
    },

    delivery: {
      title: 'Delivery method',
      pickup: 'In-store pickup',
      pickupDelay: 'Available today',
      standard: 'Standard delivery',
      standardDelay: '2-3 business days',
      express: 'Express delivery',
      expressDelay: '24h',
      free: 'Free',
      continue: 'Continue to payment',
    },

    payment: {
      title: 'Payment method',
      waveSubtitle: 'Secure mobile payment',
      waveHint: '100% secure payment via Wave',
      orangeSubtitle: 'Secure WebPay',
      orangeHint: 'Secure Orange Money transaction',
      continue: 'Review my order',
    },

    review: {
      title: 'Final review',
      submit: 'Confirm and pay',
      submitting: 'Redirecting to payment…',
      error: 'The order could not be saved. Please try again.',
    },

    summary: {
      title: 'Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'Free',
      vat: 'VAT',
      total: 'Total',
      secure: '100% secure payment',
    },
  },

  paymentReturn: {
    checking: 'Verifying payment…',
    checkingHint:
      'We are waiting for confirmation from your provider. This usually takes a few seconds — please do not close this page.',
    successTitle: 'Payment confirmed',
    successHint: 'Thank you! Your order is confirmed and preparation will begin shortly.',
    trackOrder: 'Track my order',
    continueShopping: 'Continue shopping',
    failedTitle: 'Payment not completed',
    failedInterrupted: 'The payment was interrupted or declined.',
    failedUnconfirmed: 'Your payment could not be confirmed.',
    failedKept: 'Your order is kept: you can restart the payment.',
    seeOrders: 'View my orders',
    backToCart: 'Back to cart',
    timeoutTitle: 'Confirmation pending',
    timeoutHint:
      'Your payment is still being processed by the provider. No charge is lost: as soon as it arrives, your order will automatically be confirmed.',
    errorTitle: 'Status unavailable',
    missingReference: 'Payment reference missing.',
    statusUnavailable: 'Payment status unavailable.',
  },
};
