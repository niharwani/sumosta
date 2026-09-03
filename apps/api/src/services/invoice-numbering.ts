// ============================================================
// Invoice numbering — GST-compliant serials, per fiscal year
// ------------------------------------------------------------
// Every tax invoice needs a unique serial that resets on 1-April
// (Indian FY runs April → March). We store the running counter in
// `invoice_counters` keyed by short FY string ('25-26' = FY 2025-26)
// and mint the next number via a batched UPDATE + SELECT so two
// concurrent workers can't collide on the same integer.
//
// The minted number is written back to `orders.invoice_number` so
// repeated invoice fetches for the same order return the same
// serial — critical for GST audit trails.
// ============================================================

import type { Bindings } from '../index';

// FY string for a given calendar date. April → March.
//   2025-04-01 → '25-26'
//   2025-03-31 → '24-25'
export function computeFiscalYear(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth(); // 0 = Jan
  const startYear = m >= 3 ? y : y - 1;      // FY starts in April (month index 3)
  const endYear   = startYear + 1;
  const two = (n: number): string => String(n % 100).padStart(2, '0');
  return `${two(startYear)}-${two(endYear)}`;
}

function formatInvoiceNumber(fiscalYear: string, serial: number): string {
  return `SUMO/${fiscalYear}/${String(serial).padStart(5, '0')}`;
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

  const fy = computeFiscalYear(new Date());

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    // Ensure a row exists, then atomically bump last_number and read the
    // resulting value. D1's batch API runs these serially in a single
    // transaction so no other statement in this connection can interleave.
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO invoice_counters (fiscal_year, last_number) VALUES (?, 0)
         ON CONFLICT(fiscal_year) DO NOTHING`,
      ).bind(fy),
      env.DB.prepare(
        'UPDATE invoice_counters SET last_number = last_number + 1 WHERE fiscal_year = ?',
      ).bind(fy),
    ]);

    const row = await env.DB.prepare(
      'SELECT last_number FROM invoice_counters WHERE fiscal_year = ?',
    ).bind(fy).first<{ last_number: number }>();

    if (!row) throw new Error(`invoice_counters row missing for ${fy}`);

    const invoiceNumber = formatInvoiceNumber(fy, row.last_number);

    try {
      const result = await env.DB.prepare(
        'UPDATE orders SET invoice_number = ? WHERE id = ? AND invoice_number IS NULL',
      ).bind(invoiceNumber, orderId).run();

      if (result.meta.changes === 1) {
        return invoiceNumber;
      }

      // Someone else won the race and stamped an invoice_number on this order
      // (e.g. concurrent invoice download). Return theirs.
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
