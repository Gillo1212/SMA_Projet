import jsPDF from 'jspdf';

const PRIMARY = [26, 170, 63] as [number, number, number];
const DARK = [0, 39, 43] as [number, number, number];
const GRAY = [120, 130, 130] as [number, number, number];
const LIGHT = [245, 248, 247] as [number, number, number];

function drawHeader(doc: jsPDF) {
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('SMALIM', 14, 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Distributeurs Automatiques | Dakar, Sénégal', 14, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('contact@smalim.sn  |  +221 33 800 00 00', 130, 16);
  doc.text('www.smalim.sn', 130, 22);
}

function drawFooter(doc: jsPDF) {
  const pageH = 297;
  doc.setFillColor(...LIGHT);
  doc.rect(0, pageH - 14, 210, 14, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text('SMALIM SAS - RC: SN-DKR-2022-B-12345 - NINEA: 007654321 2V3', 14, pageH - 5.5);
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 148, pageH - 5.5);
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setFillColor(...LIGHT);
  doc.rect(14, y - 4, 182, 8, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(text.toUpperCase(), 16, y + 1);
  return y + 10;
}

function row(doc: jsPDF, label: string, value: string, y: number, bold = false) {
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(label, 16, y);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setTextColor(...DARK);
  doc.text(value, 90, y);
  return y + 6;
}

export interface InvoiceData {
  numero: string;
  date: string;
  description: string;
  type: string;
  /** Montant TTC */
  montant: number;
  /** Montant HT enregistré sur la facture (recalculé depuis le TTC s'il manque) */
  montantHT?: number;
  /** Taux de TVA de la facture, en % */
  tauxTVA?: number;
  statut: string;
  clientName: string;
  clientEmail?: string;
  clientCompany?: string;
}

export function generateInvoicePDF(invoice: InvoiceData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  drawHeader(doc);

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('FACTURE', 14, 44);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(invoice.numero, 14, 52);

  // Status badge
  const statusColor: [number, number, number] =
    invoice.statut === 'Payée' ? [26, 170, 63] :
    invoice.statut === 'En retard' ? [220, 50, 50] :
    [200, 140, 30];
  doc.setFillColor(...statusColor);
  doc.roundedRect(140, 37, 55, 10, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.statut.toUpperCase(), 168, 43.5, { align: 'center' });

  // Divider
  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(14, 57, 196, 57);

  let y = 67;

  // Client & date section
  y = sectionTitle(doc, 'Informations', y);

  y = row(doc, 'Client', invoice.clientName, y, true);
  if (invoice.clientCompany) y = row(doc, 'Entreprise', invoice.clientCompany, y);
  if (invoice.clientEmail) y = row(doc, 'Email', invoice.clientEmail, y);
  // La date arrive déjà formatée (jj/mm/aaaa) : new Date() ne la lirait pas
  y = row(doc, 'Date de facturation', invoice.date, y);
  y = row(doc, 'Type', invoice.type, y);
  y += 6;

  // Detail section
  y = sectionTitle(doc, 'Détail', y);

  doc.setFillColor(240, 250, 244);
  doc.rect(14, y - 1, 182, 14, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Description', 16, y + 5);
  doc.text('Montant HT', 130, y + 5);
  const rate = invoice.tauxTVA ?? 18;
  doc.text(`TVA (${rate.toLocaleString('fr-FR')}%)`, 156, y + 5);
  doc.text('Total TTC', 178, y + 5);

  y += 18;
  const ht = invoice.montantHT || Math.round(invoice.montant / (1 + rate / 100));
  const tva = invoice.montant - ht;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 70, 70);
  doc.text(invoice.description, 16, y);
  doc.text(`${ht.toLocaleString('fr-FR')} F`, 130, y);
  doc.text(`${tva.toLocaleString('fr-FR')} F`, 156, y);
  doc.text(`${invoice.montant.toLocaleString('fr-FR')} F`, 178, y);

  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, y, 196, y);

  // Total box
  y += 8;
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(120, y, 76, 18, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC', 134, y + 7);
  doc.setFontSize(13);
  doc.text(`${invoice.montant.toLocaleString('fr-FR')} FCFA`, 134, y + 14);

  // Payment info
  y += 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...GRAY);
  doc.text('Paiement accepté via : Wave · Orange Money · Carte Bancaire · Virement', 14, y);

  drawFooter(doc);
  doc.save(`Facture-${invoice.numero}.pdf`);
}

export interface OrderPDFData {
  orderNumber: string;
  items: Array<{ product: { name: string; brand: string; price: number }; quantity: number }>;
  shippingAddress: {
    firstName: string; lastName: string; address: string;
    city: string; postalCode: string; country: string;
    phone: string; email: string;
  };
  deliveryMode: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tva: number;
  total: number;
}

const deliveryLabels: Record<string, string> = {
  pickup: 'Retrait en magasin',
  standard: 'Livraison standard (3-5 jours)',
  express: 'Livraison express (24-48h)',
};

const paymentLabels: Record<string, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
};

export function generateOrderPDF(order: OrderPDFData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  drawHeader(doc);

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('BON DE COMMANDE', 14, 44);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Commande N° ${order.orderNumber}`, 14, 52);

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(140, 37, 55, 10, 3, 3, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CONFIRMÉE', 168, 43.5, { align: 'center' });

  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(14, 57, 196, 57);

  let y = 67;

  y = sectionTitle(doc, 'Informations de livraison', y);
  const addr = order.shippingAddress;
  y = row(doc, 'Destinataire', `${addr.firstName} ${addr.lastName}`, y, true);
  y = row(doc, 'Adresse', `${addr.address}, ${addr.city} ${addr.postalCode}`, y);
  y = row(doc, 'Pays', addr.country, y);
  y = row(doc, 'Téléphone', addr.phone, y);
  y = row(doc, 'Email', addr.email, y);
  y = row(doc, 'Mode de livraison', deliveryLabels[order.deliveryMode] || order.deliveryMode, y);
  y = row(doc, 'Paiement', paymentLabels[order.paymentMethod] || order.paymentMethod, y);
  y += 6;

  y = sectionTitle(doc, 'Articles commandés', y);

  // Table header
  doc.setFillColor(240, 250, 244);
  doc.rect(14, y - 1, 182, 10, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Produit', 16, y + 5);
  doc.text('Marque', 100, y + 5);
  doc.text('Qté', 140, y + 5);
  doc.text('P.U.', 156, y + 5);
  doc.text('Total', 178, y + 5);
  y += 14;

  order.items.forEach(item => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 70, 70);
    const name = item.product.name.length > 35 ? item.product.name.substring(0, 35) + '…' : item.product.name;
    doc.text(name, 16, y);
    doc.text(item.product.brand, 100, y);
    doc.text(`${item.quantity}`, 143, y);
    doc.text(`${item.product.price.toLocaleString('fr-FR')} F`, 153, y);
    doc.text(`${(item.product.price * item.quantity).toLocaleString('fr-FR')} F`, 175, y);
    y += 7;

    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.2);
    doc.line(14, y - 2, 196, y - 2);
  });

  y += 6;

  // Summary
  const summaryX = 120;
  doc.setFontSize(8.5);

  const summaryRows = [
    { label: 'Sous-total', value: `${order.subtotal.toLocaleString('fr-FR')} FCFA` },
    { label: 'Livraison', value: order.shippingCost === 0 ? 'Gratuite' : `${order.shippingCost.toLocaleString('fr-FR')} FCFA` },
    { label: 'TVA (18%)', value: `${order.tva.toLocaleString('fr-FR')} FCFA` },
  ];

  summaryRows.forEach(r => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text(r.label, summaryX, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(r.value, 196, y, { align: 'right' });
    y += 7;
  });

  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.4);
  doc.line(summaryX, y - 2, 196, y - 2);
  y += 4;

  doc.setFillColor(...PRIMARY);
  doc.roundedRect(summaryX, y, 76, 16, 3, 3, 'F');
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL TTC', summaryX + 6, y + 7);
  doc.setFontSize(11);
  doc.text(`${order.total.toLocaleString('fr-FR')} FCFA`, summaryX + 6, y + 13);

  drawFooter(doc);
  doc.save(`Commande-${order.orderNumber}.pdf`);
}
