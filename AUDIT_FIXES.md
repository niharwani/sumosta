# SUMOSTA — Audit Fix Prompt

You are fixing bugs and gaps found in a full-site audit of the SUMOSTA honey e-commerce platform (Next.js 14 + Cloudflare Workers/Hono + D1). Work through the sections in order. **Do not batch fixes across sections** — finish one section, verify, commit, then move on.

**Ground rules:**
- Follow every rule in `CLAUDE.md` (self-hosted fonts, no pure white on storefront, `prefers-reduced-motion` guards, parameterized D1 queries, `next/image`, pnpm only, no emojis).
- Never introduce backward-compat shims. If a route/file is deleted, remove all references.
- No feature flags. No "coming soon" stubs — either build it or delete the UI.
- Test each change end-to-end where possible before marking done.
- Use markdown link syntax `[file.ts:42](path/file.ts#L42)` for all references in your responses.

---

## SECTION 1 — BLOCKERS (payment safety, dead pages)

### 1.1 Mount the Razorpay webhook

**Problem:** [apps/api/src/services/razorpay.ts:130-168](apps/api/src/services/razorpay.ts#L130-L168) exports `verifyWebhookSignature` but no route calls it. If the browser closes after payment but before client-side `/verify`, the order stays `pending`, stock never deducts, no email/invoice fires. This is the sole payment provider — orphaned charges will happen.

**Do:**
1. Add `POST /api/razorpay/webhook` in [apps/api/src/routes/razorpay.ts](apps/api/src/routes/razorpay.ts).
2. Read the raw body (Hono: `await c.req.text()`), verify with `verifyWebhookSignature` against the `X-Razorpay-Signature` header and env var `RAZORPAY_WEBHOOK_SECRET` (add to `Bindings` in [apps/api/src/index.ts](apps/api/src/index.ts) and `wrangler.toml` docs).
3. On `payment.captured` / `order.paid`: idempotently mark order paid, deduct stock (re-check `stock >= qty`), fire order-confirmation email + invoice. Reuse the exact success-path helpers from the current `/verify` — extract them into a shared function so both call sites share code.
4. Always return 200 (Razorpay retries otherwise).
5. Bypass rate limiter for this path.

**Verify:** Trigger a sandbox payment, kill the browser tab before `/verify` runs, confirm the webhook flips the order.

---

### 1.2 Fix admin dead routes

**Problem:**
- Sidebar link at [apps/web/src/components/admin/AdminSidebar.tsx:35](apps/web/src/components/admin/AdminSidebar.tsx#L35) points to `/admin/media`, but `apps/web/src/app/admin/media/` is an empty directory → 404.
- [apps/web/src/app/admin/(protected)/settings/page.tsx:15-16](apps/web/src/app/admin/(protected)/settings/page.tsx#L15-L16) links `/admin/settings/payments` and `/admin/settings/team` — routes don't exist.
- 7 orphan directories exist outside `(protected)`: `apps/web/src/app/admin/{analytics,coupons,customers,orders,products,reviews,settings}/` — stale duplicates.

**Do:**
1. Either build the Media page under `apps/web/src/app/admin/(protected)/media/page.tsx` (R2 file browser: list `/api/admin/media`, upload, delete, copy URL) OR remove the sidebar link. Media browser is used by ImageUploader — build it.
2. Remove the two dead tab links from settings.
3. Delete the 7 orphan directories entirely.
4. Wire `usePathname` on the settings tabs so active state actually works (currently all tabs get identical active classes).

---

### 1.3 Build the abandonment recovery flow

**Problem:** [apps/web/src/app/admin/(protected)/abandonment/page.tsx](apps/web/src/app/admin/(protected)/abandonment/page.tsx) shows cart rows keyed by `session_id` only — no email, no phone, no `user_id`. Admin literally cannot contact abandoners. No recovery-email button.

**Do:**
1. Update [apps/api/src/routes/admin/abandonment.ts](apps/api/src/routes/admin/abandonment.ts) so the list joins `users` on `session_id → user_id` when known, and pulls the last-known email/phone the session provided at checkout (from `orders` where status = 'pending', or from cart metadata).
2. Add columns: Email, Phone, Cart Value, Items Count, Last Activity, Action.
3. Add a "Send recovery email" button per row. Backend: `POST /api/admin/abandonment/:sessionId/recover` sends a templated email with a `?resume=<sessionId>` link that rehydrates the cart on the storefront.
4. New email template in [apps/api/src/services/email.ts](apps/api/src/services/email.ts): `sendCartRecovery({ email, items, cartTotal, resumeUrl })` — SUMOSTA branding, no emojis, single CTA "Complete your order".

---

### 1.4 Build Shiprocket settings page

**Problem:** [apps/web/src/app/admin/(protected)/shipping/page.tsx](apps/web/src/app/admin/(protected)/shipping/page.tsx) has zero Shiprocket UI. Client is waiting on pickup nickname + real dimensions per memory.

**Do:**
1. Add sections to the shipping page:
   - **Shiprocket connection**: show current `SHIPROCKET_EMAIL`, "Test connection" button (calls a new `GET /api/admin/shipping/status` that pings Shiprocket auth), last successful auth timestamp.
   - **Pickup location**: input for `SHIPROCKET_PICKUP_LOCATION` nickname with a "Fetch available pickups" button that calls Shiprocket's list-pickup endpoint and offers a dropdown of live values.
   - **Default package dimensions**: length/breadth/height (cm) + weight (grams) with per-SKU overrides table. Persist to a new `shipping_defaults` KV entry.
2. In [apps/api/src/services/shipment-automation.ts:93](apps/api/src/services/shipment-automation.ts#L93), fix the volumetric-weight bug: currently `stackedHeight = maxH * stackedUnits` so 10 jars = 100cm parcel. Replace with a real packing heuristic: use per-SKU `boxHeight`, and only stack up to the smaller of (units, floor(defaultBoxHeight / unitHeight)); overflow into an additional box.
3. Save all fields via a new dedicated `PUT /api/admin/shipping/settings` endpoint. **Do not** reuse `/api/admin/settings` — see 1.5.

---

### 1.5 Split settings endpoints so they stop clobbering each other

**Problem:** [apps/web/src/app/admin/(protected)/shipping/page.tsx:23](apps/web/src/app/admin/(protected)/shipping/page.tsx#L23) and [apps/web/src/app/admin/(protected)/settings/page.tsx](apps/web/src/app/admin/(protected)/settings/page.tsx) both PUT to the same `/api/admin/settings` route; overlapping fields (`announcementBar`, `supportEmail`, etc.) clobber each other.

**Do:** Split [apps/api/src/routes/admin/settings.ts](apps/api/src/routes/admin/settings.ts) into three endpoints — `PUT /general`, `PUT /shipping`, `PUT /notifications` — each accepting only its own field set (Zod-validated). Update both admin pages to hit the correct endpoint.

---

## SECTION 2 — HIGH (functional bugs, compliance)

### 2.1 Invoice: GST compliance + overflow fix

**Problem in [apps/api/src/services/invoice.ts](apps/api/src/services/invoice.ts):**
- No SUMOSTA GSTIN, no HSN code per line, no CGST/SGST/IGST split. Labelled "TAX INVOICE" at :209 but not compliant.
- :214 invoice number reuses `orderNumber` — no independent sequence, no FY reset (GST requirement).
- :203 seller identifier hardcoded "raw honey · bengaluru, in" only. No street, pincode, phone.
- :330-354, :429 — long orders (5+ items with multi-line names) overflow into the totals block. No pagination.
- ~1MB Inter TTFs bundled inline — risks Workers script-size limit.
- :402 GST recomputed as `(total/1.05)*0.05`, ignoring `order.tax`.

**Do:**
1. Add to `InvoiceData` type: `hsnCode` per item, `billingAddress` (separate from shipping), `sellerGstin`, `sellerLegalName`, `sellerAddressBlock`, `placeOfSupply`.
2. Add a `invoice_counter` table (or KV key `invoice:counter:FY2025-26`) that atomically increments; format numbers as `SUMO/25-26/00001`.
3. Compute CGST + SGST (half each) when `placeOfSupply` == seller state, else IGST. Show separate line items.
4. Pull SUMOSTA seller block from a new `SELLER_*` env config, not hardcoded strings.
5. Implement pagination: track cumulative `y` after each row draw; when < 200pt remaining, `page = pdfDoc.addPage([595, 842])`, reset `y`, redraw header. Totals always start on a fresh page if they don't fit.
6. Subset the Inter font: use `pdf-lib`'s `subset: true` on `embedFont`, OR switch to a lighter font. Verify bundle stays under 1MB after `wrangler deploy --dry-run`.
7. Use `order.tax` if present, only fall back to the inclusive-calc if absent.

**Also fix downstream:**
- [apps/api/src/routes/orders.ts:107-117](apps/api/src/routes/orders.ts#L107-L117) — phone-only accounts (`phone-XXX@sumosta.local`) can't download invoices. Accept `phone` as an alternate identity match, mirroring the `/track` behaviour.
- [apps/web/src/app/admin/(protected)/invoices/[id]/_content.tsx:22-147](apps/web/src/app/admin/(protected)/invoices/[id]/_content.tsx#L22-L147) — this client-rendered HTML invoice diverges from the server PDF. **Delete the client template** and embed the PDF (`<iframe src="/api/admin/orders/:id/invoice.pdf">`). One source of truth.

---

### 2.2 Admin orders: validation, stock restore, timeline

**Problems in [apps/api/src/routes/admin/orders.ts](apps/api/src/routes/admin/orders.ts):**
- :185-219 `PATCH /:id` writes `body.status` with no Zod validation — arbitrary strings accepted.
- :222-278 refund/cancel never restore stock.
- No status-transition history stored.

**Do:**
1. Add a Zod enum for order status and validate on both `PATCH /:id` and `PATCH /:id/status`. Reject unknown values.
2. On `cancelled` or `refunded` transitions from a stock-deducted state (`paid`, `confirmed`, `shipped`), reverse `order_items → products.stock`. Wrap in a D1 batch.
3. Add `order_status_history` table (`order_id`, `from_status`, `to_status`, `changed_by`, `changed_at`, `note`). Insert on every transition.
4. Render the timeline in [apps/web/src/app/admin/(protected)/orders/[id]/_content.tsx](apps/web/src/app/admin/(protected)/orders/[id]/_content.tsx) as a vertical stepper.
5. Add `window.confirm` (or a shadcn AlertDialog) on `cancelled` / `refunded` clicks.

---

### 2.3 COD stock deduction

**Problem:** [apps/api/src/routes/checkout.ts](apps/api/src/routes/checkout.ts) lines 242 and 378 — COD orders insert `order_items` but never deduct stock. Known unfixed per memory.

**Do:** In the COD path, after inserting `order_items`, run the same stock-deduction batch used by the Razorpay success path. Use a `stock >= qty` guard and fail the order if any item is out of stock (with a clear error to the client).

---

### 2.4 Trust-copy corrections

**Problems:**
- [apps/web/src/app/(storefront)/cart/page.tsx:268](apps/web/src/app/(storefront)/cart/page.tsx#L268) says "Free returns within 7 days" — contradicts no-returns policy in memory.
- [apps/web/src/app/(storefront)/product/[slug]/_content.tsx:454](apps/web/src/app/(storefront)/product/[slug]/_content.tsx#L454) — hardcodes "NPOP APEDA Organic" trust badge on every product. False if unverified.

**Do:**
1. Replace the cart returns line with the correct policy copy — coordinate with the shipping/refund policy pages for exact wording; the correct message is that returns are only accepted for damaged/defective items.
2. Remove the hardcoded organic-certification badge from the default trust-badges list. Only render it when a product explicitly sets `certifications.includes('npop-organic')`.

---

### 2.5 Out-of-stock UX

**Problem:** [apps/web/src/app/(storefront)/product/[slug]/_content.tsx:165](apps/web/src/app/(storefront)/product/[slug]/_content.tsx#L165) — `stock: product?.stock ?? 99`. Add-to-Cart never disables.

**Do:**
1. Drop the `?? 99` fallback. If stock is undefined, treat as out of stock.
2. Disable the Add-to-Cart button + show "Out of stock" state when `stock === 0`.
3. In [apps/web/src/stores/cart-store.ts](apps/web/src/stores/cart-store.ts): pass and respect `maxQuantity` from the product; clamp `updateQuantity` and reject `addItem` when it would exceed stock.

---

### 2.6 Checkout price integrity

**Problem:** [apps/web/src/app/(storefront)/checkout/page.tsx:566-570](apps/web/src/app/(storefront)/checkout/page.tsx#L566-L570) `COD_FEE = 69` computed client-side only. Backend must add same fee or displayed vs charged will diverge.

**Do:**
1. Server side of [apps/api/src/routes/checkout.ts](apps/api/src/routes/checkout.ts): compute all totals (subtotal, shipping, COD fee, discount) from D1 product prices — never trust client. Return the full breakdown.
2. Move the constant into a shared `packages/shared/src/constants.ts` so client + server import the same value.
3. Before creating the order, assert `client.total === server.total`; if mismatch, 400 with `{ code: 'PRICE_MISMATCH', server: {...} }` so the client can re-fetch.

---

### 2.7 Payment-succeeded-but-verify-failed recovery

**Problem:** [apps/web/src/app/(storefront)/checkout/page.tsx:498-511](apps/web/src/app/(storefront)/checkout/page.tsx#L498-L511) — if `/verify` fails after Razorpay charged, user sees a generic error while the money is gone.

**Do:**
1. On `/verify` non-200, redirect to `/order-confirmation/[id]?pending=1` and rely on the webhook (built in 1.1) to finalize. Show a "We're confirming your payment — this usually takes under a minute" state that polls the order every 3s until status becomes `paid` or 2 minutes elapse.
2. If still pending after 2 minutes, show support-contact CTA with prefilled `razorpay_payment_id` in a `mailto:` link.

---

### 2.8 Guest invoice download

**Problem:** [apps/web/src/app/(storefront)/checkout/page.tsx:411](apps/web/src/app/(storefront)/checkout/page.tsx#L411) — guest email is optional at checkout, but the invoice-download route requires email. Guests who checkout without email can never get an invoice.

**Do:** Make email required for all guest checkouts (labelled "For your receipt and invoice"). Update the phone-first gate to always collect email before proceeding when the user isn't logged in.

---

### 2.9 Contact form must email admin

**Problem:** [apps/api/src/routes/contact.ts:16-24](apps/api/src/routes/contact.ts#L16-L24) — inserts to DB and returns. No email fires anywhere. Founders will miss messages.

**Do:**
1. After DB insert, send an email to `SUPPORT_EMAIL` with sender name/email/phone/subject/message.
2. Send an ack email to the customer confirming receipt.
3. Both templates in [apps/api/src/services/email.ts](apps/api/src/services/email.ts) — SUMOSTA branding, no emojis.

---

### 2.10 Newsletter compliance

**Problems in [apps/api/src/routes/newsletter.ts:11-37](apps/api/src/routes/newsletter.ts#L11-L37):**
- No welcome / double-opt-in email.
- No unsubscribe link in any outbound email → CAN-SPAM/GDPR risk.

**Do:**
1. On subscribe, create a `pending` row with a nanoid `confirm_token`; send a confirmation email with a one-click confirm link (`GET /api/newsletter/confirm/:token` → sets `is_active = 1`).
2. Add a global `unsubscribe_token` per subscriber. Include a `List-Unsubscribe` header on every marketing/newsletter Resend send + a visible footer link in the HTML.
3. Add `GET /api/newsletter/unsubscribe/:token` that flips `is_active = 0` and shows a confirmation page.
4. Apply the same List-Unsubscribe header pattern only to marketing sends — leave transactional (order, invoice) emails alone.

---

### 2.11 Admin pagination + product image upload on create

**Problems:**
- Admin orders, products, customers all hard-code `limit=50` or `limit=20`. No page controls.
- [apps/web/src/app/admin/(protected)/products/new/page.tsx](apps/web/src/app/admin/(protected)/products/new/page.tsx) has no image uploader; images can only be added after creating.

**Do:**
1. Add cursor or offset pagination controls to all three admin lists (orders, products, customers). Reuse a single `AdminPagination` component. Debounce search inputs (300ms).
2. Move the ImageUploader into the create-product form. Uploads should either save to R2 immediately with a pending `product_id = null` reference (cleaned by a cron), or defer upload until form submit and upload in the same request.

---

### 2.12 Missing admin actions

**Problems:**
- Coupons: no edit action, `isFirstOrderOnly` hardcoded false ([coupons/page.tsx:40](apps/web/src/app/admin/(protected)/coupons/page.tsx#L40)).
- Marketing: no CSV export, no broadcast UI.
- Contact messages tab: no reply, no archive, no delete.
- [invoices/page.tsx:37-42](apps/web/src/app/admin/(protected)/invoices/page.tsx#L37-L42) — lists every order (including failed/pending) as an "invoice".

**Do:**
1. Add coupon edit modal (extend expiry, bump usage cap, toggle `is_first_order_only`). Backend PATCH already exists or add it.
2. Add "Export CSV" button on marketing subscribers list — client-side CSV generation from the fetched rows is fine.
3. Add "Send broadcast" flow: subject + HTML body (simple textarea) + preview + confirm. Backend `POST /api/admin/marketing/broadcast` iterates active subscribers with Resend batch API, respects unsubscribe list.
4. Contact messages: add reply (opens `mailto:` with prefilled), archive (soft-delete flag), delete (hard delete with confirm).
5. Invoices list: filter WHERE `payment_status = 'paid'` only.

---

### 2.13 Analytics — build real dashboards or delete the page

**Problem:** [apps/web/src/app/admin/(protected)/analytics/page.tsx](apps/web/src/app/admin/(protected)/analytics/page.tsx) — no traffic sources, no geo, no cohorts, no real-time, no CSV export. Blank page when data is missing.

**Do:** Given scope, ship the minimum useful set:
1. Add an empty state ("No analytics data yet — traffic will appear here after your first orders").
2. Add revenue-by-day line chart (Recharts).
3. Add top-products bar chart.
4. Add order-status pie.
5. Add CSV export of raw daily metrics.
6. Delete every reference to traffic/geo/cohorts/real-time from the sidebar until they're actually built — don't leave dead nav.

---

## SECTION 3 — MEDIUM

Batch these together per file; they're small.

- [apps/web/src/app/(storefront)/account/security/page.tsx:229-233](apps/web/src/app/(storefront)/account/security/page.tsx#L229-L233) — either implement session revocation on password change (delete all `refresh:*` KV entries for that user) or remove the misleading success copy.
- [apps/web/src/app/(storefront)/account/security/page.tsx:255-262](apps/web/src/app/(storefront)/account/security/page.tsx#L255-L262) — remove the "Account Activity — coming soon" stub.
- [apps/web/src/app/(storefront)/account/orders/page.tsx](apps/web/src/app/(storefront)/account/orders/page.tsx) — show product thumbnails + names on each order row, not just `item_count`.
- [apps/web/src/app/(storefront)/account/addresses/page.tsx:361](apps/web/src/app/(storefront)/account/addresses/page.tsx#L361) — add Chandigarh, Dadra & Nagar Haveli and Daman & Diu, Andaman & Nicobar Islands, Lakshadweep to the state dropdown.
- [apps/api/src/services/email.ts:130](apps/api/src/services/email.ts#L130) — reconcile tax display: don't show a "Tax (5%)" line as ₹0.00 when GST is inclusive. Match the invoice's "Includes GST 5%" phrasing.
- [apps/api/src/routes/checkout.ts:389](apps/api/src/routes/checkout.ts#L389) — for phone-only checkouts, send an SMS receipt (via a stub `sendOrderSms` in a new `apps/api/src/services/sms.ts` — MSG91/Twilio TBD; leave the transport pluggable). At minimum, don't silently skip notifications.
- [apps/api/src/services/email.ts:308](apps/api/src/services/email.ts#L308) — delivered email CTA should link to `/orders/[id]?token=<orderToken>` for guests, not `/account/orders`.
- [apps/api/src/routes/orders.ts:547-568](apps/api/src/routes/orders.ts#L547-L568) — client-triggered `/tracking` transitions must fire shipped/delivered emails identically to the webhook path. Extract into a shared helper.
- [apps/api/src/routes/shipping.ts:271-291](apps/api/src/routes/shipping.ts#L271-L291) — map `RTO INITIATED`, `CANCELLED`, `LOST`, `DAMAGED` to order states (`rto`, `cancelled`, `lost`, `damaged`) and notify customer + admin.
- [apps/api/src/routes/auth.ts:144-186](apps/api/src/routes/auth.ts#L144-L186) — add rate limiter to `/register` (5/min per IP).
- [apps/api/src/routes/auth.ts:631-750](apps/api/src/routes/auth.ts#L631-L750) — add rate limiter to `/firebase-phone/verify` (5/min per IP).
- [apps/api/src/routes/auth.ts:263-353](apps/api/src/routes/auth.ts#L263-L353) — drop the O(N) `KV_SESSIONS.list({ prefix: 'refresh:' })` fallback. Require refresh calls to include the `userId` and rely purely on the direct `KV.get(refresh:${userId}:${tokenId})` lookup.
- [apps/web/src/app/admin/(protected)/page.tsx:63-64](apps/web/src/app/admin/(protected)/page.tsx#L63-L64) — guard `change()` against undefined/zero previous values; render "—" instead of NaN%.
- [apps/api/src/routes/orders.ts:18-67](apps/api/src/routes/orders.ts#L18-L67) — align receipt/invoice/track endpoints to accept both `email` and `phone` identifiers.

---

## SECTION 4 — LOW (cleanup, one commit)

Group into a single "cleanup" commit:

- Remove diagnostic `console.info` / `console.error` from [apps/web/src/app/(storefront)/account/orders/page.tsx](apps/web/src/app/(storefront)/account/orders/page.tsx) lines 59, 80, 88, 92.
- [apps/web/src/stores/cart-store.ts:97-104](apps/web/src/stores/cart-store.ts#L97-L104) — set `DERIVED_ZERO.shipping = 0`, `total = 0`. Empty cart should read ₹0.
- Remove all emojis (`📦`, `✓`, etc.) from email templates in [apps/api/src/services/email.ts](apps/api/src/services/email.ts) — replace with typographic marks or nothing.
- Add `window.confirm` (or AlertDialog) before delete on coupons and reviews admin pages.
- On password change (auth.ts), delete all `refresh:${userId}:*` KV entries (already noted above in security section).
- CheckoutPhoneGate resend timer: track the timeout ref and clear it on each new send. [apps/web/src/components/checkout/CheckoutPhoneGate.tsx:50-60](apps/web/src/components/checkout/CheckoutPhoneGate.tsx#L50-L60).

---

## VERIFICATION CHECKLIST

Before declaring done:

- [ ] Complete a full test purchase on Razorpay sandbox; kill browser during the redirect; confirm the webhook finalizes the order.
- [ ] Complete a COD order; confirm stock deducts and email + invoice send.
- [ ] Download an invoice with 8+ items; confirm pagination works and no overflow.
- [ ] Fresh Wrangler `deploy --dry-run` stays under 1MB compressed script.
- [ ] Submit the contact form as an anonymous user; confirm both admin notification and customer ack arrive.
- [ ] Subscribe to the newsletter; confirm double-opt-in works and unsubscribe link functions.
- [ ] Visit every admin sidebar link — no 404s, no blank pages.
- [ ] Add-to-Cart is disabled when a product's stock is 0.
- [ ] Storefront cart shows correct returns copy (no "free returns 7 days").
- [ ] Phone-only account can download their own invoice.
- [ ] Admin can send a cart-recovery email to an abandoner and see the resume link work in the storefront.
- [ ] `pnpm build` clean, `pnpm typecheck` clean.

## COMMIT DISCIPLINE

- One commit per section (1.1, 1.2, ..., 2.1, 2.2, ...). Not one giant commit.
- Commit messages: conventional-commits style, matching the repo's existing pattern (`feat:`, `fix:`, `chore:`).
- Never `--no-verify`. Never `--amend` after push.
