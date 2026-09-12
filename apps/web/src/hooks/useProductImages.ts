'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// Per-product D1 state cached for the lifetime of the tab.
// image: null   → product exists in D1 but has no primary image (show placeholder)
// image: undef  → product not in D1 (fall back to static image)
// stock: null   → product exists in D1 but stock is unknown / falls back to static
// stock: undef  → product not in D1
interface Entry {
  image: string | null;
  stock: number | null;
}
type Map = Record<string, Entry>;

// Raw fields we surface from /api/products for admin-created products
// that don't exist in the static catalog. Kept minimal — enough to render
// a shop card + link into the D1-only PDP fetch path.
export interface D1ProductSummary {
  id:                string;
  name:              string;
  slug:              string;
  price:             number;
  compare_at_price:  number | null;
  stock:             number | null;
  short_description: string | null;
  primary_image:     string | null;
  primary_image_alt: string | null;
  category_id:       string | null;
  category_name:     string | null;
  category_slug:     string | null;
  is_featured:       number | boolean | null;
  tags:              string | null;
  created_at:        string | null;
}

export interface ProductImagesState {
  loaded:      boolean;
  map:         Map;
  d1Products:  D1ProductSummary[];
}

let cache: ProductImagesState | null = null;
let inflight: Promise<ProductImagesState> | null = null;

async function loadState(): Promise<ProductImagesState> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    const map: Map = {};
    let loaded = true;
    let d1Products: D1ProductSummary[] = [];
    try {
      const res = await fetch(`${API_URL}/api/products?limit=100`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const list: D1ProductSummary[] = json?.data?.products ?? [];
        d1Products = list;
        for (const p of list) {
          map[p.id] = {
            image: p.primary_image ?? null,
            stock: typeof p.stock === 'number' ? p.stock : null,
          };
        }
      } else {
        loaded = false;
      }
    } catch {
      loaded = false;
    }
    const state = { loaded, map, d1Products };
    cache = state;
    inflight = null;
    return state;
  })();

  return inflight;
}

export function useProductImages(): ProductImagesState {
  const [state, setState] = useState<ProductImagesState>(
    cache ?? { loaded: false, map: {}, d1Products: [] },
  );
  useEffect(() => {
    if (cache) return;
    loadState().then(setState);
  }, []);
  return state;
}

/**
 * Resolves the image src for a product card.
 * - While D1 is still loading, uses the static image (avoids blank flash).
 * - Once loaded and the product IS in D1: D1 value wins (null → show placeholder).
 * - Once loaded but the product ISN'T in D1: falls back to static.
 */
export function resolveProductImage(
  state: ProductImagesState,
  productId: string,
  staticUrl?: string | null,
): string | null {
  if (state.loaded && productId in state.map) {
    return state.map[productId].image ?? null;
  }
  return staticUrl ?? null;
}

/**
 * Resolves the effective stock for a product card.
 * D1 stock wins once loaded (so admin OOS changes reflect immediately on the
 * storefront); otherwise falls back to the static-catalog value.
 * Returns `null` when stock is unknown — callers should treat that as in-stock.
 */
export function resolveProductStock(
  state: ProductImagesState,
  productId: string,
  staticStock?: number | null,
): number | null {
  if (state.loaded && productId in state.map) {
    const s = state.map[productId].stock;
    if (typeof s === 'number') return s;
  }
  return typeof staticStock === 'number' ? staticStock : null;
}
