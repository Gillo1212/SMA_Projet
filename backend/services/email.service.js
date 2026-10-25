const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// ===================================================
// Configuration du transporteur Nodemailer
// À configurer dans .env selon votre fournisseur SMTP
// ===================================================

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const config = {
    gmail: {
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    },
    sendgrid: {
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    },
  };

  const provider = process.env.EMAIL_PROVIDER || 'smtp';
  transporter = nodemailer.createTransport(config[provider] || config.smtp);
  return transporter;
}

/**
 * Charge un template HTML et remplace les variables {{key}} par leurs valeurs
 */
function loadTemplate(templateName, variables = {}) {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf-8');
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value ?? '');
  });
  return html;
}

/**
 * Envoi générique d'un email
 */
async function sendEmail({ to, subject, templateName, variables, text }) {
  try {
    const html = templateName ? loadTemplate(templateName, variables) : undefined;
    const result = await getTransporter().sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'SMALIM'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || 'Veuillez lire cet email dans un client compatible HTML.',
    });
    console.log(`[Email] Envoyé à ${to} - messageId: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('[Email] Erreur d\'envoi:', err.message);
    return { success: false, error: err.message };
  }
}

// ===================================================
// Fonctions spécialisées par type d'email
// ===================================================

/**
 * Email de confirmation d'inscription
 */
async function sendEmailVerification(user, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/email-confirme?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Confirmez votre adresse email - SMALIM',
    templateName: 'email-verification',
    variables: {
      firstName: user.first_name,
      verifyUrl,
      expiresIn: '24 heures',
      year: new Date().getFullYear(),
    },
  });
}

/**
 * Email de bienvenue après confirmation
 */
async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: `Bienvenue dans l'espace client SMALIM, ${user.first_name} !`,
    templateName: 'welcome',
    variables: {
      firstName: user.first_name,
      clientPortalUrl: `${process.env.FRONTEND_URL}/espace-client`,
      year: new Date().getFullYear(),
    },
  });
}

/**
 * Email de réinitialisation de mot de passe.
 * `userType` permet au frontend de renvoyer vers la bonne page de connexion.
 */
async function sendPasswordReset(user, token, userType = 'client') {
  const resetUrl = `${process.env.FRONTEND_URL}/reinitialiser-mot-de-passe?token=${token}&type=${userType}`;
  return sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe - SMALIM',
    templateName: 'reset-password',
    variables: {
      firstName: user.first_name,
      resetUrl,
      expiresIn: '1 heure',
      year: new Date().getFullYear(),
    },
  });
}

/**
 * Email de confirmation de commande
 */
async function sendOrderConfirmation(user, order) {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; color:#00272B; font-size:14px;">${item.name}</td>
      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; text-align:center; color:#555; font-size:14px;">${item.quantity}</td>
      <td style="padding:10px 0; border-bottom:1px solid #f0f0f0; text-align:right; color:#00272B; font-weight:600; font-size:14px;">${Number(item.total).toLocaleString('fr-FR')} FCFA</td>
    </tr>
  `).join('');

  return sendEmail({
    to: user.email,
    subject: `Confirmation de commande #${order.order_number} - SMALIM`,
    templateName: 'order-confirmation',
    variables: {
      firstName: user.first_name,
      orderNumber: order.order_number,
      orderDate: new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      itemsHtml,
      subtotal: Number(order.subtotal).toLocaleString('fr-FR'),
      shipping: Number(order.shipping_cost).toLocaleString('fr-FR'),
      tva: Number(order.tax_amount).toLocaleString('fr-FR'),
      // Taux figé sur la commande ; 18 % pour les commandes antérieures à la colonne
      tvaRate: Number(order.tax_rate ?? 18).toLocaleString('fr-FR'),
      total: Number(order.total_amount).toLocaleString('fr-FR'),
      deliveryAddress: `${order.shipping_address}, ${order.shipping_city}`,
      trackingUrl: `${process.env.FRONTEND_URL}/espace-client/commandes`,
      year: new Date().getFullYear(),
    },
  });
}

/**
 * Email de mise à jour statut commande
 */
async function sendOrderStatusUpdate(user, order, newStatus) {
  const statusLabels = {
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  return sendEmail({
    to: user.email,
    subject: `Votre commande #${order.order_number} - ${statusLabels[newStatus] || newStatus}`,
    templateName: 'order-status',
    variables: {
      firstName: user.first_name,
      orderNumber: order.order_number,
      status: statusLabels[newStatus] || newStatus,
      trackingUrl: `${process.env.FRONTEND_URL}/espace-client/commandes`,
      year: new Date().getFullYear(),
    },
  });
}

/**
 * Email de réponse à un devis
 */
async function sendQuoteUpdate(user, quote, status) {
  return sendEmail({
    to: user.email,
    subject: `Votre devis ${quote.quote_number} - ${status === 'approved' ? 'Approuvé' : 'Mis à jour'}`,
    templateName: 'quote-update',
    variables: {
      firstName: user.first_name,
      quoteNumber: quote.quote_number,
      status: status === 'approved' ? 'approuvé' : 'mis à jour',
      amount: Number(quote.total_amount).toLocaleString('fr-FR'),
      validUntil: quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('fr-FR') : 'N/A',
      quoteUrl: `${process.env.FRONTEND_URL}/espace-client/devis`,
      year: new Date().getFullYear(),
    },
  });
}

/**
 * Email de nouvelle facture
 */
async function sendInvoiceNotification(user, invoice) {
  return sendEmail({
    to: user.email,
    subject: `Nouvelle facture ${invoice.invoice_number} disponible - SMALIM`,
    templateName: 'invoice-notification',
    variables: {
      firstName: user.first_name,
      invoiceNumber: invoice.invoice_number,
      amount: Number(invoice.total_amount).toLocaleString('fr-FR'),
      dueDate: new Date(invoice.due_date).toLocaleDateString('fr-FR'),
      invoiceUrl: `${process.env.FRONTEND_URL}/espace-client/factures`,
      year: new Date().getFullYear(),
    },
  });
}

module.exports = {
  sendEmail,
  sendEmailVerification,
  sendWelcomeEmail,
  sendPasswordReset,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendQuoteUpdate,
  sendInvoiceNotification,
};
