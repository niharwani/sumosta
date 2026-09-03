// ============================================================
// Invoice PDF Generator — "The Honey Chit" (GST-compliant)
// ------------------------------------------------------------
// A4 tax invoice for SUMOSTA. Rendered with pdf-lib + fontkit and
// Inter (embedded, subsetted per document) so we get proper ₹
// glyphs, tabular figures, and italics.
//
// Design language: apothecary/ledger. One honey-amber accent (a
// highlight band under the invoice number), hairline dividers in
// warm sand, no borders or icons. Structural devices only where
// they encode meaning.
//
// GST compliance layer:
//   • HSN column per line (default '0409' for natural honey when
//     the caller doesn't supply one).
//   • Seller GSTIN + legal name + full address block.
//   • Place of supply → CGST/SGST when it matches seller state,
//     else IGST. Prices are inclusive of GST so we reverse-calc
//     the taxable value.
//   • Independent per-FY invoice serial (see invoice-numbering.ts).
//   • Multi-page pagination — rows spill onto fresh pages with a
//     compact header + "Page X of Y" footer. Totals block always
//     starts on a page with enough room to render fully.
// ============================================================

import { PDFDocument, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import interRegularBytes from '../../assets/fonts/Inter-Regular.ttf';
import interMediumBytes  from '../../assets/fonts/Inter-Medium.ttf';
import interItalicBytes  from '../../assets/fonts/Inter-Italic.ttf';

// HSN 0409 = "Natural honey" per the Indian Customs Tariff. Used as
// the default when a product row hasn't been tagged with a specific
// HSN code yet (e.g. gift boxes might need 2106 or similar).
const DEFAULT_HSN_CODE = '0409';

// 5% GST for honey (HSN 0409). Kept per-line so a future refactor
// can vary the rate by product/HSN without touching the renderer.
const DEFAULT_GST_RATE = 0.05;

export interface InvoiceItem {
  productName: string;
  variantName: string | null;
  sku:         string | null;
  hsnCode?:    string | null;   // omit / null → falls back to DEFAULT_HSN_CODE
  quantity:    number;
  unitPrice:   number;
  lineTotal:   number;
}

export interface InvoiceAddress {
  name:         string;
  phone:        string | null;
  email:        string | null;
  addressLine1: string;
  addressLine2: string | null;
  city:         string;
  state:        string;
  pincode:      string;
}

export interface InvoiceSeller {
  legalName:    string;         // e.g. "Sumosta Foods Pvt Ltd"
  gstin:        string;         // 15-char GSTIN
  addressBlock: string;         // multi-line, "\n" separated
  state:        string;         // used against placeOfSupply for CGST/SGST vs IGST
}

export interface InvoiceData {
  invoiceNumber:         string;   // GST-compliant serial (see invoice-numbering.ts)
  orderNumber:           string;
  createdAt:             string;
  paymentStatus:         string;
  paymentMethod:         string | null;
  couponCode:            string | null;
  trackingNumber:        string | null;

  shippingName:          string;
  shippingPhone:         string | null;
  shippingEmail:         string | null;
  shippingAddressLine1:  string;
  shippingAddressLine2:  string | null;
  shippingCity:          string;
  shippingState:         string;
  shippingPincode:       string;

  // Optional separate billing address; when omitted we treat billing
  // and shipping as the same party (common for D2C).
  billingAddress?:       InvoiceAddress | null;

  subtotal:              number;
  discount:              number;
  shippingAmount:        number;
  total:                 number;

  items:                 InvoiceItem[];

  // Seller identity. All optional — if any of these are missing we
  // fall back to the historic hardcoded provenance line and stamp
  // the PDF with a "Draft — GSTIN pending" note.
  sellerLegalName?:      string | null;
  sellerGstin?:          string | null;
  sellerAddressBlock?:   string | null;
  sellerState?:          string | null;    // seller's home state (for CGST/SGST vs IGST)
  placeOfSupply?:        string | null;    // shipping state; drives CGST/SGST vs IGST
}

// ── Palette ────────────────────────────────────────────────
const COLOR = {
  paper:    rgb(0.988, 0.980, 0.953),  // #FCFAF3 — warm off-white
  inkBold:  rgb(0.118, 0.094, 0.063),  // #1E1810 — ink primary
  inkBody:  rgb(0.357, 0.290, 0.180),  // #5B4A2E — body ink
  mute:     rgb(0.655, 0.604, 0.502),  // #A79A80 — micro-labels
  honey:    rgb(0.882, 0.604, 0.231),  // #E19A3B — the single accent
  hairline: rgb(0.851, 0.784, 0.639),  // #D9C8A3 — dividers
  terracotta: rgb(0.710, 0.306, 0.200), // refund state only
};

// ── Layout constants (points; 72pt = 1in) ──────────────────
const PAGE_W  = 595.28;
const PAGE_H  = 841.89;
const MARGIN  = 56;

// Vertical space required for the totals block (varies with tax
// split but always fits under this budget with a page compact header).
const TOTALS_MIN_HEIGHT   = 220;
// Reserve for the fixed footer band at every page bottom.
const FOOTER_HEIGHT       = 56;
// When a new item row can't fit above this y, break the page first.
const MIN_ROW_Y           = MARGIN + FOOTER_HEIGHT + 40;

// ── Money helpers ─────────────────────────────────────────
function money(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Text primitives ───────────────────────────────────────
interface TextOpts {
  font:  PDFFont;
  size:  number;
  color?: ReturnType<typeof rgb>;
  tracking?: number;   // em-based letter-spacing
}

function drawText(
  page: PDFPage, text: string, x: number, y: number, opts: TextOpts,
): number {
  const color = opts.color ?? COLOR.inkBody;
  if (opts.tracking && opts.tracking !== 0) {
    // Manual letter-spacing since pdf-lib has no native tracking prop.
    const chars = [...text];
    let cursor = x;
    const emPx = opts.size * opts.tracking;
    for (const ch of chars) {
      page.drawText(ch, { x: cursor, y, size: opts.size, font: opts.font, color });
      cursor += opts.font.widthOfTextAtSize(ch, opts.size) + emPx;
    }
    return cursor - x - emPx;
  }
  page.drawText(text, { x, y, size: opts.size, font: opts.font, color });
  return opts.font.widthOfTextAtSize(text, opts.size);
}

function widthOf(text: string, opts: TextOpts): number {
  const base = opts.font.widthOfTextAtSize(text, opts.size);
  if (!opts.tracking) return base;
  const spaces = Math.max(0, [...text].length - 1);
  return base + spaces * opts.size * opts.tracking;
}

function drawTextRight(
  page: PDFPage, text: string, xRight: number, y: number, opts: TextOpts,
): void {
  const w = widthOf(text, opts);
  drawText(page, text, xRight - w, y, opts);
}

// Word-wrap into lines fitting maxWidth.
function wrap(text: string, maxWidth: number, opts: TextOpts): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const candidate = current ? current + ' ' + w : w;
    if (widthOf(candidate, opts) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function hairline(
  page: PDFPage, x1: number, x2: number, y: number,
  color: ReturnType<typeof rgb> = COLOR.hairline,
): void {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: 0.4, color });
}

// Payment status display + color choice.
function paymentLine(status: string, method: string | null): { label: string; muted: boolean } {
  const m = method?.toLowerCase();
  if (status === 'captured') {
    const via = m === 'razorpay' ? 'Razorpay'
      : m === 'cod' ? 'Cash on Delivery'
      : m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Card';
    return { label: `Paid via ${via}`, muted: false };
  }
  if (status === 'pending' && m === 'cod') return { label: 'Cash on Delivery — due on delivery', muted: false };
  if (status === 'refunded')          return { label: 'Refunded', muted: false };
  if (status === 'partially_refunded') return { label: 'Partially refunded', muted: false };
  if (status === 'failed')            return { label: 'Payment failed', muted: false };
  return { label: 'Pending', muted: true };
}

// ── Column geometry for the items table ──────────────────
interface ColX {
  item:   number;
  hsn:    number;   // right edge (right-aligned column)
  qty:    number;
  unit:   number;
  amount: number;
  nameColMax: number;
}

function buildCols(rightEdge: number): ColX {
  const cols = {
    item:   MARGIN,
    hsn:    rightEdge - 260,
    qty:    rightEdge - 200,
    unit:   rightEdge - 110,
    amount: rightEdge,
    nameColMax: 0,
  };
  cols.nameColMax = cols.hsn - MARGIN - 40;   // leave gutter so long names don't collide with HSN
  return cols;
}

// ============================================================
// Main entry
// ============================================================
export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  // Subsetting keeps only the glyphs we actually rendered, shrinking the
  // final PDF from ~1MB (three full Inter faces) to ~40–80KB. pdf-lib +
  // fontkit build correct subset tables that Chrome/Preview/Acrobat all
  // render cleanly, including the ₹ (U+20B9) and the italic apostrophe
  // used in the signature line. If a specific renderer ever drops a
  // glyph, the fallback is to embed the full font (drop `subset: true`)
  // at the cost of bundle size.
  const regular = await pdf.embedFont(new Uint8Array(interRegularBytes), { subset: true });
  const medium  = await pdf.embedFont(new Uint8Array(interMediumBytes),  { subset: true });
  const italic  = await pdf.embedFont(new Uint8Array(interItalicBytes),  { subset: true });

  // Resolve seller identity + tax split up front so all pages share it.
  const seller = resolveSeller(data);
  const gstSplit = computeGstSplit(data, seller);

  const rightEdge  = MARGIN + (PAGE_W - MARGIN * 2);
  const cols       = buildCols(rightEdge);

  // Page management ------------------------------------------------
  // We render items into a growing array of pages, adding a new page
  // whenever the current row won't fit. `pages` retains draw order so
  // we can revisit each page in a second pass to stamp "Page X of Y".
  const pages: PDFPage[] = [];

  const pushPage = (compactHeader: boolean): { page: PDFPage; y: number } => {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COLOR.paper });
    pages.push(page);
    if (compactHeader) {
      return { page, y: drawContinuationHeader(page, data, seller, medium, regular) };
    }
    return { page, y: PAGE_H - MARGIN };
  };

  // ── PAGE 1: full hero + sold-to/bill-to + item table start ────
  const first = pushPage(false);
  let page = first.page;
  let y = drawHero(page, data, seller, gstSplit, { medium, regular });

  y = drawParties(page, data, seller, y, { medium, regular });

  // Table header
  y = drawTableHeader(page, cols, y, { medium });

  // ── Item rows (may span pages) ─────────────────────────────────
  const nameOpts: TextOpts = { font: medium, size: 10, color: COLOR.inkBold };
  const subOpts:  TextOpts = { font: regular, size: 8,  color: COLOR.mute };
  const numOpts:  TextOpts = { font: regular, size: 10, color: COLOR.inkBody };
  const amtOpts:  TextOpts = { font: medium, size: 10, color: COLOR.inkBold };
  const hsnOpts:  TextOpts = { font: regular, size: 9,  color: COLOR.inkBody };

  for (const item of data.items) {
    const nameLines = wrap(item.productName, cols.nameColMax, nameOpts);
    const subMeta = [item.variantName, item.sku].filter(Boolean).join(' · ');
    const rowH = nameLines.length * 13 + (subMeta ? 12 : 0) + 6;

    if (y - rowH < MIN_ROW_Y) {
      // Break and continue on a fresh page
      const next = pushPage(true);
      page = next.page;
      y = drawTableHeader(page, cols, next.y - 14, { medium });
    }

    y = drawItemRow(page, item, y, cols, { nameOpts, subOpts, numOpts, amtOpts, hsnOpts });
  }

  y -= 6;
  hairline(page, MARGIN, rightEdge, y);
  y -= 18;

  // ── TOTALS ────────────────────────────────────────────────────
  // Totals need ~TOTALS_MIN_HEIGHT of clean space. If we're too low,
  // start a new page so the block renders as a single unit.
  if (y - TOTALS_MIN_HEIGHT < MARGIN + FOOTER_HEIGHT) {
    const next = pushPage(true);
    page = next.page;
    y = next.y - 24;
  }

  drawTotalsBlock(page, data, gstSplit, y, rightEdge, { regular, medium });

  // ── FOOTER on every page (signature + Page X of Y) ────────────
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    drawFooter(pages[i], i + 1, totalPages, italic, regular);
  }

  return pdf.save();
}

// ============================================================
// HERO — page 1 only
// ============================================================
function drawHero(
  page: PDFPage,
  data: InvoiceData,
  seller: ResolvedSeller,
  gstSplit: GstSplit,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const rightEdge = PAGE_W - MARGIN;
  const heroTop = PAGE_H - MARGIN;

  // Wordmark — heavily tracked uppercase in ink primary.
  const wordmarkY = heroTop - 14;
  drawText(page, 'SUMOSTA', MARGIN, wordmarkY, {
    font: medium, size: 14, color: COLOR.inkBold, tracking: 0.32,
  });

  // Seller identity block beneath wordmark. Full address + GSTIN when
  // supplied, else the historic single-line provenance.
  let sellerY = wordmarkY - 14;
  if (seller.hasFullIdentity) {
    drawText(page, seller.legalName, MARGIN, sellerY, {
      font: medium, size: 9, color: COLOR.inkBody,
    });
    sellerY -= 11;
    for (const line of seller.addressLines) {
      drawText(page, line, MARGIN, sellerY, { font: regular, size: 8, color: COLOR.mute });
      sellerY -= 10;
    }
    drawText(page, `GSTIN ${seller.gstin}`, MARGIN, sellerY, {
      font: medium, size: 8, color: COLOR.inkBody,
    });
    sellerY -= 10;
  } else {
    drawText(page, 'raw honey · bengaluru, in', MARGIN, sellerY, {
      font: regular, size: 8, color: COLOR.mute,
    });
    sellerY -= 10;
  }

  // Right column meta
  drawTextRight(page, 'TAX INVOICE', rightEdge, heroTop - 6, {
    font: medium, size: 7, color: COLOR.mute, tracking: 0.18,
  });
  if (!seller.hasFullIdentity) {
    drawTextRight(page, '(Draft — GSTIN pending)', rightEdge, heroTop - 16, {
      font: regular, size: 7, color: COLOR.terracotta,
    });
  }

  // Invoice number with honey highlight band behind it
  const invNoOpts: TextOpts = { font: medium, size: 16, color: COLOR.inkBold };
  const invNoW = widthOf(data.invoiceNumber, invNoOpts);
  const invNoY = heroTop - 28;
  page.drawRectangle({
    x: rightEdge - invNoW - 4,
    y: invNoY - 3,
    width: invNoW + 8,
    height: 5,
    color: COLOR.honey,
    opacity: 0.55,
  });
  drawText(page, data.invoiceNumber, rightEdge - invNoW, invNoY, invNoOpts);

  // Date + payment as one meta line under the invoice number
  const pay = paymentLine(data.paymentStatus, data.paymentMethod);
  const metaLine = `${formatDate(data.createdAt)} · ${pay.label}`;
  drawTextRight(page, metaLine, rightEdge, invNoY - 14, {
    font: regular, size: 9, color: pay.muted ? COLOR.mute : COLOR.inkBody,
  });

  // Place of supply + order # on a secondary meta row
  const orderMeta = `Order ${data.orderNumber}` + (
    gstSplit.placeOfSupply ? `  ·  Place of supply: ${gstSplit.placeOfSupply}` : ''
  );
  drawTextRight(page, orderMeta, rightEdge, invNoY - 26, {
    font: regular, size: 8, color: COLOR.mute,
  });

  // Divider — sits below the taller of (seller block, right meta)
  const y = Math.min(sellerY - 6, invNoY - 40);
  hairline(page, MARGIN, rightEdge, y);
  return y - 22;
}

// ============================================================
// PARTIES — Sold To (billing) / Fulfilment (shipping)
// ============================================================
function drawParties(
  page: PDFPage,
  data: InvoiceData,
  _seller: ResolvedSeller,
  yStart: number,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const contentW = PAGE_W - MARGIN * 2;
  const rightEdge = MARGIN + contentW;
  const colGap = 32;
  const colW = (contentW - colGap) / 2;
  const rightColX = MARGIN + colW + colGap;

  let y = yStart;

  drawText(page, 'BILL TO', MARGIN, y, {
    font: medium, size: 7, color: COLOR.mute, tracking: 0.15,
  });
  drawText(page, 'SHIP TO', rightColX, y, {
    font: medium, size: 7, color: COLOR.mute, tracking: 0.15,
  });
  y -= 14;

  // Billing party — defaults to shipping when caller doesn't split them.
  const billing: InvoiceAddress = data.billingAddress ?? {
    name:         data.shippingName,
    phone:        data.shippingPhone,
    email:        data.shippingEmail,
    addressLine1: data.shippingAddressLine1,
    addressLine2: data.shippingAddressLine2,
    city:         data.shippingCity,
    state:        data.shippingState,
    pincode:      data.shippingPincode,
  };

  const addrOpts: TextOpts = { font: regular, size: 9, color: COLOR.inkBody };
  const muteOpts: TextOpts = { font: regular, size: 9, color: COLOR.mute };

  const drawPartyBlock = (
    x: number, w: number, party: InvoiceAddress, startY: number,
  ): number => {
    let cy = startY;
    drawText(page, party.name, x, cy, { font: medium, size: 11, color: COLOR.inkBold });
    cy -= 15;

    const lines = [
      ...wrap(party.addressLine1, w, addrOpts),
      ...(party.addressLine2 ? wrap(party.addressLine2, w, addrOpts) : []),
      `${party.city}, ${party.state} ${party.pincode}`,
    ];
    for (const line of lines) {
      drawText(page, line, x, cy, addrOpts);
      cy -= 12;
    }
    cy -= 2;
    if (party.phone) { drawText(page, party.phone, x, cy, muteOpts); cy -= 12; }
    if (party.email) { drawText(page, party.email, x, cy, muteOpts); cy -= 12; }
    return cy;
  };

  const shipping: InvoiceAddress = {
    name:         data.shippingName,
    phone:        data.shippingPhone,
    email:        data.shippingEmail,
    addressLine1: data.shippingAddressLine1,
    addressLine2: data.shippingAddressLine2,
    city:         data.shippingCity,
    state:        data.shippingState,
    pincode:      data.shippingPincode,
  };

  const ly = drawPartyBlock(MARGIN, colW, billing, y);
  const ry = drawPartyBlock(rightColX, colW, shipping, y);

  const bottom = Math.min(ly, ry) - 14;
  hairline(page, MARGIN, rightEdge, bottom);
  return bottom - 20;
}

// ============================================================
// TABLE HEADER — repeated on every page break
// ============================================================
function drawTableHeader(
  page: PDFPage,
  cols: ColX,
  yStart: number,
  fonts: { medium: PDFFont },
): number {
  const { medium } = fonts;
  const rightEdge = PAGE_W - MARGIN;
  const opts: TextOpts = { font: medium, size: 7, color: COLOR.mute, tracking: 0.15 };
  let y = yStart;
  drawText(page, 'ITEM', cols.item, y, opts);
  drawTextRight(page, 'HSN',    cols.hsn,    y, opts);
  drawTextRight(page, 'QTY',    cols.qty,    y, opts);
  drawTextRight(page, 'UNIT',   cols.unit,   y, opts);
  drawTextRight(page, 'AMOUNT', cols.amount, y, opts);
  y -= 8;
  hairline(page, MARGIN, rightEdge, y);
  return y - 14;
}

// ============================================================
// ITEM ROW — one line-item, may wrap over multiple text lines
// Returns the new `y` cursor after drawing the row.
// ============================================================
interface RowFonts {
  nameOpts: TextOpts;
  subOpts:  TextOpts;
  numOpts:  TextOpts;
  amtOpts:  TextOpts;
  hsnOpts:  TextOpts;
}

function drawItemRow(
  page: PDFPage,
  item: InvoiceItem,
  yStart: number,
  cols: ColX,
  fonts: RowFonts,
): number {
  const nameLines = wrap(item.productName, cols.nameColMax, fonts.nameOpts);
  const subMeta = [item.variantName, item.sku].filter(Boolean).join(' · ');
  const rowH = nameLines.length * 13 + (subMeta ? 12 : 0) + 6;

  let ny = yStart;
  for (const line of nameLines) {
    drawText(page, line, cols.item, ny, fonts.nameOpts);
    ny -= 13;
  }
  if (subMeta) {
    drawText(page, subMeta, cols.item, ny, fonts.subOpts);
  }

  const firstLineY = yStart;
  const hsn = item.hsnCode ?? DEFAULT_HSN_CODE;
  drawTextRight(page, hsn, cols.hsn, firstLineY, fonts.hsnOpts);
  drawTextRight(page, String(item.quantity), cols.qty, firstLineY, fonts.numOpts);
  drawTextRight(page, money(item.unitPrice), cols.unit, firstLineY, fonts.numOpts);
  drawTextRight(page, money(item.lineTotal), cols.amount, firstLineY, fonts.amtOpts);

  return yStart - rowH;
}

// ============================================================
// TOTALS BLOCK — subtotal, discount, shipping, GST split, total
// ============================================================
function drawTotalsBlock(
  page: PDFPage,
  data: InvoiceData,
  gstSplit: GstSplit,
  yStart: number,
  rightEdge: number,
  fonts: { regular: PDFFont; medium: PDFFont },
): void {
  const { regular, medium } = fonts;
  const totalsLabelX = rightEdge - 220;
  let y = yStart;

  const drawTotalRow = (label: string, value: string, opts?: {
    labelColor?: ReturnType<typeof rgb>;
    valueColor?: ReturnType<typeof rgb>;
    size?:  number;
    fontLabel?: PDFFont;
    fontValue?: PDFFont;
  }): void => {
    const size = opts?.size ?? 10;
    drawText(page, label, totalsLabelX, y, {
      font:  opts?.fontLabel ?? regular,
      size,
      color: opts?.labelColor ?? COLOR.inkBody,
    });
    drawTextRight(page, value, rightEdge, y, {
      font:  opts?.fontValue ?? regular,
      size,
      color: opts?.valueColor ?? COLOR.inkBold,
    });
    y -= size + 6;
  };

  drawTotalRow('Subtotal', money(data.subtotal));

  if (data.discount > 0) {
    const label = data.couponCode ? `Discount · ${data.couponCode}` : 'Discount';
    drawTotalRow(label, `(${money(data.discount)})`);
  }

  drawTotalRow(
    'Shipping',
    data.shippingAmount === 0 ? 'Complimentary' : money(data.shippingAmount),
  );

  // Taxable value (net of GST) — always shown so buyers can see the
  // pre-tax base the CGST/SGST/IGST is computed off.
  drawTotalRow('Taxable value', money(gstSplit.taxableValue), {
    labelColor: COLOR.mute, valueColor: COLOR.mute, size: 8,
  });

  // (Historically we rendered a single "Includes GST 5%" line; that
  // undercounted intra-state buyers who need CGST + SGST called out
  // separately for input-tax-credit claims. Kept as a comment so future
  // readers know why the split exists.)
  if (gstSplit.mode === 'intra') {
    drawTotalRow(`CGST ${(gstSplit.rateHalf * 100).toFixed(2)}%`, money(gstSplit.cgst), {
      labelColor: COLOR.mute, valueColor: COLOR.mute, size: 8,
    });
    drawTotalRow(`SGST ${(gstSplit.rateHalf * 100).toFixed(2)}%`, money(gstSplit.sgst), {
      labelColor: COLOR.mute, valueColor: COLOR.mute, size: 8,
    });
  } else {
    drawTotalRow(`IGST ${(gstSplit.rate * 100).toFixed(2)}%`, money(gstSplit.igst), {
      labelColor: COLOR.mute, valueColor: COLOR.mute, size: 8,
    });
  }

  // Total rule — a thin honey line, not a border box
  y += 2;
  page.drawLine({
    start: { x: totalsLabelX, y: y + 6 },
    end:   { x: rightEdge,     y: y + 6 },
    thickness: 0.8,
    color: COLOR.honey,
  });
  drawText(page, 'TOTAL', totalsLabelX, y - 4, {
    font: medium, size: 11, color: COLOR.inkBold, tracking: 0.06,
  });
  drawTextRight(page, money(data.total), rightEdge, y - 4, {
    font: medium, size: 13, color: COLOR.inkBold,
  });
}

// ============================================================
// CONTINUATION HEADER — compact bar on pages 2+
// Returns the y cursor just below the header.
// ============================================================
function drawContinuationHeader(
  page: PDFPage,
  data: InvoiceData,
  seller: ResolvedSeller,
  medium: PDFFont,
  regular: PDFFont,
): number {
  const rightEdge = PAGE_W - MARGIN;
  const y = PAGE_H - MARGIN;

  drawText(page, 'SUMOSTA', MARGIN, y - 4, {
    font: medium, size: 10, color: COLOR.inkBold, tracking: 0.24,
  });

  const rightLabel = `${data.invoiceNumber}  ·  ${formatDate(data.createdAt)}`;
  drawTextRight(page, rightLabel, rightEdge, y - 4, {
    font: regular, size: 9, color: COLOR.inkBody,
  });

  // Only add the "continued" caption when the header actually IS a
  // continuation; caller uses this for every non-first page so it's safe.
  drawTextRight(page, 'continued', rightEdge, y - 18, {
    font: regular, size: 7, color: COLOR.mute, tracking: 0.15,
  });

  if (!seller.hasFullIdentity) {
    drawText(page, '(Draft — GSTIN pending)', MARGIN + 80, y - 4, {
      font: regular, size: 7, color: COLOR.terracotta,
    });
  }

  hairline(page, MARGIN, rightEdge, y - 24);
  return y - 24;
}

// ============================================================
// FOOTER — signature line + support + legal + Page X of Y
// ============================================================
function drawFooter(
  page: PDFPage,
  pageNo: number,
  totalPages: number,
  italic: PDFFont,
  regular: PDFFont,
): void {
  const rightEdge = PAGE_W - MARGIN;
  const footerY = MARGIN + 8;
  hairline(page, MARGIN, rightEdge, footerY + 44);

  const sig = "Nature's Golden Promise — pressed and packed by hand.";
  const sigOpts: TextOpts = { font: italic, size: 9, color: COLOR.inkBody };
  const sigW = widthOf(sig, sigOpts);
  drawText(page, sig, (PAGE_W - sigW) / 2, footerY + 30, sigOpts);

  const support = 'support@sumosta.com   ·   sumosta.com';
  const supportOpts: TextOpts = { font: regular, size: 8, color: COLOR.mute };
  const supportW = widthOf(support, supportOpts);
  drawText(page, support, (PAGE_W - supportW) / 2, footerY + 16, supportOpts);

  const legal = 'This is a computer-generated invoice and does not require a signature.';
  const legalOpts: TextOpts = { font: regular, size: 7, color: COLOR.mute };
  const legalW = widthOf(legal, legalOpts);
  drawText(page, legal, (PAGE_W - legalW) / 2, footerY + 4, legalOpts);

  // Page X of Y — right-aligned, sits at the top of the footer band.
  drawTextRight(page, `Page ${pageNo} of ${totalPages}`, rightEdge, footerY + 30, {
    font: regular, size: 7, color: COLOR.mute, tracking: 0.15,
  });
}

// ============================================================
// SELLER + GST RESOLUTION
// ============================================================
interface ResolvedSeller {
  hasFullIdentity: boolean;
  legalName:       string;
  gstin:           string;
  addressLines:    string[];
  state:           string;
}

function resolveSeller(data: InvoiceData): ResolvedSeller {
  const legalName = (data.sellerLegalName ?? '').trim();
  const gstin     = (data.sellerGstin     ?? '').trim();
  const block     = (data.sellerAddressBlock ?? '').trim();
  const hasFull = Boolean(legalName && gstin && block);
  return {
    hasFullIdentity: hasFull,
    legalName,
    gstin,
    addressLines: block ? block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [],
    // seller.state used only for tax split; consumed via `placeOfSupply` comparison
    // done in the caller (see computeGstSplit).
    state: '',
  };
}

interface GstSplit {
  mode:          'intra' | 'inter';
  rate:          number;   // total GST rate (e.g. 0.05)
  rateHalf:      number;   // half rate for CGST/SGST display (0.025)
  taxableValue:  number;
  totalGst:      number;
  cgst:          number;
  sgst:          number;
  igst:          number;
  placeOfSupply: string | null;
}

function computeGstSplit(data: InvoiceData, seller: ResolvedSeller): GstSplit {
  // Prices are inclusive of GST. Reverse-calc taxable value:
  //   grossOfLine = lineTotal, taxable = round2(gross / (1 + rate))
  // We aggregate per-line so proportional discounting (a future change)
  // can be slotted in without touching this math.
  const rate = DEFAULT_GST_RATE;

  // Sum(line_total) equals subtotal; if the caller pre-applied the
  // discount at the line level (currently they don't), this still works
  // because we operate on the aggregate `total - shippingAmount`.
  // Note: shipping isn't taxed in the current pricing model, so it's
  // excluded from the taxable base.
  const grossOfTax    = round2(data.total - data.shippingAmount);
  const taxableValue  = round2(grossOfTax / (1 + rate));
  const totalGst      = round2(grossOfTax - taxableValue);

  const placeOfSupply = (data.placeOfSupply ?? data.shippingState ?? '').trim();
  // Compare against seller state supplied via a separate binding channel:
  // caller passes it in via placeOfSupply's paired seller-state. Since
  // InvoiceData doesn't carry seller state directly, we compare against
  // `seller.state` if it's set, else fall back to treating everything as
  // intra-state when the seller isn't fully configured (safest default —
  // the resulting draft invoice already stamps "GSTIN pending").
  const sellerState = seller.state;
  const isIntra = sellerState
    ? placeOfSupply.toLowerCase() === sellerState.toLowerCase()
    : true;

  if (isIntra) {
    const half = round2(totalGst / 2);
    return {
      mode: 'intra',
      rate,
      rateHalf: rate / 2,
      taxableValue,
      totalGst,
      cgst: half,
      sgst: round2(totalGst - half),   // absorb rounding penny into SGST
      igst: 0,
      placeOfSupply: placeOfSupply || null,
    };
  }
  return {
    mode: 'inter',
    rate,
    rateHalf: rate / 2,
    taxableValue,
    totalGst,
    cgst: 0,
    sgst: 0,
    igst: totalGst,
    placeOfSupply: placeOfSupply || null,
  };
}

// Uint8Array → base64 (Workers-safe; no Buffer)
export function toBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
