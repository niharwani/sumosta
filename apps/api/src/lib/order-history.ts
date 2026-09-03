// Shared helper for writing to order_status_history.
// Used from the admin panel (admin/orders.ts), the Razorpay finalize path
// (routes/razorpay.ts finalizePaidOrder), and the Shiprocket webhook
// (routes/shipping.ts).
//
// Kept out-of-band from the caller's own DB updates so a history-insert
// failure never rolls back the actual status change — D1 has no true
// multi-statement transactions.

import type { Bindings } from '../index';
import { generateId } from './utils';

export async function recordOrderStatusHistory(
  env: Bindings,
  orderId: string,
  fromStatus: string | null,
  toStatus: string,
  changedBy: string | null,
  note: string | null,
): Promise<void> {
  try {
    await env.DB.prepare(`
      INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by, note)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      generateId('osh'),
      orderId,
      fromStatus,
      toStatus,
      changedBy,
      note,
    ).run();
  } catch (err) {
    console.error('[order-history] insert failed for', orderId, err);
  }
}
