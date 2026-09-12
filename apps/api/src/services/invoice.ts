// ============================================================
// Invoice PDF Generator — GST-compliant tax invoice
// ------------------------------------------------------------
// Renders the SUMOSTA tax invoice per SUMOSTA_Invoice_Template.pdf
// (CA-approved layout). Structure:
//
//   ┌───────────────────────────────────────────────────────┐
//   │ SUMOSTA                                   TAX INVOICE │
//   ├────────────────────────────┬──────────────────────────┤
//   │ Seller Details             │ Invoice No / Date / …    │
//   ├────────────────────────────┴──────────────────────────┤
//   │ Bill To / Ship To                                     │
//   ├───────────────────────────────────────────────────────┤
//   │ Sl │ Description │ HSN │ Qty │ Gross │ Disc │ Taxable │
//   │    │             │     │     │ Rate  │      │ Value   │
//   │    │             │     │     │       │      │ + tax   │
//   │    │             │     │     │       │      │ + total │
//   ├───────────────────────────────────────────────────────┤
//   │                                Total Taxable Value ₹… │
//   │                                Total CGST 2.5% ₹…     │
//   │                                Total SGST 2.5% ₹…     │
//   │                                Grand Total ₹…         │
//   ├───────────────────────────────────────────────────────┤
//   │ Amount Chargeable (in words): INR …                   │
//   ├───────────────────────────────────────────────────────┤
//   │ Terms & Conditions               For SUMOSTA          │
//   │ 1. …                             Authorized Signatory │
//   └───────────────────────────────────────────────────────┘
//
// GST compliance layer:
//   • Invoice number `SUMOSTA-YYYY-NNNN` minted per calendar year.
//   • Composite supply: shipping inherits the 5% principal rate
//     (HSN 9965). See TechDevNote §2.
//   • Intra-state (SELLER_STATE == shipping state): CGST 2.5% +
//     SGST 2.5%. Inter-state: single IGST 5% column.
//   • Prices are GST-inclusive; reverse-calc via divide-by-1.05
//     AFTER coupon discount is applied per §4.
// ============================================================

import { PDFDocument, rgb, PDFFont, PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import interRegularBytes from '../../assets/fonts/Inter-Regular.ttf';
import interMediumBytes  from '../../assets/fonts/Inter-Medium.ttf';
import interItalicBytes  from '../../assets/fonts/Inter-Italic.ttf';

// HSN 0409 = "Natural honey" per the Indian Customs Tariff. Default when
// a product row hasn't been tagged with a specific HSN.
const DEFAULT_HSN_CODE = '0409';
const SHIPPING_HSN_CODE = '9965';

// 5% GST for honey (HSN 0409). Composite supply extends this rate to
// shipping (HSN 9965) — see TechDevNote §2.
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

export interface InvoiceData {
  invoiceNumber:         string;
  orderNumber:           string;
  createdAt:             string;
  paymentStatus:         string;
  paymentMethod:         string | null;
  razorpayPaymentId?:    string | null;
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

  billingAddress?:       InvoiceAddress | null;

  subtotal:              number;
  discount:              number;
  shippingAmount:        number;
  total:                 number;

  items:                 InvoiceItem[];

  sellerLegalName?:      string | null;
  sellerGstin?:          string | null;
  sellerAddressBlock?:   string | null;
  sellerState?:          string | null;
  sellerEmail?:          string | null;
  placeOfSupply?:        string | null;
}

// ── Palette (template-aligned) ────────────────────────────
const COLOR = {
  paper:      rgb(1, 1, 1),                    // pure white body
  ink:        rgb(0.118, 0.094, 0.063),        // #1E1810
  body:       rgb(0.235, 0.208, 0.169),        // #3C352B
  mute:       rgb(0.478, 0.435, 0.376),        // #7A6E60
  accent:     rgb(0.514, 0.318, 0.129),        // #834F21 — template brown
  accentBg:   rgb(0.541, 0.345, 0.157),        // #8A5828 — table header bg
  boxBorder:  rgb(0.784, 0.741, 0.690),        // #C8BDB0
  softFill:   rgb(0.973, 0.965, 0.945),        // #F8F6F1
};

// ── Layout constants (points; 72pt = 1in) ──────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;

// ── Money + text helpers ─────────────────────────────────
function money(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function num2(amount: number): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// ── Text primitives ──────────────────────────────────────
interface TextOpts {
  font:  PDFFont;
  size:  number;
  color?: ReturnType<typeof rgb>;
}

function drawText(page: PDFPage, text: string, x: number, y: number, opts: TextOpts): void {
  page.drawText(text, {
    x, y, size: opts.size, font: opts.font,
    color: opts.color ?? COLOR.body,
  });
}

function widthOf(text: string, opts: TextOpts): number {
  return opts.font.widthOfTextAtSize(text, opts.size);
}

function drawTextRight(page: PDFPage, text: string, rightX: number, y: number, opts: TextOpts): void {
  drawText(page, text, rightX - widthOf(text, opts), y, opts);
}

function drawTextCenter(page: PDFPage, text: string, centerX: number, y: number, opts: TextOpts): void {
  drawText(page, text, centerX - widthOf(text, opts) / 2, y, opts);
}

// Wrap text to a given width, breaking on spaces. Returns physical lines.
function wrap(text: string, maxWidth: number, opts: TextOpts): string[] {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (widthOf(candidate, opts) <= maxWidth) {
      line = candidate;
    } else {
      if (line) out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  return out;
}

// Draw a rectangular border, optionally with a fill.
function drawBox(
  page: PDFPage,
  x: number, y: number, w: number, h: number,
  opts?: { fill?: ReturnType<typeof rgb>; border?: ReturnType<typeof rgb>; borderWidth?: number },
): void {
  if (opts?.fill) {
    page.drawRectangle({ x, y, width: w, height: h, color: opts.fill });
  }
  page.drawRectangle({
    x, y, width: w, height: h,
    borderColor: opts?.border ?? COLOR.boxBorder,
    borderWidth: opts?.borderWidth ?? 0.6,
  });
}

// ============================================================
// GST state-code lookup + place-of-supply formatting
// ============================================================
const STATE_GST_CODES: Record<string, string> = {
  'andaman and nicobar islands': '35', 'andhra pradesh': '37', 'arunachal pradesh': '12',
  'assam': '18', 'bihar': '10', 'chandigarh': '04', 'chhattisgarh': '22',
  'dadra and nagar haveli and daman and diu': '26', 'delhi': '07', 'goa': '30',
  'gujarat': '24', 'haryana': '06', 'himachal pradesh': '02', 'jammu and kashmir': '01',
  'jharkhand': '20', 'karnataka': '29', 'kerala': '32', 'ladakh': '38',
  'lakshadweep': '31', 'madhya pradesh': '23', 'maharashtra': '27', 'manipur': '14',
  'meghalaya': '17', 'mizoram': '15', 'nagaland': '13', 'odisha': '21',
  'puducherry': '34', 'punjab': '03', 'rajasthan': '08', 'sikkim': '11',
  'tamil nadu': '33', 'telangana': '36', 'tripura': '16', 'uttar pradesh': '09',
  'uttarakhand': '05', 'west bengal': '19',
};

function stateGstCode(name: string): string | null {
  return STATE_GST_CODES[name.trim().toLowerCase()] ?? null;
}

function formatStateWithCode(name: string): string {
  const clean = name.trim();
  if (!clean) return '';
  const code = stateGstCode(clean);
  return code ? `${clean} (Code: ${code})` : clean;
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
  email:           string;
}

function resolveSeller(data: InvoiceData): ResolvedSeller {
  const legalName = (data.sellerLegalName ?? '').trim();
  const gstin     = (data.sellerGstin ?? '').trim();
  const block     = (data.sellerAddressBlock ?? '').trim();
  const state     = (data.sellerState ?? '').trim();
  const email     = (data.sellerEmail ?? '').trim();
  const hasFull = Boolean(legalName && gstin && block);
  return {
    hasFullIdentity: hasFull,
    legalName,
    gstin,
    addressLines: block ? block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : [],
    state,
    email,
  };
}

interface GstSplit {
  mode:            'intra' | 'inter';
  rate:            number;
  rateHalf:        number;
  itemsTaxable:    number;
  shippingTaxable: number;
  taxableValue:    number;
  itemsGst:        number;
  shippingGst:     number;
  totalGst:        number;
  cgst:            number;
  sgst:            number;
  igst:            number;
  placeOfSupply:   string;   // "Maharashtra (Code: 27)" for header + totals
  placeOfSupplyRaw: string;  // "Maharashtra" — used for state-of-supply comparison
}

function computeGstSplit(data: InvoiceData, seller: ResolvedSeller): GstSplit {
  // Composite supply: shipping shares the 5% rate. Reverse-calc after
  // applying discount to items (TechDevNote §4).
  const rate = DEFAULT_GST_RATE;

  const itemsNetInclusive = round2(data.subtotal - data.discount);
  const itemsTaxable      = round2(itemsNetInclusive / (1 + rate));
  const itemsGst          = round2(itemsNetInclusive - itemsTaxable);

  const shippingTaxable = data.shippingAmount > 0
    ? round2(data.shippingAmount / (1 + rate))
    : 0;
  const shippingGst = data.shippingAmount > 0
    ? round2(data.shippingAmount - shippingTaxable)
    : 0;

  const taxableValue = round2(itemsTaxable + shippingTaxable);
  const totalGst     = round2(itemsGst + shippingGst);

  const rawPos = (data.placeOfSupply ?? data.shippingState ?? '').trim();
  const isIntra = seller.state
    ? rawPos.toLowerCase() === seller.state.toLowerCase()
    : true;

  if (isIntra) {
    const half = round2(totalGst / 2);
    return {
      mode: 'intra',
      rate, rateHalf: rate / 2,
      itemsTaxable, shippingTaxable, taxableValue,
      itemsGst, shippingGst, totalGst,
      cgst: half,
      sgst: round2(totalGst - half),
      igst: 0,
      placeOfSupply: formatStateWithCode(rawPos),
      placeOfSupplyRaw: rawPos,
    };
  }
  return {
    mode: 'inter',
    rate, rateHalf: rate / 2,
    itemsTaxable, shippingTaxable, taxableValue,
    itemsGst, shippingGst, totalGst,
    cgst: 0, sgst: 0,
    igst: totalGst,
    placeOfSupply: formatStateWithCode(rawPos),
    placeOfSupplyRaw: rawPos,
  };
}

// ============================================================
// Per-line breakdown — distribute order-level discount by line
// weight and reverse-calc each row's taxable value + tax split.
// ============================================================
interface LineBreakdown {
  serialNumber: number;
  description:  string;
  hsn:          string;
  qty:          number;
  grossRate:    number;   // unit_price × qty (GST-inclusive)
  discount:     number;   // proportional share of order-level discount
  taxable:      number;   // (gross - discount) / 1.05
  cgst:         number;
  sgst:         number;
  igst:         number;
  total:        number;   // gross - discount (net inclusive)
  isShipping:   boolean;
}

function computeLineBreakdowns(data: InvoiceData, split: GstSplit): LineBreakdown[] {
  const rate = split.rate;
  const halfRate = split.rateHalf;
  const rows: LineBreakdown[] = [];
  const subtotal = data.subtotal;
  const totalDiscount = data.discount;
  const running = { discountUsed: 0 };

  data.items.forEach((item, idx) => {
    const gross = round2(item.lineTotal);
    // Proportional discount by line weight, absorbing rounding penny into
    // the last item so the sum matches the order-level discount exactly.
    let disc = 0;
    if (totalDiscount > 0 && subtotal > 0) {
      const isLast = idx === data.items.length - 1;
      disc = isLast
        ? round2(totalDiscount - running.discountUsed)
        : round2((gross / subtotal) * totalDiscount);
      running.discountUsed = round2(running.discountUsed + disc);
    }
    const netInclusive = round2(gross - disc);
    const taxable = round2(netInclusive / (1 + rate));
    const taxAmount = round2(netInclusive - taxable);
    const description = item.variantName
      ? `${item.productName} ${item.variantName}`.trim()
      : item.productName;
    rows.push({
      serialNumber: idx + 1,
      description,
      hsn:          item.hsnCode ?? DEFAULT_HSN_CODE,
      qty:          item.quantity,
      grossRate:    gross,
      discount:     disc,
      taxable,
      cgst:         split.mode === 'intra' ? round2(taxable * halfRate) : 0,
      sgst:         split.mode === 'intra' ? round2(taxable * halfRate) : 0,
      igst:         split.mode === 'inter' ? taxAmount : 0,
      total:        netInclusive,
      isShipping:   false,
    });
  });

  if (data.shippingAmount > 0) {
    const gross = round2(data.shippingAmount);
    const taxable = split.shippingTaxable;
    const taxAmount = split.shippingGst;
    rows.push({
      serialNumber: rows.length + 1,
      description:  'Shipping & Delivery Charges (Composite)',
      hsn:          SHIPPING_HSN_CODE,
      qty:          1,
      grossRate:    gross,
      discount:     0,
      taxable,
      cgst:         split.mode === 'intra' ? round2(taxable * halfRate) : 0,
      sgst:         split.mode === 'intra' ? round2(taxable * halfRate) : 0,
      igst:         split.mode === 'inter' ? taxAmount : 0,
      total:        gross,
      isShipping:   true,
    });
  }

  return rows;
}

// ============================================================
// Amount → words (Indian numbering, whole rupees + paise)
// ============================================================
const AIW_ONES = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const AIW_TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function twoDigitsToWords(n: number): string {
  if (n < 20) return AIW_ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return o === 0 ? AIW_TENS[t] : `${AIW_TENS[t]}-${AIW_ONES[o]}`;
}

function threeDigitsToWords(n: number): string {
  const h = Math.floor(n / 100), rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(`${AIW_ONES[h]} Hundred`);
  if (rest > 0) parts.push(twoDigitsToWords(rest));
  return parts.join(' ');
}

function integerToIndianWords(n: number): string {
  if (n === 0) return 'Zero';
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000);
  n %= 10_000_000;
  const lakh = Math.floor(n / 100_000);
  n %= 100_000;
  const thousand = Math.floor(n / 1_000);
  n %= 1_000;
  if (crore > 0)    parts.push(`${twoDigitsToWords(crore)} Crore`);
  if (lakh > 0)     parts.push(`${twoDigitsToWords(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoDigitsToWords(thousand)} Thousand`);
  if (n > 0)        parts.push(threeDigitsToWords(n));
  return parts.join(' ');
}

function amountToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  const rupeeWords = integerToIndianWords(rupees);
  const paiseWords = paise > 0 ? twoDigitsToWords(paise) : '';
  if (paiseWords) {
    return `INR ${rupeeWords} and ${paiseWords} Paise Only`;
  }
  return `INR ${rupeeWords} Rupees Only`;
}

// ============================================================
// Main entry
// ============================================================
export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  // Subsetting off — the previous "tracking" (per-character draw) mode
  // masked pdf-lib's subset bug where multi-glyph text runs occasionally
  // drop the glyph tables PDF viewers need. Full-embed adds ~200KB per
  // invoice but renders cleanly across every PDF viewer we've tested.
  const regular = await pdf.embedFont(new Uint8Array(interRegularBytes));
  const medium  = await pdf.embedFont(new Uint8Array(interMediumBytes));
  const italic  = await pdf.embedFont(new Uint8Array(interItalicBytes));

  const seller = resolveSeller(data);
  const gstSplit = computeGstSplit(data, seller);
  const lines = computeLineBreakdowns(data, gstSplit);

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const contentLeft = MARGIN;
  const contentRight = PAGE_W - MARGIN;
  const contentWidth = contentRight - contentLeft;

  let y = PAGE_H - MARGIN;

  // ── Wordmark + TAX INVOICE ────────────────────────────────
  drawText(page, 'SUMOSTA', contentLeft, y - 22, {
    font: medium, size: 26, color: COLOR.ink,
  });
  drawTextRight(page, 'TAX INVOICE', contentRight, y - 20, {
    font: medium, size: 20, color: COLOR.accent,
  });
  y -= 42;

  // ── Info boxes: Seller | Meta ─────────────────────────────
  const boxGap = 10;
  const boxWidth = (contentWidth - boxGap) / 2;
  const sellerBoxY = y;
  const sellerBoxHeight = drawSellerBox(
    page, contentLeft, sellerBoxY, boxWidth, seller,
    { medium, regular },
  );
  const metaBoxHeight = drawMetaBox(
    page, contentLeft + boxWidth + boxGap, sellerBoxY, boxWidth, data, gstSplit,
    { medium, regular },
  );
  const infoRowHeight = Math.max(sellerBoxHeight, metaBoxHeight);
  y -= infoRowHeight + 8;

  // ── Bill-To / Ship-To box (full width) ────────────────────
  const billToHeight = drawBillToBox(
    page, contentLeft, y, contentWidth, data,
    { medium, regular },
  );
  y -= billToHeight + 8;

  // ── Item table ────────────────────────────────────────────
  const cols = buildTableColumns(contentLeft, contentRight, gstSplit.mode);
  const headerHeight = 22;
  drawTableHeader(page, cols, y, headerHeight, gstSplit.mode, { medium });
  y -= headerHeight;

  const numOpts: TextOpts = { font: regular, size: 8, color: COLOR.body };
  const descOpts: TextOpts = { font: regular, size: 8.5, color: COLOR.body };
  for (const row of lines) {
    y = drawTableRow(page, row, cols, y, gstSplit.mode, { descOpts, numOpts });
  }

  y -= 12;

  // Recompute the summary CGST/SGST/IGST from the actual per-row values.
  // Ensures the totals tie out exactly with what the buyer sees added up
  // in the table (avoids the 1-paise drift that comes from rounding
  // `totalGst / 2` independently from the row rounding).
  const rolledUp = lines.reduce(
    (acc, r) => ({
      taxable: round2(acc.taxable + r.taxable),
      cgst:    round2(acc.cgst    + r.cgst),
      sgst:    round2(acc.sgst    + r.sgst),
      igst:    round2(acc.igst    + r.igst),
    }),
    { taxable: 0, cgst: 0, sgst: 0, igst: 0 },
  );
  const totalsForDisplay: GstSplit = {
    ...gstSplit,
    taxableValue: rolledUp.taxable,
    cgst:         rolledUp.cgst,
    sgst:         rolledUp.sgst,
    igst:         rolledUp.igst,
    totalGst:     round2(rolledUp.cgst + rolledUp.sgst + rolledUp.igst),
  };

  // ── Totals block (right-aligned) ──────────────────────────
  y = drawTotalsBlock(page, totalsForDisplay, data.total, y, contentRight, { medium, regular });

  y -= 12;

  // ── Amount in words ───────────────────────────────────────
  const wordsHeight = drawAmountInWords(page, contentLeft, y, contentWidth, data.total, { medium, regular });
  y -= wordsHeight + 8;

  // ── Seller bank details ───────────────────────────────────
  const bankHeight = drawBankDetails(page, contentLeft, y, contentWidth, { medium, regular });
  y -= bankHeight + 10;

  // ── Terms & Conditions + Signatory ────────────────────────
  drawTermsAndSignatory(page, contentLeft, y, contentWidth, seller, { medium, regular });

  // ── Draft badge if identity incomplete ────────────────────
  if (!seller.hasFullIdentity) {
    drawTextRight(page, '(Draft — GSTIN pending)', contentRight, PAGE_H - MARGIN - 2, {
      font: italic, size: 8, color: rgb(0.710, 0.306, 0.200),
    });
  }

  return pdf.save();
}

// ============================================================
// Info boxes — Seller (left) + Invoice meta (right)
// ============================================================
function drawSellerBox(
  page: PDFPage, x: number, y: number, w: number,
  seller: ResolvedSeller,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const padX = 10;
  const lineH = 12;

  // Estimate height first
  const addressLines = seller.addressLines.length ||
    (seller.hasFullIdentity ? 0 : 1);
  const contentLines = 1 /* label */ + 1 /* legal name */ + addressLines +
    (seller.gstin ? 1 : 0) + (seller.email ? 1 : 0);
  const height = 10 + contentLines * lineH + 6;

  drawBox(page, x, y - height, w, height);

  let cy = y - 14;
  drawText(page, 'Seller Details:', x + padX, cy, {
    font: medium, size: 9, color: COLOR.mute,
  });
  cy -= lineH + 2;

  drawText(page, seller.legalName || 'SUMOSTA', x + padX, cy, {
    font: medium, size: 10, color: COLOR.ink,
  });
  cy -= lineH;

  const bodyOpts: TextOpts = { font: regular, size: 9, color: COLOR.body };
  if (seller.hasFullIdentity) {
    for (const line of seller.addressLines) {
      drawText(page, line, x + padX, cy, bodyOpts);
      cy -= lineH;
    }
    drawText(page, `GSTIN: ${seller.gstin}`, x + padX, cy, {
      font: medium, size: 9, color: COLOR.body,
    });
    cy -= lineH;
  } else {
    drawText(page, 'GSTIN pending', x + padX, cy, {
      font: regular, size: 9, color: COLOR.mute,
    });
    cy -= lineH;
  }
  if (seller.email) {
    drawText(page, `Email: ${seller.email}`, x + padX, cy, bodyOpts);
  }

  return height;
}

function drawMetaBox(
  page: PDFPage, x: number, y: number, w: number,
  data: InvoiceData, gstSplit: GstSplit,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const padX = 10;
  const lineH = 12;

  const rows: [string, string][] = [
    ['Invoice No:', data.invoiceNumber],
    ['Invoice Date:', formatDate(data.createdAt)],
    ['Order ID:', data.orderNumber],
    ['State of Supply:', gstSplit.placeOfSupply || '—'],
    ['Reverse Charge:', 'No'],
  ];
  if (data.razorpayPaymentId) {
    rows.push(['Payment ID:', data.razorpayPaymentId]);
  }

  const height = 10 + rows.length * lineH + 6;
  drawBox(page, x, y - height, w, height);

  let cy = y - 14;
  for (const [label, value] of rows) {
    drawText(page, label, x + padX, cy, { font: medium, size: 9, color: COLOR.ink });
    const labelW = widthOf(label, { font: medium, size: 9 });
    drawText(page, value, x + padX + labelW + 4, cy, {
      font: regular, size: 9, color: COLOR.body,
    });
    cy -= lineH;
  }

  return height;
}

// ============================================================
// Bill To / Ship To (single block — they're identical for D2C)
// ============================================================
function drawBillToBox(
  page: PDFPage, x: number, y: number, w: number,
  data: InvoiceData,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const padX = 10;
  const lineH = 12;

  const billing = data.billingAddress ?? {
    name:         data.shippingName,
    addressLine1: data.shippingAddressLine1,
    addressLine2: data.shippingAddressLine2,
    city:         data.shippingCity,
    state:        data.shippingState,
    pincode:      data.shippingPincode,
    phone:        data.shippingPhone,
    email:        data.shippingEmail,
  };

  const cityLine = `${billing.city}, ${billing.state ?? ''} - ${billing.pincode}`.replace(/\s+,/g, ',').trim();
  const stateLine = billing.state ? `State: ${formatStateWithCode(billing.state)}` : null;
  // Buyer contact — phone and/or email, joined on one line so GST auditors
  // can trace the recipient without cluttering the block.
  const contactBits: string[] = [];
  if (billing.phone) contactBits.push(billing.phone);
  if (billing.email) contactBits.push(billing.email);
  const contactLine = contactBits.length > 0 ? contactBits.join(' · ') : null;

  const contentLines = 1 /* label */ + 1 /* name */ + 1 /* addr1 */ +
    (billing.addressLine2 ? 1 : 0) + 1 /* city */ + (stateLine ? 1 : 0) +
    (contactLine ? 1 : 0);
  const height = 10 + contentLines * lineH + 6;
  drawBox(page, x, y - height, w, height);

  let cy = y - 14;
  drawText(page, 'Bill To / Ship To:', x + padX, cy, {
    font: medium, size: 9, color: COLOR.mute,
  });
  cy -= lineH + 2;

  drawText(page, billing.name, x + padX, cy, {
    font: medium, size: 10, color: COLOR.ink,
  });
  cy -= lineH;

  const bodyOpts: TextOpts = { font: regular, size: 9, color: COLOR.body };
  drawText(page, billing.addressLine1, x + padX, cy, bodyOpts);
  cy -= lineH;
  if (billing.addressLine2) {
    drawText(page, billing.addressLine2, x + padX, cy, bodyOpts);
    cy -= lineH;
  }
  drawText(page, cityLine, x + padX, cy, bodyOpts);
  cy -= lineH;
  if (stateLine) {
    drawText(page, stateLine, x + padX, cy, {
      font: medium, size: 9, color: COLOR.body,
    });
    cy -= lineH;
  }
  if (contactLine) {
    drawText(page, contactLine, x + padX, cy, {
      font: regular, size: 9, color: COLOR.mute,
    });
  }

  return height;
}

// ============================================================
// Item table
// ============================================================
interface TableColumns {
  slX:         number;
  slW:         number;
  descX:       number;
  descW:       number;
  hsnX:        number;   // centre-aligned
  hsnW:        number;
  qtyX:        number;
  qtyW:        number;
  grossRateX:  number;   // right-aligned
  discX:       number;
  taxableX:    number;
  cgstX:       number;
  sgstX:       number;
  igstX:       number;
  totalX:      number;
  right:       number;
}

function buildTableColumns(left: number, right: number, mode: 'intra' | 'inter'): TableColumns {
  const width = right - left;
  // 10 columns for intra (Sl, Desc, HSN, Qty, Gross, Disc, Taxable, CGST, SGST, Total)
  // 9 columns for inter (Sl, Desc, HSN, Qty, Gross, Disc, Taxable, IGST, Total)
  const slW   = 22;
  const hsnW  = 34;
  const qtyW  = 26;
  const numW  = mode === 'intra' ? 52 : 58;   // gross/disc/taxable/tax/total widths
  const fixedWidth = slW + hsnW + qtyW + numW * (mode === 'intra' ? 6 : 5);
  const descW = width - fixedWidth;

  const slX = left;
  const descX = slX + slW;
  const hsnX = descX + descW;
  const qtyX = hsnX + hsnW;
  const grossRateX = qtyX + qtyW + numW;
  const discX = grossRateX + numW;
  const taxableX = discX + numW;

  if (mode === 'intra') {
    const cgstX = taxableX + numW;
    const sgstX = cgstX + numW;
    const totalX = sgstX + numW;
    return {
      slX, slW, descX, descW, hsnX, hsnW, qtyX, qtyW,
      grossRateX, discX, taxableX, cgstX, sgstX, igstX: -1, totalX,
      right,
    };
  }
  const igstX = taxableX + numW;
  const totalX = igstX + numW;
  return {
    slX, slW, descX, descW, hsnX, hsnW, qtyX, qtyW,
    grossRateX, discX, taxableX, cgstX: -1, sgstX: -1, igstX, totalX,
    right,
  };
}

function drawTableHeader(
  page: PDFPage, cols: TableColumns, y: number, h: number,
  mode: 'intra' | 'inter',
  fonts: { medium: PDFFont },
): void {
  const { medium } = fonts;
  const left = cols.slX;
  const width = cols.right - left;

  // Filled header row
  page.drawRectangle({
    x: left, y: y - h, width, height: h,
    color: COLOR.accentBg,
  });

  const centerY = y - h / 2 - 3;
  const cell: TextOpts = { font: medium, size: 8.5, color: rgb(1, 1, 1) };

  drawTextCenter(page, 'Sl', cols.slX + cols.slW / 2, centerY, cell);
  drawText(page, 'Description', cols.descX + 6, centerY, cell);
  drawTextCenter(page, 'HSN', cols.hsnX + cols.hsnW / 2, centerY, cell);
  drawTextCenter(page, 'Qty', cols.qtyX + cols.qtyW / 2, centerY, cell);
  drawTextRight(page, 'Gross Rate', cols.grossRateX - 4, centerY, cell);
  drawTextRight(page, 'Discount', cols.discX - 4, centerY, cell);
  drawTextRight(page, 'Taxable', cols.taxableX - 4, centerY, cell);
  if (mode === 'intra') {
    drawTextRight(page, 'CGST 2.5%', cols.cgstX - 4, centerY, cell);
    drawTextRight(page, 'SGST 2.5%', cols.sgstX - 4, centerY, cell);
  } else {
    drawTextRight(page, 'IGST 5%', cols.igstX - 4, centerY, cell);
  }
  drawTextRight(page, 'Total (₹)', cols.totalX - 4, centerY, cell);

  // Bottom border
  page.drawLine({
    start: { x: left, y: y - h }, end: { x: cols.right, y: y - h },
    thickness: 0.6, color: COLOR.boxBorder,
  });
}

function drawTableRow(
  page: PDFPage,
  row: LineBreakdown,
  cols: TableColumns,
  y: number,
  mode: 'intra' | 'inter',
  fonts: { descOpts: TextOpts; numOpts: TextOpts },
): number {
  const { descOpts, numOpts } = fonts;

  // Description can wrap over multiple lines; compute row height accordingly.
  const descLines = wrap(row.description, cols.descW - 10, descOpts);
  const rowH = Math.max(descLines.length * 12 + 8, 22);
  const rowBottom = y - rowH;
  const centerY = y - rowH / 2 - 3;

  // Faint horizontal separator under each row
  page.drawLine({
    start: { x: cols.slX, y: rowBottom },
    end:   { x: cols.right, y: rowBottom },
    thickness: 0.4,
    color: COLOR.boxBorder,
  });

  // Sl · Description · HSN · Qty (centered / left)
  drawTextCenter(page, String(row.serialNumber), cols.slX + cols.slW / 2, centerY, numOpts);
  {
    let ty = y - 14;
    for (const line of descLines) {
      drawText(page, line, cols.descX + 6, ty, descOpts);
      ty -= 12;
    }
  }
  drawTextCenter(page, row.hsn, cols.hsnX + cols.hsnW / 2, centerY, numOpts);
  drawTextCenter(page, String(row.qty), cols.qtyX + cols.qtyW / 2, centerY, numOpts);

  // Numeric columns — right-aligned
  drawTextRight(page, num2(row.grossRate), cols.grossRateX - 4, centerY, numOpts);
  drawTextRight(page, num2(row.discount),  cols.discX - 4,      centerY, numOpts);
  drawTextRight(page, num2(row.taxable),   cols.taxableX - 4,   centerY, numOpts);
  if (mode === 'intra') {
    drawTextRight(page, num2(row.cgst), cols.cgstX - 4, centerY, numOpts);
    drawTextRight(page, num2(row.sgst), cols.sgstX - 4, centerY, numOpts);
  } else {
    drawTextRight(page, num2(row.igst), cols.igstX - 4, centerY, numOpts);
  }
  drawTextRight(page, num2(row.total), cols.totalX - 4, centerY, {
    ...numOpts, font: (numOpts.font),
  });

  return rowBottom;
}

// ============================================================
// Totals block (right-aligned)
// ============================================================
function drawTotalsBlock(
  page: PDFPage, split: GstSplit, grandTotal: number,
  yStart: number, rightEdge: number,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const labelOpts: TextOpts = { font: medium, size: 9.5, color: COLOR.body };
  const valueOpts: TextOpts = { font: medium, size: 9.5, color: COLOR.ink };

  const rows: [string, string][] = [
    ['Total Taxable Value:', money(split.taxableValue)],
  ];
  if (split.mode === 'intra') {
    rows.push([`Total CGST (${(split.rateHalf * 100).toFixed(2)}%):`, money(split.cgst)]);
    rows.push([`Total SGST (${(split.rateHalf * 100).toFixed(2)}%):`, money(split.sgst)]);
  } else {
    rows.push([`Total IGST (${(split.rate * 100).toFixed(2)}%):`, money(split.igst)]);
  }

  let y = yStart;
  for (const [label, value] of rows) {
    drawTextRight(page, label, rightEdge - 90, y, labelOpts);
    drawTextRight(page, value, rightEdge, y, valueOpts);
    y -= 14;
  }

  // Underline the grand total
  y -= 2;
  page.drawLine({
    start: { x: rightEdge - 220, y: y + 12 },
    end:   { x: rightEdge, y: y + 12 },
    thickness: 0.6, color: COLOR.boxBorder,
  });
  drawTextRight(page, 'Grand Total (Inclusive of Taxes):', rightEdge - 90, y, {
    font: medium, size: 10, color: COLOR.ink,
  });
  drawTextRight(page, money(grandTotal), rightEdge, y, {
    font: medium, size: 11, color: COLOR.ink,
  });
  y -= 8;
  return y;
}

// ============================================================
// Amount-in-words box
// ============================================================
function drawAmountInWords(
  page: PDFPage, x: number, y: number, w: number, total: number,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const height = 28;
  drawBox(page, x, y - height, w, height, { fill: COLOR.softFill });

  const labelOpts: TextOpts = { font: medium, size: 9, color: COLOR.ink };
  const valueOpts: TextOpts = { font: regular, size: 9, color: COLOR.body };
  const label = 'Amount Chargeable (in words):';
  const cy = y - height / 2 - 3;
  drawText(page, label, x + 10, cy, labelOpts);
  const labelW = widthOf(label, labelOpts);
  drawText(page, amountToWords(total), x + 10 + labelW + 6, cy, valueOpts);

  return height;
}

// ============================================================
// Seller bank details — printed on every invoice so a customer
// can wire funds directly. Values are the CA-supplied SUMOSTA
// operating account.
// ============================================================
function drawBankDetails(
  page: PDFPage, x: number, y: number, w: number,
  fonts: { medium: PDFFont; regular: PDFFont },
): number {
  const { medium, regular } = fonts;
  const padX = 10;
  const lineH = 12;
  const rows: [string, string][] = [
    ['A/C No.', '50612202558'],
    ['IFSC',    'IDFB0040178'],
    ['Bank',    'IDFC First Bank'],
    ['Branch',  'Mumbai — Andheri Teli Gali'],
  ];
  const height = 10 + lineH + rows.length * lineH + 6;
  drawBox(page, x, y - height, w, height);

  let cy = y - 14;
  drawText(page, 'Seller Bank Details:', x + padX, cy, {
    font: medium, size: 9, color: COLOR.mute,
  });
  cy -= lineH + 2;

  const labelOpts: TextOpts = { font: medium, size: 9, color: COLOR.body };
  const valueOpts: TextOpts = { font: regular, size: 9, color: COLOR.ink };
  // Align values in a second column so the block reads as a mini
  // key-value table (matches the seller-details box up top).
  const valueColX = x + padX + 90;
  for (const [label, value] of rows) {
    drawText(page, label, x + padX, cy, labelOpts);
    drawText(page, value, valueColX, cy, valueOpts);
    cy -= lineH;
  }

  return height;
}

// ============================================================
// Terms & Conditions (left) + Signatory (right)
// ============================================================
function drawTermsAndSignatory(
  page: PDFPage, x: number, y: number, w: number,
  seller: ResolvedSeller,
  fonts: { medium: PDFFont; regular: PDFFont },
): void {
  const { medium, regular } = fonts;
  const lineH = 12;

  drawText(page, 'Terms & Conditions:', x, y, {
    font: medium, size: 9, color: COLOR.ink,
  });

  const terms = [
    '1. Goods once sold will not be taken back or exchanged.',
    '2. All disputes are subject to Mumbai jurisdiction.',
    '3. This is a computer-generated invoice and requires no physical signature.',
  ];
  let ty = y - lineH - 4;
  for (const t of terms) {
    drawText(page, t, x, ty, { font: regular, size: 8.5, color: COLOR.body });
    ty -= lineH;
  }

  // Signatory block — right-aligned
  const rightEdge = x + w;
  drawTextRight(page, 'For SUMOSTA', rightEdge, y, {
    font: medium, size: 10, color: COLOR.ink,
  });
  drawTextRight(page, seller.legalName || 'SUMOSTA', rightEdge, y - lineH - 2, {
    font: regular, size: 8, color: COLOR.mute,
  });
  drawTextRight(page, 'Authorized Signatory', rightEdge, y - lineH * 3 - 4, {
    font: regular, size: 9, color: COLOR.body,
  });
}

// ============================================================
// Public helpers
// ============================================================
export function toBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
