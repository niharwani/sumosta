// One-off script: render a realistic sample invoice PDF to disk so you can
// preview the exact layout customers receive. Run with:
//   cd apps/api && npx tsx scripts/render-example-invoice.ts
//
// Note: this script bypasses the Wrangler .ttf import rule and reads the
// fonts from disk directly, so tsx can run it under plain Node.

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Re-import the invoice service to reuse types + palette, but shadow
// generateInvoicePdf with a local version that loads fonts via fs.
import type { InvoiceData } from '../src/services/invoice';

// --- inline copy of the render logic (kept in sync manually) ----------
// We can't import generateInvoicePdf directly because the module imports
// .ttf files via a Wrangler-only rule that tsx can't resolve.
const __dirname = dirname(fileURLToPath(import.meta.url));

const COLOR = {
  paper:      rgb(0.988, 0.980, 0.953),
  inkBold:    rgb(0.118, 0.094, 0.063),
  inkBody:    rgb(0.357, 0.290, 0.180),
  mute:       rgb(0.655, 0.604, 0.502),
  honey:      rgb(0.882, 0.604, 0.231),
  hairline:   rgb(0.851, 0.784, 0.639),
  terracotta: rgb(0.710, 0.306, 0.200),
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;

function money(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}
interface TextOpts { font: PDFFont; size: number; color?: ReturnType<typeof rgb>; tracking?: number }
function drawText(page: PDFPage, text: string, x: number, y: number, o: TextOpts) {
  const color = o.color ?? COLOR.inkBody;
  if (o.tracking && o.tracking !== 0) {
    let cursor = x;
    const emPx = o.size * o.tracking;
    for (const ch of [...text]) {
      page.drawText(ch, { x: cursor, y, size: o.size, font: o.font, color });
      cursor += o.font.widthOfTextAtSize(ch, o.size) + emPx;
    }
    return cursor - x - emPx;
  }
  page.drawText(text, { x, y, size: o.size, font: o.font, color });
  return o.font.widthOfTextAtSize(text, o.size);
}
function widthOf(text: string, o: TextOpts): number {
  const base = o.font.widthOfTextAtSize(text, o.size);
  if (!o.tracking) return base;
  return base + Math.max(0, [...text].length - 1) * o.size * o.tracking;
}
function drawTextRight(page: PDFPage, text: string, xRight: number, y: number, o: TextOpts) {
  drawText(page, text, xRight - widthOf(text, o), y, o);
}
function wrap(text: string, maxWidth: number, o: TextOpts): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const c = current ? current + ' ' + w : w;
    if (widthOf(c, o) <= maxWidth) current = c;
    else { if (current) lines.push(current); current = w; }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}
function hairline(page: PDFPage, x1: number, x2: number, y: number, color = COLOR.hairline) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.4, color });
}
function paymentLine(status: string, method: string | null) {
  const m = method?.toLowerCase();
  if (status === 'captured') {
    const via = m === 'razorpay' ? 'Razorpay' : m === 'cod' ? 'Cash on Delivery' : m ? m[0].toUpperCase() + m.slice(1) : 'Card';
    return { label: `Paid via ${via}`, muted: false };
  }
  if (status === 'pending' && m === 'cod') return { label: 'Cash on Delivery — due on delivery', muted: false };
  if (status === 'refunded') return { label: 'Refunded', muted: false };
  if (status === 'partially_refunded') return { label: 'Partially refunded', muted: false };
  if (status === 'failed') return { label: 'Payment failed', muted: false };
  return { label: 'Pending', muted: true };
}

async function generateInvoicePdfLocal(data: InvoiceData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const fontDir = join(__dirname, '..', 'assets', 'fonts');
  const [rBytes, mBytes, iBytes] = await Promise.all([
    readFile(join(fontDir, 'Inter-Regular.ttf')),
    readFile(join(fontDir, 'Inter-Medium.ttf')),
    readFile(join(fontDir, 'Inter-Italic.ttf')),
  ]);
  const regular = await pdf.embedFont(rBytes);
  const medium  = await pdf.embedFont(mBytes);
  const italic  = await pdf.embedFont(iBytes);

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLOR.paper });
  const contentW = PAGE_W - MARGIN * 2;
  let y = PAGE_H - MARGIN;

  const heroTop = y;
  const wordmarkSize = 14;
  const wordmarkY = heroTop - 14;
  drawText(page, 'SUMOSTA', MARGIN, wordmarkY, { font: medium, size: wordmarkSize, color: COLOR.inkBold, tracking: 0.32 });
  drawText(page, 'raw honey · bengaluru, in', MARGIN, wordmarkY - 14, { font: regular, size: 8, color: COLOR.mute });

  const rightEdge = MARGIN + contentW;
  drawTextRight(page, 'TAX INVOICE', rightEdge, heroTop - 6, { font: medium, size: 7, color: COLOR.mute, tracking: 0.18 });

  const invoiceNo = `INV-${data.orderNumber}`;
  const invNoOpts: TextOpts = { font: medium, size: 16, color: COLOR.inkBold };
  const invNoW = widthOf(invoiceNo, invNoOpts);
  const invNoY = heroTop - 28;
  page.drawRectangle({ x: rightEdge - invNoW - 4, y: invNoY - 3, width: invNoW + 8, height: 5, color: COLOR.honey, opacity: 0.55 });
  drawText(page, invoiceNo, rightEdge - invNoW, invNoY, invNoOpts);

  const pay = paymentLine(data.paymentStatus, data.paymentMethod);
  const metaLine = `${formatDate(data.createdAt)} · ${pay.label}`;
  drawTextRight(page, metaLine, rightEdge, invNoY - 14, { font: regular, size: 9, color: pay.muted ? COLOR.mute : COLOR.inkBody });

  y = heroTop - 62;
  hairline(page, MARGIN, rightEdge, y);
  y -= 22;

  const colGap = 32;
  const colW = (contentW - colGap) / 2;
  const rightColX = MARGIN + colW + colGap;

  drawText(page, 'SOLD TO', MARGIN, y, { font: medium, size: 7, color: COLOR.mute, tracking: 0.15 });
  drawText(page, 'FULFILMENT', rightColX, y, { font: medium, size: 7, color: COLOR.mute, tracking: 0.15 });
  y -= 14;

  let ly = y;
  drawText(page, data.shippingName, MARGIN, ly, { font: medium, size: 11, color: COLOR.inkBold });
  ly -= 15;
  const addrOpts: TextOpts = { font: regular, size: 9, color: COLOR.inkBody };
  const addrLines = [
    ...wrap(data.shippingAddressLine1, colW, addrOpts),
    ...(data.shippingAddressLine2 ? wrap(data.shippingAddressLine2, colW, addrOpts) : []),
    `${data.shippingCity}, ${data.shippingState} ${data.shippingPincode}`,
  ];
  for (const line of addrLines) { drawText(page, line, MARGIN, ly, addrOpts); ly -= 12; }
  ly -= 2;
  if (data.shippingPhone) { drawText(page, data.shippingPhone, MARGIN, ly, { font: regular, size: 9, color: COLOR.mute }); ly -= 12; }
  if (data.shippingEmail) { drawText(page, data.shippingEmail, MARGIN, ly, { font: regular, size: 9, color: COLOR.mute }); ly -= 12; }

  let ry = y;
  const drawMetaRow = (label: string, value: string) => {
    drawText(page, label, rightColX, ry, { font: regular, size: 9, color: COLOR.mute });
    drawText(page, value, rightColX + 72, ry, { font: medium, size: 9, color: COLOR.inkBody });
    ry -= 14;
  };
  drawMetaRow('Order', data.orderNumber);
  if (data.trackingNumber) drawMetaRow('AWB', data.trackingNumber);
  if (data.couponCode)     drawMetaRow('Coupon', data.couponCode);

  y = Math.min(ly, ry) - 14;
  hairline(page, MARGIN, rightEdge, y);
  y -= 20;

  const colX = { item: MARGIN, qty: rightEdge - 200, unit: rightEdge - 110, amount: rightEdge };
  const nameColMax = colX.qty - MARGIN - 12;

  drawText(page, 'ITEM', colX.item, y, { font: medium, size: 7, color: COLOR.mute, tracking: 0.15 });
  drawTextRight(page, 'QTY', colX.qty, y, { font: medium, size: 7, color: COLOR.mute, tracking: 0.15 });
  drawTextRight(page, 'UNIT', colX.unit, y, { font: medium, size: 7, color: COLOR.mute, tracking: 0.15 });
  drawTextRight(page, 'AMOUNT', colX.amount, y, { font: medium, size: 7, color: COLOR.mute, tracking: 0.15 });
  y -= 8;
  hairline(page, MARGIN, rightEdge, y);
  y -= 14;

  const nameOpts: TextOpts = { font: medium, size: 10, color: COLOR.inkBold };
  const subOpts:  TextOpts = { font: regular, size: 8,  color: COLOR.mute };
  const numOpts:  TextOpts = { font: regular, size: 10, color: COLOR.inkBody };

  for (const item of data.items) {
    const nameLines = wrap(item.productName, nameColMax, nameOpts);
    const subMeta = [item.variantName, item.sku].filter(Boolean).join(' · ');
    const rowH = nameLines.length * 13 + (subMeta ? 12 : 0) + 6;

    let ny = y;
    for (const line of nameLines) { drawText(page, line, colX.item, ny, nameOpts); ny -= 13; }
    if (subMeta) drawText(page, subMeta, colX.item, ny, subOpts);

    const firstLineY = y;
    drawTextRight(page, String(item.quantity), colX.qty, firstLineY, numOpts);
    drawTextRight(page, money(item.unitPrice), colX.unit, firstLineY, numOpts);
    drawTextRight(page, money(item.lineTotal), colX.amount, firstLineY, { ...numOpts, font: medium, color: COLOR.inkBold });

    y -= rowH;
  }

  y -= 6;
  hairline(page, MARGIN, rightEdge, y);
  y -= 18;

  const totalsRight  = rightEdge;
  const totalsLabelX = totalsRight - 220;
  const drawTotalRow = (label: string, value: string, opts?: { labelColor?: ReturnType<typeof rgb>; valueColor?: ReturnType<typeof rgb>; size?: number; fontLabel?: PDFFont; fontValue?: PDFFont }) => {
    const size = opts?.size ?? 10;
    drawText(page, label, totalsLabelX, y, { font: opts?.fontLabel ?? regular, size, color: opts?.labelColor ?? COLOR.inkBody });
    drawTextRight(page, value, totalsRight, y, { font: opts?.fontValue ?? regular, size, color: opts?.valueColor ?? COLOR.inkBold });
    y -= size + 6;
  };

  drawTotalRow('Subtotal', money(data.subtotal));
  if (data.discount > 0) {
    const label = data.couponCode ? `Discount · ${data.couponCode}` : 'Discount';
    drawTotalRow(label, `(${money(data.discount)})`);
  }
  drawTotalRow('Shipping', data.shippingAmount === 0 ? 'Complimentary' : money(data.shippingAmount));
  const gstInclusive = Math.round((data.total / 1.05) * 0.05 * 100) / 100;
  drawTotalRow('Includes GST 5%', money(gstInclusive), { labelColor: COLOR.mute, valueColor: COLOR.mute, size: 8 });

  y += 2;
  page.drawLine({ start: { x: totalsLabelX, y: y + 6 }, end: { x: totalsRight, y: y + 6 }, thickness: 0.8, color: COLOR.honey });
  drawText(page, 'TOTAL', totalsLabelX, y - 4, { font: medium, size: 11, color: COLOR.inkBold, tracking: 0.06 });
  drawTextRight(page, money(data.total), totalsRight, y - 4, { font: medium, size: 13, color: COLOR.inkBold });

  const footerY = MARGIN + 8;
  hairline(page, MARGIN, rightEdge, footerY + 44);

  const sig = "Nature's Golden Promise — pressed and packed by hand.";
  const sigOpts: TextOpts = { font: italic, size: 9, color: COLOR.inkBody };
  drawText(page, sig, (PAGE_W - widthOf(sig, sigOpts)) / 2, footerY + 30, sigOpts);
  const support = 'support@sumosta.com   ·   sumosta.com';
  const supportOpts: TextOpts = { font: regular, size: 8, color: COLOR.mute };
  drawText(page, support, (PAGE_W - widthOf(support, supportOpts)) / 2, footerY + 16, supportOpts);
  const legal = 'This is a computer-generated invoice and does not require a signature.';
  const legalOpts: TextOpts = { font: regular, size: 7, color: COLOR.mute };
  drawText(page, legal, (PAGE_W - widthOf(legal, legalOpts)) / 2, footerY + 4, legalOpts);

  return pdf.save();
}

const sample: InvoiceData = {
  orderNumber:  'SUMO-2026-00427',
  createdAt:    new Date().toISOString(),
  paymentStatus: 'captured',
  paymentMethod: 'razorpay',
  couponCode:    'HONEY20',
  trackingNumber: '789456123045',

  shippingName:         'Aditi Ramanathan',
  shippingPhone:        '+91 98765 43210',
  shippingEmail:        'aditi.r@example.com',
  shippingAddressLine1: 'Flat 402, Aurora Residences',
  shippingAddressLine2: '18th Main, HSR Layout Sector 3',
  shippingCity:         'Bengaluru',
  shippingState:        'Karnataka',
  shippingPincode:      '560102',

  subtotal:       2196.00,
  discount:       200.00,
  shippingAmount: 0,
  total:          1996.00,

  items: [
    { productName: 'Western Ghats Raw Honey',       variantName: '500g glass jar', sku: 'WGH-500',       quantity: 2, unitPrice: 599, lineTotal: 1198 },
    { productName: 'Himalayan Wild Honey',          variantName: '500g glass jar', sku: 'HWH-500',       quantity: 1, unitPrice: 699, lineTotal:  699 },
    { productName: 'Cardamom Golden Honey Spread',  variantName: '250g',           sku: 'SPR-CARD-250',  quantity: 1, unitPrice: 299, lineTotal:  299 },
  ],
};

(async () => {
  const bytes = await generateInvoicePdfLocal(sample);
  await writeFile('example-invoice.pdf', bytes);
  console.log(`Wrote example-invoice.pdf (${(bytes.length / 1024).toFixed(1)} KB)`);
})();
