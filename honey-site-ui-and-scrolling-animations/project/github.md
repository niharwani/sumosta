repo: niharwani/sumosta
branch: master
path: apps/web/src

## Sync history
- 2026-07-27T07:38:00Z — initial Home/Shop/Product build.

## Last sync
date: 2026-07-27T09:57:51Z

### Updated in this project
- Rebuilt Home, Shop, and Product pages as polished Design Components using the brand's real tokens (honey/cream/charcoal palette, spacing, radii) pulled from CLAUDE.md and globals.css.
- Added a real 3D honey jar (three.js) replacing the flat SVG jar in the hero, auto-rotating.
- Added scroll-reveal polish site-wide (with a scroll-position fallback) and a scroll-linked horizontal "Process" section on desktop.
- Built About.dc.html ("Our Story") from the repo's about/page.tsx: hero, 3 alternating story sections, pull quote, animated stats counters, and team grid.
- Reorganized navigation (announcement bar + main nav) across all 4 pages, added a trust strip, and tightened visual rhythm between sections.

## Screen map
| Project screen | Repo source |
|---|---|
| Home.dc.html | apps/web/src/app/(storefront)/page.tsx, components/home/*, components/layout/Navbar.tsx, Footer.tsx, app/globals.css, tailwind.config.ts |
| Shop.dc.html | apps/web/src/app/(storefront)/shop/page.tsx, components/product/ProductGrid.tsx |
| Product.dc.html | apps/web/src/app/(storefront)/product/[slug]/page.tsx, components/product/ProductInfo.tsx, ProductGallery.tsx, ReviewSection.tsx, RelatedProducts.tsx |
| About.dc.html | apps/web/src/app/(storefront)/about/page.tsx |
