# SUMOSTA — Build Progress

**Last updated:** July 25, 2026  
**Overall completion: ~65%**  
**Target launch: Tuesday, July 28, 2026**

---

## ✅ Completed (Days 1–5 + Admin Fixes)

### Infrastructure & Backend
- [x] Turborepo monorepo — `apps/web`, `apps/api`, `packages/shared`
- [x] Cloudflare Workers API (Hono) — deployed and responding
- [x] Cloudflare D1 database — full schema migrated, seed data loaded
- [x] Cloudflare R2 — media storage + public serving via `/api/media/:key`
- [x] Cloudflare KV — sessions + cache namespaces configured
- [x] JWT auth — register, login, refresh tokens, 8h admin tokens
- [x] Rate limiting middleware, CORS, analytics middleware

### Product & Category API
- [x] `GET /api/products` — list with category/sort/search/pagination + KV cache
- [x] `GET /api/products/:slug` — detail with images, variants, reviews, related
- [x] `GET /api/categories` — full category list
- [x] `POST /api/reviews` — authenticated review submission

### Cart, Checkout & Payments
- [x] KV-backed cart — add, update, remove, guest→user merge
- [x] Checkout API — address validation, coupon application, order creation
- [x] PhonePe Standard Checkout — initiate, S2S callback, status check, refund
- [x] Order confirmation email via Resend
- [x] `/order-confirmation/[id]` and `/payment-failed` pages

### Customer Storefront
- [x] Design system — Clash Display, Satoshi, Bespoke Serif (self-hosted), full CSS token set
- [x] Lenis smooth scroll, Framer Motion variants, anime.js presets
- [x] Navbar, Footer, AnnouncementBar, CartDrawer, MobileMenu
- [x] Homepage — Hero, Marquee, Product Showcase, Brand Story, Category Grid, Process, Testimonials, Newsletter, Footer
- [x] Shop page (`/shop`) — grid, category filter, sort, load more
- [x] Product detail page — gallery, variants, add to cart, reviews, related products
- [x] Cart page — items, quantity adjusters, coupon, summary
- [x] Checkout page — address form, pincode lookup, PhonePe payment button
- [x] Auth pages — login, register, forgot password
- [x] Account section — orders, order detail, profile, saved addresses
- [x] Order tracking page (`/track`)
- [x] Search page (`/search`)

### Admin Panel
- [x] Admin login + JWT auth (role-checked)
- [x] Auth guard on all protected routes (redirects to `/admin/login` if unauthenticated)
- [x] Dashboard — KPI cards (revenue, orders, AOV, visitors), revenue chart, recent orders, low stock alerts
- [x] Orders — list (filter by status/date/search), detail, status updates, refund flow
- [x] Invoices — list paid orders, printable invoice page per order
- [x] Products — list (search + category filter), create, edit (with media upload), toggle active/featured, delete
- [x] Variants — saved correctly on product create and edit
- [x] Customers — list, detail (order history, LTV, avg order value)
- [x] Coupons — CRUD, usage tracking (`max_usage`, `usage_count`)
- [x] Reviews — list by approval status, approve/reject, delete
- [x] Marketing — newsletter subscribers management + contact messages inbox
- [x] Abandoned Carts — tracker from analytics events
- [x] Media — R2 file browser (list, upload, copy URL, delete) — all field bugs fixed
- [x] Settings — store name, support email/phone, announcement bar, social links, SEO — loads from & saves to API
- [x] Shipping — free shipping threshold, default rate, via settings API
- [x] Analytics — overview KPIs, sales deep-dive, conversion funnel — data flows verified

---

## 🔄 Remaining (~35%) — Plan to Tuesday July 28

---

### Day 1 — July 26 (Saturday)
**Analytics Backend · Content Pages · UI Foundation**

#### Analytics Backend
- [ ] Wire `src/lib/tracker.ts` into every storefront page — `page_view`, `product_view`, `add_to_cart`, `begin_checkout`, `purchase`, `search`, `scroll_depth`
- [ ] UTM parameter capture on landing — store in `sessionStorage`, attach to purchase event
- [ ] Verify Analytics Engine middleware logs every API request correctly
- [ ] Daily aggregation cron worker — compute and write to `daily_metrics` (revenue, orders, AOV, conversion rate, cart/checkout abandonment rates)

#### Content Pages
- [ ] **About page** (`/about`) — full-width hero with parallax landscape image, alternating image-text editorial sections, pull quotes in Bespoke Serif italic, anime.js stat counters (5000+ customers, 12 apiaries, 100% traceable), founder/team cards
- [ ] **Contact page** (`/contact`) — React Hook Form + Zod, submits to `POST /api/contact`, animated success state, contact info sidebar (email, phone, address)
- [ ] **Policy pages** — Privacy, Terms, Shipping, Refund — clean editorial layout with sticky section nav, consistent typography

#### UI Foundation Work
- [ ] Audit every storefront page for raw `<img>` tags — replace with `next/image` (aspect ratio, srcset, lazy load)
- [ ] Add skeleton loaders to shop grid, PDP gallery, account orders list, search results — no blank-screen flash
- [ ] Debounce all search/filter inputs to 300ms — shop page, `/search`, admin products, admin orders
- [ ] Verify `prefers-reduced-motion` guard is present on every anime.js and Framer Motion animation block

---

### Day 2 — July 27 (Sunday)
**Images · Frontend UI Betterment · SEO · Polish**

#### Images & Visual Assets
- [ ] **Product photography** — upload final product shots to R2 via admin Media panel; update seed data with correct R2 URLs for all 15 products; ensure every product has at minimum 2 images (front, detail/pour shot)
- [ ] **Hero section image** — high-res honey jar with golden-hour lighting, placed at `/public/images/hero/hero-jar.jpg`; add a secondary pour-shot at `/public/images/hero/hero-pour.jpg` for mobile
- [ ] **Category grid images** — one hero image per category (Raw Honey, Honey Sticks, Spreads, Honeycomb, Gift Boxes); warm golden-hour photography style; upload to R2 under `categories/`
- [ ] **About page images** — Western Ghats landscape for hero parallax, beekeeper image, apiary/forest image, lab testing image; upload to R2 under `brand/`
- [ ] **Brand Story section** — honey-pour image for the homepage split section (currently placeholder)
- [ ] **Process section images** — four images for the scroll-driven "Sourced Wild → Harvested → Tested → Sealed" stages
- [ ] **Favicon + PWA icons** — generate from SUMOSTA logo: `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`; place in `/public/`
- [ ] **OG image** — 1200×630 branded image for social sharing at `/public/og-image.jpg`
- [ ] **Texture assets** — subtle grain/noise PNG overlay for hero and feature sections (3–5% opacity), honeycomb SVG pattern tile

#### Frontend UI Betterment
- [ ] **Homepage Hero** — review animation timing; ensure headline character reveal fires after fonts are loaded (no FOUT); verify floating jar animation runs at 60fps on mobile; add grain texture overlay at 4% opacity
- [ ] **Product cards** — verify hover state (image scale 1.05, golden shadow, Quick Add slide-up) works correctly at all breakpoints; fix any layout shift on add-to-cart button appear
- [ ] **Shop page filter bar** — make it sticky with a crisp white/glass backdrop; category pills should horizontally scroll on mobile without showing scrollbar
- [ ] **Cart drawer** — test swipe-to-remove on mobile; ensure count badge in navbar animates (+1 bounce) correctly on every add-to-cart action; fix empty state illustration alignment
- [ ] **Checkout page** — improve mobile layout (summary collapses to top accordion); add real-time inline validation feedback color on field blur (not just on submit); add trust badge row above the PhonePe button
- [ ] **Product detail page** — ensure lightbox zoom works on mobile (pinch-to-zoom); thumbnail strip scrolls smoothly; verify variant selection resets quantity to 1
- [ ] **Typography pass** — scan every page for any instances of `font-sans` (Tailwind default) that should be `font-satoshi`; ensure no page uses `text-white` on the storefront (should be `text-cream` or `text-charcoal`)
- [ ] **Color pass** — grep for `bg-white` on storefront pages; replace with `bg-cream` (`#FFFDF8`) per design spec; ensure no pure `#FFFFFF` backgrounds appear outside the admin panel
- [ ] **Spacing pass** — verify section `py-20 md:py-32` vertical rhythm is consistent across homepage; fix any sections that feel cramped on tablet (768px)
- [ ] **Announcement bar** — load text dynamically from settings API instead of hardcoded string; only render if `announcementBarActive = true`
- [ ] **Footer** — verify all nav links are correct; add Instagram grid link; social icons should use correct SUMOSTA handles
- [ ] **Mobile nav** — MobileMenu full-screen slide-in should show cart item count; cart icon tap should open CartDrawer, not navigate

#### SEO
- [ ] Dynamic `<meta>` tags on every storefront page — title, description, Open Graph, Twitter card
- [ ] JSON-LD `Product` schema on every PDP (name, price, availability, rating, image)
- [ ] JSON-LD `Organization` schema on homepage (name, logo, social profiles, contact)
- [ ] `sitemap.xml` — auto-generate from D1: all active products + categories + static pages
- [ ] `robots.txt` — allow all, point to sitemap, disallow `/admin/`

#### Final Polish
- [ ] **Custom cursor** (`CursorFollower.tsx`) — 8px golden dot, `mix-blend-mode: difference`, expands to 48px with label text on hoverable elements; spring-follow via Framer Motion; hidden entirely on touch devices
- [ ] **`404.tsx`** — SUMOSTA-branded not-found page: empty honey jar illustration, "This page got lost in the hive" headline, "Go Home" honey CTA button
- [ ] **`error.tsx`** — global error boundary: friendly message, "Try Again" + "Contact Support" buttons
- [ ] **HoneycombLoader** — verify it renders in all loading states: shop grid fetch, PDP fetch, checkout submit, admin tables
- [ ] **GoldenDivider** — place SVG divider between homepage sections (after Process, before Testimonials)
- [ ] PWA `site.webmanifest` — name, icons, theme color (`#F5A623`), background color (`#FFFDF8`), display standalone

---

### Day 3 — July 28 (Tuesday — Launch Day)
**Testing · Lighthouse · Go-Live**

#### E2E Testing
- [ ] Full purchase flow: browse → filter shop → PDP → add to cart → checkout → PhonePe sandbox → order confirmation
- [ ] Guest checkout flow (no login)
- [ ] Auth flows: register → login → forgot password → profile edit → address save → logout
- [ ] Coupon flows: valid code, expired code, min order not met, already used
- [ ] Admin flows: create product (with images + variants) → edit → toggle active → view in storefront → manage order → refund
- [ ] Payment failure flow: PhonePe decline → `/payment-failed` → retry redirects correctly
- [ ] Mobile device testing: iPhone Safari 16, Android Chrome 120, tablet 768px

#### Lighthouse Audit
- [ ] Target 90+ Performance on mobile for homepage, shop, PDP
- [ ] LCP < 2.5s — hero image must be preloaded with `priority` on `next/image`
- [ ] CLS < 0.1 — no layout shift from fonts (swap), images (explicit dimensions), or animations
- [ ] FID/INP < 100ms

#### Production Go-Live
- [ ] Swap PhonePe credentials to production (`PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`)
- [ ] Run ₹1 real payment on production PhonePe to verify end-to-end
- [ ] Point `sumosta.com` DNS → Cloudflare Pages *(do this July 27 evening for propagation buffer)*
- [ ] Point `api.sumosta.com` → Cloudflare Workers custom domain
- [ ] Verify SSL, HSTS, security headers (X-Frame-Options, CSP, X-Content-Type-Options)
- [ ] Configure Cloudflare WAF rules — block SQLi, XSS patterns
- [ ] Set up uptime monitoring
- [ ] Submit `sitemap.xml` to Google Search Console
- [ ] Announce on social (Instagram, WhatsApp) with product photography

---

## Image Asset Checklist

| Asset | Location | Status | Notes |
|-------|----------|--------|-------|
| Hero jar (desktop) | `/public/images/hero/hero-jar.jpg` | ⏳ Needed | Golden-hour, product on cream bg |
| Hero pour shot (mobile) | `/public/images/hero/hero-pour.jpg` | ⏳ Needed | Honey dripping, warm light |
| Category — Raw Honey | R2: `categories/raw-honey.jpg` | ⏳ Needed | Glass jar, natural background |
| Category — Honey Sticks | R2: `categories/honey-sticks.jpg` | ⏳ Needed | Sticks fanned out |
| Category — Spreads | R2: `categories/spreads.jpg` | ⏳ Needed | Open jar with spoon |
| Category — Honeycomb | R2: `categories/honeycomb.jpg` | ⏳ Needed | Raw comb piece, macro |
| Category — Gift Boxes | R2: `categories/gift-boxes.jpg` | ⏳ Needed | Styled gift arrangement |
| Brand story pour | R2: `brand/honey-pour.jpg` | ⏳ Needed | Homepage split section |
| About — hero landscape | R2: `brand/western-ghats.jpg` | ⏳ Needed | Wide landscape, golden hour |
| About — beekeeper | R2: `brand/beekeeper.jpg` | ⏳ Needed | Artisan at hive |
| About — apiary | R2: `brand/apiary.jpg` | ⏳ Needed | Forest/wild hive setting |
| About — testing | R2: `brand/lab-testing.jpg` | ⏳ Needed | Purity test imagery |
| Process 1 — Sourced Wild | R2: `brand/process-1.jpg` | ⏳ Needed | Forest/apiary |
| Process 2 — Harvested | R2: `brand/process-2.jpg` | ⏳ Needed | Beekeeper harvesting |
| Process 3 — Tested | R2: `brand/process-3.jpg` | ⏳ Needed | Lab/quality check |
| Process 4 — Sealed | R2: `brand/process-4.jpg` | ⏳ Needed | Jar being sealed/packaged |
| OG image | `/public/og-image.jpg` | ⏳ Needed | 1200×630, branded |
| Favicon | `/public/favicon.ico` | ⏳ Needed | From logo mark |
| PWA icon 192 | `/public/icon-192.png` | ⏳ Needed | Square logo |
| PWA icon 512 | `/public/icon-512.png` | ⏳ Needed | Square logo |
| Apple touch icon | `/public/apple-touch-icon.png` | ⏳ Needed | 180×180 |
| Per-product images | R2: `products/{slug}-*.jpg` | ⏳ Needed | Min 2 per product (15 products) |

*All product images should be uploaded via the Admin → Media panel, then attached to each product via Admin → Products → Edit.*

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| Product photography not ready by July 27 | Use high-quality stock honey photography as placeholder; swap for real shots post-launch |
| PhonePe production approval delay | Test production credentials July 26; keep sandbox as fallback for soft launch |
| Lighthouse score below 90 on mobile | Prioritize `next/image` + hero preload on July 26; use R2 Image Resizing for WebP |
| DNS propagation delay on July 28 | Point DNS on July 27 evening (24h buffer) |
| Analytics Engine free tier quota | Cap batch size to 5 events; D1 fallback logging already in middleware |
| Font FOUT on hero animation | Add `font-display: swap` + preload `<link>` for Clash Display in `layout.tsx` |
