import { jsPDF } from 'jspdf';
import { Order, ServiceTicket } from '../../types';
import { formatTSh, formatDate } from '../../utils/formatters';

export interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  tin: string;
  vrn?: string;
  website?: string;
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'TK STATIONERY & GENERAL SERVICES',
  tagline: 'Vifaa Bora vya Ofisi, Shule, Uchapishaji & Huduma za Kidijitali',
  address: 'Mtaa wa Manzese (Karibu na Bakhresa), Dar es Salaam, Tanzania',
  phone: '+255 787 754 202 / +255 712 345 678',
  email: 'info@tkstationery.co.tz',
  tin: '142-890-554',
  vrn: '40-029144-Z',
  website: 'www.tkstationery.co.tz'
};

export const invoicePdfService = {
  /**
   * Generates and downloads a clean, professional A4 PDF invoice for an order.
   */
  generateOrderPdf(order: Order, company: CompanyInfo = DEFAULT_COMPANY_INFO): jsPDF {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 18;

    // --- 1. Top Header & Brand Accent ---
    // Primary Amber/Gold Brand Bar
    doc.setFillColor(245, 158, 11); // Amber 500
    doc.rect(margin, y, pageWidth - (margin * 2), 2.5, 'F');
    y += 8;

    // Company Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(company.name, margin, y);

    // Document Type Banner (Right-aligned)
    const isPaid =
      order.paymentStatus === 'successful' ||
      order.paymentStatus === 'Paid' ||
      order.paymentStatus === 'completed';

    const docTypeLabel = isPaid ? 'STAKABADHI YA RISITI (RECEIPT)' : 'ANKARA YA MALIPO (INVOICE)';
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isPaid ? 16 : 217, isPaid ? 149 : 119, isPaid ? 68 : 6); // Emerald or Amber
    doc.text(docTypeLabel, pageWidth - margin, y, { align: 'right' });
    y += 5;

    // Company Subtitle & Contact Info
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(company.tagline, margin, y);

    // Status Pill on Right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const statusText = isPaid ? 'IMELIPWA • PAID' : 'INASUBIRI MALIPO • PENDING';
    doc.text(statusText, pageWidth - margin, y, { align: 'right' });
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${company.address} | Simu: ${company.phone}`, margin, y);
    doc.text(`TIN: ${company.tin} | VRN: ${company.vrn}`, pageWidth - margin, y, { align: 'right' });
    y += 4.5;

    doc.text(`Barua Pepe: ${company.email} | Tovuti: ${company.website}`, margin, y);
    y += 8;

    // Divider Line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // --- 2. Order Metadata & Customer Information Box ---
    const colWidth = (pageWidth - (margin * 2) - 8) / 2;

    // Left Box: Customer Info
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(margin, y, colWidth, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, colWidth, 32, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TAARIFA ZA MTEJA (BILLED TO):', margin + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(order.customerName || 'Mteja wa Thamani', margin + 4, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Simu: ${order.customerPhone || 'N/A'}`, margin + 4, y + 18);
    if (order.customerEmail) {
      doc.text(`Email: ${order.customerEmail}`, margin + 4, y + 23);
    }
    const deliveryStr = order.deliveryAddress
      ? `${order.deliveryMethod || 'Usafirishaji'}: ${order.deliveryAddress}`
      : `${order.deliveryMethod || 'Kuchukua Dukani Manzese'}`;
    doc.text(deliveryStr.substring(0, 45), margin + 4, y + 28);

    // Right Box: Order & Invoice Details
    const rightBoxX = margin + colWidth + 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightBoxX, y, colWidth, 32, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(rightBoxX, y, colWidth, 32, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('MAELEZO YA ODA & RISITI:', rightBoxX + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Namba ya Oda (Order ID):', rightBoxX + 4, y + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`#${order.id}`, rightBoxX + 45, y + 12);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Tarehe ya Oda (Date):', rightBoxX + 4, y + 18);
    doc.setTextColor(15, 23, 42);
    doc.text(formatDate(order.createdAt), rightBoxX + 45, y + 18);

    doc.setTextColor(71, 85, 105);
    doc.text('Njia ya Malipo (Method):', rightBoxX + 4, y + 23);
    doc.setTextColor(15, 23, 42);
    doc.text(order.paymentMethod || 'M-Pesa / Tigo / Airtel', rightBoxX + 45, y + 23);

    doc.setTextColor(71, 85, 105);
    doc.text('Hali ya Oda (Status):', rightBoxX + 4, y + 28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(order.status === 'Completed' ? 16 : 217, order.status === 'Completed' ? 149 : 119, 6);
    doc.text(order.status, rightBoxX + 45, y + 28);

    y += 39;

    // --- 3. Items Table Header ---
    const tableHeaderY = y;
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(margin, tableHeaderY, pageWidth - (margin * 2), 7.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    // Columns: No (10mm) | Description (90mm) | Qty (20mm) | Unit Price (30mm) | Total (30mm)
    doc.text('#', margin + 3, tableHeaderY + 5);
    doc.text('MAELEZO YA BIDHAA (ITEM DESCRIPTION)', margin + 12, tableHeaderY + 5);
    doc.text('IDADI', margin + 105, tableHeaderY + 5, { align: 'center' });
    doc.text('BEI (TZS)', margin + 140, tableHeaderY + 5, { align: 'right' });
    doc.text('JUMLA (TZS)', pageWidth - margin - 3, tableHeaderY + 5, { align: 'right' });

    y = tableHeaderY + 7.5;

    // --- 4. Table Rows ---
    const items = order.items || [];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    items.forEach((item, index) => {
      const itemName =
        (item as any).productName ||
        (item as any).product?.name ||
        (item as any).name ||
        'Bidhaa ya Stationery';
      const qty = item.quantity || 1;
      const unitPrice =
        Number((item as any).unitPrice) ||
        Number((item as any).product?.price) ||
        Number((item as any).price) ||
        0;
      const rowTotal =
        Number((item as any).totalPrice) ||
        qty * unitPrice;

      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(248, 250, 252);
      }
      doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');

      // Thin bottom border
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 7, pageWidth - margin, y + 7);

      doc.setTextColor(71, 85, 105);
      doc.text(String(index + 1), margin + 3, y + 4.8);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const truncatedName = itemName.length > 48 ? `${itemName.substring(0, 45)}...` : itemName;
      doc.text(truncatedName, margin + 12, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(String(qty), margin + 105, y + 4.8, { align: 'center' });
      doc.text(formatTSh(unitPrice), margin + 140, y + 4.8, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formatTSh(rowTotal), pageWidth - margin - 3, y + 4.8, { align: 'right' });

      y += 7;
    });

    y += 4;

    // --- 5. Summary & Totals Calculation Box ---
    const summaryWidth = 75;
    const summaryX = pageWidth - margin - summaryWidth;

    const subtotal = order.subtotal || order.items?.reduce((sum, it) => sum + (Number(it.totalPrice) || (it.quantity * Number(it.unitPrice)) || 0), 0) || order.total || 0;
    const deliveryFee = order.deliveryFee || 0;
    const grandTotal = order.total || order.totalAmount || (subtotal + deliveryFee);

    // Subtotal line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Jumla Ndogo (Subtotal):', summaryX, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`TZS ${formatTSh(subtotal)}`, pageWidth - margin, y, { align: 'right' });
    y += 5;

    // Delivery line if applicable
    if (deliveryFee > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Gharama ya Usafirishaji:', summaryX, y);
      doc.setTextColor(15, 23, 42);
      doc.text(`TZS ${formatTSh(deliveryFee)}`, pageWidth - margin, y, { align: 'right' });
      y += 5;
    }

    // Grand Total Bar
    y += 1;
    doc.setFillColor(245, 158, 11); // Amber 500
    doc.roundedRect(summaryX - 4, y, summaryWidth + 4, 8.5, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('JUMLA KUU (TOTAL):', summaryX, y + 5.5);
    doc.setFontSize(10.5);
    doc.text(`TZS ${formatTSh(grandTotal)}`, pageWidth - margin - 2, y + 5.5, { align: 'right' });

    y += 16;

    // --- 6. Notes & Payment Guidelines ---
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 22, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('MAELEZO YA MALIPO & MWONGOZO:', margin + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `1. Malipo ya M-Pesa / Tigo Pesa / Airtel Money yafanyike kwenda namba: 0787 754 202 (Jina: Tendo La Kristo / Amos Stationery).`,
      margin + 4,
      y + 10.5
    );
    doc.text(
      `2. Bidhaa za stationery zilizouzwa hazirudishwi isipokuwa zikiwa na hitilafu ya kiwandani ndani ya saa 24 toka kupokelewa.`,
      margin + 4,
      y + 15
    );
    doc.text(
      `3. Kwa maulizo au msaada wa haraka wasiliana na kitengo cha huduma kwa wateja: +255 787 754 202.`,
      margin + 4,
      y + 19.5
    );

    y += 28;

    // --- 7. Signatures & Official Stamp Footer ---
    const sigColWidth = (pageWidth - (margin * 2)) / 2;

    // Left: Customer Acknowledgement
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Sahihi ya Mteja / Mpokeaji:', margin, y);
    doc.line(margin, y + 10, margin + 60, y + 10);
    doc.text('Tarehe: .......................................', margin, y + 15);

    // Right: Store Signature & Seal
    doc.text('Msimamizi / Mtoa Risiti (TK Stationery):', margin + sigColWidth + 10, y);
    doc.line(margin + sigColWidth + 10, y + 10, margin + sigColWidth + 75, y + 10);

    // Stamp circle graphic simulation
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.8);
    doc.circle(pageWidth - margin - 22, y + 7, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(217, 119, 6);
    doc.text('TK STATIONERY', pageWidth - margin - 22, y + 6, { align: 'center' });
    doc.text('★ VERIFIED ★', pageWidth - margin - 22, y + 9, { align: 'center' });

    // Document footer note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Hii ni risiti rasmi ya kielektroniki iliyotolewa na mfumo wa TK Stationery tarehe ${formatDate(new Date())}. Asante kwa biashara yako!`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );

    return doc;
  },

  /**
   * Directly downloads the PDF invoice to customer's computer or mobile phone
   */
  downloadOrderPdf(order: Order, filename?: string): void {
    const doc = this.generateOrderPdf(order);
    const cleanId = (order.id || 'order').replace(/[^a-zA-Z0-9_-]/g, '_');
    const name = filename || `Ankara_TK_Stationery_${cleanId}.pdf`;
    doc.save(name);
  },

  /**
   * Generates a printable HTML string optimized for 80mm/58mm Thermal POS printers or clean A4 printing
   */
  getThermalReceiptHtml(order: Order, company: CompanyInfo = DEFAULT_COMPANY_INFO): string {
    const isPaid =
      order.paymentStatus === 'successful' ||
      order.paymentStatus === 'Paid' ||
      order.paymentStatus === 'completed';

    const subtotal =
      order.subtotal ||
      order.items?.reduce(
        (sum, it) =>
          sum +
          (Number(it.totalPrice) || (it.quantity * Number(it.unitPrice)) || 0),
        0
      ) ||
      order.total ||
      0;
    const deliveryFee = order.deliveryFee || 0;
    const grandTotal = order.total || order.totalAmount || (subtotal + deliveryFee);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Risiti #${order.id} - ${company.name}</title>
  <style>
    @media print {
      @page {
        margin: 4mm;
        size: 80mm auto;
      }
      body {
        margin: 0;
        padding: 0;
        width: 100%;
      }
    }
    body {
      font-family: 'Courier New', Courier, monospace, sans-serif;
      font-size: 12px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      max-width: 320px;
      margin: 0 auto;
      padding: 10px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .divider {
      border-bottom: 1px dashed #000;
      margin: 8px 0;
    }
    .double-divider {
      border-bottom: 2px solid #000;
      margin: 8px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0;
      font-size: 11px;
    }
    .items-table th {
      border-bottom: 1px solid #000;
      padding: 3px 0;
      text-align: left;
    }
    .items-table td {
      padding: 4px 0;
      vertical-align: top;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      font-size: 12px;
    }
    .grand-total {
      font-size: 14px;
      font-weight: bold;
      margin-top: 4px;
      padding-top: 4px;
      border-top: 1px dashed #000;
    }
    .stamp-box {
      border: 1px solid #000;
      padding: 4px;
      text-align: center;
      margin: 10px auto;
      width: 80%;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="text-center">
    <div class="bold" style="font-size: 14px;">${company.name}</div>
    <div style="font-size: 10px;">${company.tagline}</div>
    <div style="font-size: 10px;">${company.address}</div>
    <div style="font-size: 10px;">Simu: ${company.phone}</div>
    <div style="font-size: 10px;">TIN: ${company.tin}</div>
  </div>

  <div class="double-divider"></div>

  <div class="text-center bold" style="font-size: 13px;">
    ${isPaid ? '*** RISITI YA MALIPO ***' : '*** ANKARA YA ODA ***'}
  </div>

  <div class="divider"></div>

  <div><strong>Oda #:</strong> ${order.id}</div>
  <div><strong>Tarehe:</strong> ${formatDate(order.createdAt)}</div>
  <div><strong>Mteja:</strong> ${order.customerName}</div>
  <div><strong>Simu:</strong> ${order.customerPhone}</div>
  <div><strong>Uwasilishaji:</strong> ${order.deliveryMethod || 'Dukani'}</div>
  <div><strong>Malipo:</strong> ${order.paymentMethod || 'CASH / M-PESA'}</div>
  <div><strong>Hali:</strong> ${isPaid ? 'IMELIPWA' : 'INASUBIRI'}</div>

  <div class="divider"></div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Bidhaa</th>
        <th style="text-align:center;">Idd</th>
        <th style="text-align:right;">Jumla</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || []).map(it => {
        const name = (it as any).productName || (it as any).name || 'Bidhaa';
        const qty = it.quantity || 1;
        const total = Number((it as any).totalPrice) || (qty * (Number((it as any).unitPrice) || 0));
        return `
          <tr>
            <td>${name}</td>
            <td style="text-align:center;">${qty}</td>
            <td style="text-align:right;">${formatTSh(total)}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="divider"></div>

  <div class="total-row">
    <span>Jumla Ndogo:</span>
    <span>TZS ${formatTSh(subtotal)}</span>
  </div>
  ${deliveryFee > 0 ? `
    <div class="total-row">
      <span>Usafirishaji:</span>
      <span>TZS ${formatTSh(deliveryFee)}</span>
    </div>
  ` : ''}

  <div class="total-row grand-total">
    <span>JUMLA KUU:</span>
    <span>TZS ${formatTSh(grandTotal)}</span>
  </div>

  <div class="double-divider"></div>

  <div class="stamp-box">
    <div class="bold">TK STATIONERY</div>
    <div>${isPaid ? 'IMETHIBITISHWA' : 'ODA IMESAJILIWA'}</div>
    <div style="font-size: 9px;">${new Date().toLocaleDateString('sw-TZ')}</div>
  </div>

  <div class="text-center" style="font-size: 10px; margin-top: 10px;">
    <div>Asante sana kwa kufanya biashara nasi!</div>
    <div>Karibu tena TK Stationery.</div>
  </div>
</body>
</html>
`;
  },

  /**
   * Opens print dialog using a clean isolated iframe to avoid printing navigation or page noise
   */
  printOrderReceipt(order: Order, company: CompanyInfo = DEFAULT_COMPANY_INFO): void {
    const html = this.getThermalReceiptHtml(order, company);

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      // Fallback: print current window
      window.print();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Give browser a moment to render fonts and styles before triggering print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Clean up iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1500);
    }, 350);
  }
};
