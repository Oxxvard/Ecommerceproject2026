import { jsPDF } from 'jspdf';
// AutoTable pour des tableaux alignés propres
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  coupon?: {
    code: string;
    discount: number;
  };
  shippingCost?: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // En-tête
  doc.setFontSize(24);
  doc.setTextColor(26, 26, 26);
  doc.text('FACTURE', margin, yPosition);

  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text('Maison Luxe', margin, yPosition + 8);
  doc.text('Boutique de luxe en ligne', margin, yPosition + 13);

  // Numéro et date (aligné à droite)
  doc.setFontSize(10);
  const rightInfoX = pageWidth - margin;
  doc.text(`Facture n° ${data.orderNumber}`, rightInfoX, yPosition + 8, { align: 'right' });
  doc.text(`Date: ${formatDate(data.orderDate)}`, rightInfoX, yPosition + 13, { align: 'right' });

  // Ligne de séparation sous l'en-tête
  yPosition += 20;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 10;

  yPosition += 10;

  // Infos client
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 26);
  doc.text('FACTURATION & LIVRAISON', margin, yPosition);

  doc.setFontSize(9);
  doc.setTextColor(102, 102, 102);
  doc.text(`${data.shippingAddress.fullName}`, margin, yPosition + 8);
  doc.text(`${data.shippingAddress.street}`, margin, yPosition + 12);
  doc.text(
    `${data.shippingAddress.postalCode} ${data.shippingAddress.city}`,
    margin,
    yPosition + 16
  );
  doc.text(`${data.shippingAddress.country}`, margin, yPosition + 20);
  doc.text(`Email: ${data.clientEmail}`, margin, yPosition + 26);
  if (data.clientPhone) {
    doc.text(`Tél: ${data.clientPhone}`, margin, yPosition + 30);
  }

  yPosition += 45;

  // Tableau des articles avec autoTable (aligné, zébré)
  const tableStartY = yPosition;
  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['Produit', 'Qté', 'Prix', 'Total']],
    body: data.items.map((item) => [
      item.name,
      item.quantity.toString(),
      `${item.price.toFixed(2)} €`,
      `${(item.price * item.quantity).toFixed(2)} €`,
    ]),
    styles: {
      fontSize: 9,
      textColor: [60, 60, 60],
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [34, 34, 34],
      lineWidth: 0.2,
      lineColor: [230, 230, 230],
      halign: 'right',
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.52, halign: 'left' },
      1: { cellWidth: contentWidth * 0.12, halign: 'center' },
      2: { cellWidth: contentWidth * 0.18, halign: 'right' },
      3: { cellWidth: contentWidth * 0.18, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    theme: 'grid',
  });

  yPosition = (doc as any).lastAutoTable.finalY + 8;

  // Totaux
  // Totaux bloc aligné à droite (carte sobre)
  const totalsBoxWidth = 80;
  const totalsX = pageWidth - margin - totalsBoxWidth;
  doc.setLineWidth(0.2);
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(250, 250, 250);
  doc.rect(totalsX, yPosition, totalsBoxWidth, 38, 'FD');

  let ty = yPosition + 7;
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text('Sous-total', totalsX + 4, ty);
  doc.text(`${data.subtotal.toFixed(2)} €`, totalsX + totalsBoxWidth - 4, ty, {
    align: 'right',
  });
  ty += 6;

  if (data.coupon && data.coupon.discount > 0) {
    doc.setTextColor(16, 185, 129);
    doc.text(`Coupon ${data.coupon.code}`, totalsX + 4, ty);
    doc.text(`-${data.coupon.discount.toFixed(2)} €`, totalsX + totalsBoxWidth - 4, ty, {
      align: 'right',
    });
    ty += 6;
  }

  if (data.shippingCost && data.shippingCost > 0) {
    doc.setTextColor(90, 90, 90);
    doc.text('Livraison', totalsX + 4, ty);
    doc.text(`${(data.shippingCost || 0).toFixed(2)} €`, totalsX + totalsBoxWidth - 4, ty, {
      align: 'right',
    });
    ty += 6;
  }

  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  doc.setFillColor(242, 242, 242);
  doc.rect(totalsX, ty + 1, totalsBoxWidth, 10, 'F');
  doc.text('TOTAL', totalsX + 4, ty + 8);
  doc.text(`${data.total.toFixed(2)} €`, totalsX + totalsBoxWidth - 4, ty + 8, {
    align: 'right',
  });

  yPosition = ty + 18;

  // Statut
  const statusColors: Record<string, [number, number, number]> = {
    paid: [16, 185, 129],
    pending: [245, 158, 11],
    failed: [239, 68, 68],
  };

  const statusLabels: Record<string, string> = {
    paid: '✓ Paiement confirmé',
    pending: '⏳ Paiement en attente',
    failed: '✗ Paiement échoué',
  };

  const statusColor = statusColors[data.paymentStatus];
  const pillWidth = 60;
  const pillHeight = 8;
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin, yPosition - 6, pillWidth, pillHeight, 2, 2, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(statusLabels[data.paymentStatus], margin + pillWidth / 2, yPosition, {
    align: 'center',
    baseline: 'middle',
  });

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Merci pour votre achat!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Contact: support@maisonluxe.com', pageWidth / 2, footerY + 4, {
    align: 'center',
  });

  // Convertir en Buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
