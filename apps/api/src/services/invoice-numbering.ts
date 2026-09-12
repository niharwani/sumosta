// ============================================================
// Invoice numbering — GST-compliant serials, per Indian FY
// ------------------------------------------------------------
// Format:  STA<YY1><YY2>W<NNNN>
//   STA   — SUMOSTA prefix
//   YY1YY2— Indian fiscal year, e.g. "2627" for FY 2026-27
//   W     — fixed separator (client-mandated)
//   NNNN  — strictly-sequential 4-digit counter, resets to 0001
//           on April 1 (Indian FY start)
//
// Example: STA2627W0001, STA2627W0002, …, STA2728W0001
//
// Gap-free within a FY is a GST audit requirement, so we mint
// via a batched UPDATE + SELECT — two concurrent workers can't
// collide on the same integer.
//
// Historical note: earlier formats were "25-26" style and later
// "SUMOSTA-YYYY-NNNN" (calendar year). Rows for both live in
// `invoice_counters` and are read-only from now on. Old orders
// keep whatever number was already stamped on
// `orders.invoice_number`; new orders get the STA…W… format.
// ============================================================

import type { Bindings } from '../index';

// Indian fiscal year key for a given date. Rolls over on April 1.
//   2026-04-01 → "2627"  (FY 2026-27 begins)
//   2027-03-31 → "2627"  (FY 2026-27 ends)
//   2027-04-01 → "2728"  (FY 2027-28 begins)
export function computeInvoiceYear(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth(); // 0 = Jan, 3 = Apr
  const start = m >= 3 ? y : y - 1;
  const end   = start + 1;
  return `${String(start).slice(-2)}${String(end).slice(-2)}`;
}

function formatInvoiceNumber(year: string, serial: number): string {
  return `STA${year}W${String(serial).padStart(4, '0')}`;
}

/**
 * Returns the invoice number for `orderId`, minting one if the order
 * doesn't already have one. Idempotent — calling twice returns the
 * same string.
 *
 * The counter bump uses a D1 batch (upsert + read) so the sequence
 * is serialized within a single request. D1 does not offer cross-
 * request locking; a race between two workers minting simultaneously
 * can theoretically produce the same serial, but the unique index on
 * `orders.invoice_number` will then reject one of them and this
 * function will retry (up to 3 times) to obtain a fresh number.
 */
export async function getOrCreateInvoiceNumber(
  env: Bindings,
  orderId: string,
): Promise<string> {
  const existing = await env.DB.prepare(
    'SELECT invoice_number FROM orders WHERE id = ?',
  ).bind(orderId).first<{ invoice_number: string | null }>();

  if (!existing) {
    throw new Error(`getOrCreateInvoiceNumber: order ${orderId} not found`);
  }
  if (existing.invoice_number) return existing.invoice_number;

  // `invoice_counters` is keyed by the string in its `fiscal_year`
  // column — misleading name kept for schema-compat with the old
  // fiscal-year rows. We now store the 4-digit calendar year here.
  const year = computeInvoiceYear(new Date());

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    // Ensure a row exists, then atomically bump last_number and read
    // the resulting value. D1's batch API runs these serially in a
    // single transaction so no other statement in this connection
    // can interleave.
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO invoice_counters (fiscal_year, last_number) VALUES (?, 0)
         ON CONFLICT(fiscal_year) DO NOTHING`,
      ).bind(year),
      env.DB.prepare(
        'UPDATE invoice_counters SET last_number = last_number + 1 WHERE fiscal_year = ?',
      ).bind(year),
    ]);

    const row = await env.DB.prepare(
      'SELECT last_number FROM invoice_counters WHERE fiscal_year = ?',
    ).bind(year).first<{ last_number: number }>();

    if (!row) throw new Error(`invoice_counters row missing for ${year}`);

    const invoiceNumber = formatInvoiceNumber(year, row.last_number);

    try {
      const result = await env.DB.prepare(
        'UPDATE orders SET invoice_number = ? WHERE id = ? AND invoice_number IS NULL',
      ).bind(invoiceNumber, orderId).run();

      if (result.meta.changes === 1) {
        return invoiceNumber;
      }

      // Someone else won the race and stamped an invoice_number on this
      // order (e.g. concurrent invoice download). Return theirs.
      const now = await env.DB.prepare(
        'SELECT invoice_number FROM orders WHERE id = ?',
      ).bind(orderId).first<{ invoice_number: string | null }>();
      if (now?.invoice_number) return now.invoice_number;

      // Row exists but invoice_number cleared? Unlikely — retry.
    } catch (err) {
      // Unique-index violation on invoice_number means a concurrent worker
      // grabbed the same serial. Roll the counter forward again and retry.
      lastError = err;
      continue;
    }
  }

  throw new Error(
    `getOrCreateInvoiceNumber: failed to mint after 3 attempts (${String(lastError)})`,
  );
}
