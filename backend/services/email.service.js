const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const settings = require('./settings.service');

// ===================================================
// Transport SMTP
// La configuration vient du back-office (Paramètres → Email & SMTP), à défaut
// du fichier .env (EMAIL_PROVIDER = smtp | gmail | sendgrid). SendGrid passe
// par son relais SMTP : settings.getSmtpConfig() résout chaque fournisseur en
// hôte / port / identifiants, le transport est donc le même pour tous.
// Il est reconstruit dès qu'un paramètre email change.
// ===================================================

let transporterPromise = null;

function buildTransport(cfg) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
}

async function getTransport() {
  transporterPromise ??= settings.getSmtpConfig().then(cfg => ({ cfg, transport: buildTransport(cfg) }));
  return transporterPromise;
}

settings.onChange(keys => {
  if (keys.some(k => /^(smtp_|email_|sendgrid_)/.test(k) || k === 'app_name')) transporterPromise = null;
});

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
    const { cfg, transport } = await getTransport();
    const result = await transport.sendMail({
      from: `"${cfg.fromName}" <${cfg.from}>`,
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

/**
 * Teste la configuration SMTP enregistrée : connexion + envoi d'un email.
 * Utilise un transport neuf pour tester exactement ce qui est enregistré.
 * @returns {{ success: boolean, step?: 'config'|'connect'|'send', error?: string, source?: string }}
 */
async function testSmtp(to) {
  const cfg = await settings.getSmtpConfig();
  const meta = { source: cfg.source, provider: cfg.provider };
  if (cfg.problems.length) {
    return { success: false, step: 'config', error: cfg.problems.join(' ; '), ...meta };
  }
  const transport = buildTransport(cfg);
  try {
    await transport.verify();
  } catch (err) {
    return { success: false, step: 'connect', error: explainSmtpError(cfg, err), ...meta };
  }
  try {
    await transport.sendMail({
      from: `"${cfg.fromName}" <${cfg.from}>`,
      to,
      subject: `Test d'envoi - ${cfg.fromName}`,
      text: "Cet email confirme que la configuration SMTP du back-office fonctionne.",
      html: '<p>Cet email confirme que la configuration SMTP du back-office fonctionne.</p>',
    });
  } catch (err) {
    return { success: false, step: 'send', error: explainSmtpError(cfg, err), ...meta };
  }
  return { success: true, ...meta };
}

/** Message d'erreur SMTP, complété d'une piste selon le fournisseur */
function explainSmtpError(cfg, err) {
  const msg = err.message;
  if (/\b535\b|Invalid login|authentication failed/i.test(msg)) {
    if (cfg.provider === 'sendgrid') return `${msg} — clé API SendGrid refusée : vérifiez-la et sa permission « Mail Send ».`;
    if (/gmail/i.test(cfg.host)) return `${msg} — Gmail exige un mot de passe d'application (validation en deux étapes activée).`;
  }
  if (/\b550\b|sender identity|not verified/i.test(msg) && cfg.provider === 'sendgrid') {
    return `${msg} — l'expéditeur ${cfg.from} doit être vérifié dans SendGrid (Settings → Sender Authentication).`;
  }
  return msg;
}

/**
 * Résumé de la configuration email, journalisé au démarrage du serveur
 * (sans secret). En production, une configuration incomplète est signalée
 * en erreur : aucun email (confirmation, mot de passe) ne partirait.
 */
async function logEmailConfig() {
  try {
    const cfg = await settings.getSmtpConfig();
    const where = cfg.source === 'database' ? 'back-office' : '.env';
    console.log(` Email : ${cfg.provider} via ${cfg.host || '?'}:${cfg.port} (${where}), expéditeur ${cfg.from || '?'}`);
    if (cfg.problems.length) {
      const log = process.env.NODE_ENV === 'production' ? console.error : console.warn;
      log(` Email : configuration incomplète — ${cfg.problems.join(' ; ')}`);
    }
  } catch (err) {
    console.error(' Email : lecture de la configuration impossible —', err.message);
  }
}

/**
 * Notification interne envoyée à l'équipe (nouvelle commande, stock faible…).
 * `lines` : liste de [libellé, valeur] affichée en tableau.
 */
async function sendAdminNotification(to, { subject, title, intro, lines = [], linkPath, linkLabel }) {
  const escape = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rows = lines
    .map(([label, value]) => `<tr><td style="padding:6px 0;color:rgba(0,39,43,0.6);font-size:13px;">${escape(label)}</td><td style="padding:6px 0;text-align:right;color:#00272B;font-size:13px;font-weight:600;">${escape(value)}</td></tr>`)
    .join('');
  return sendEmail({
    to,
    subject,
    templateName: 'admin-notification',
    variables: {
      title: escape(title),
      intro: escape(intro),
      rows,
      link: `${process.env.FRONTEND_URL}${linkPath || '/admin'}`,
      linkLabel: escape(linkLabel || 'Ouvrir le back-office'),
      year: new Date().getFullYear(),
    },
    text: [title, intro, ...lines.map(([l, v]) => `${l} : ${v}`)].join('\n'),
  });
}

module.exports = {
  sendEmail,
  testSmtp,
  logEmailConfig,
  sendAdminNotification,
  sendEmailVerification,
  sendWelcomeEmail,
  sendPasswordReset,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendQuoteUpdate,
  sendInvoiceNotification,
};
