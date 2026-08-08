'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// null = product exists in D1 but has no primary image (show placeholder)
// undefined = product not returned by the API (fall back to static)
type Map = Record<string, string | null>;

export interface ProductImagesState {
  loaded: boolean;
  map: Map;
}

let cache: ProductImagesState | null = null;
let inflight: Promise<ProductImagesState> | null = null;

async function loadState(): Promise<ProductImagesState> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    const map: Map = {};
    let loaded = true;
    try {
      const res = await fetch(`${API_URL}/api/products?limit=100`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const list: Array<{ id: string; primary_image?: string | null }> = json?.data?.products ?? [];
        for (const p of list) {
          map[p.id] = p.primary_image ?? null;
        }
      } else {
        loaded = false;
      }
    } catch {
      loaded = false;
    }
    const state = { loaded, map };
    cache = state;
    inflight = null;
    return state;
  })();

  return inflight;
}

export function useProductImages(): ProductImagesState {
  const [state, setState] = useState<ProductImagesState>(cache ?? { loaded: false, map: {} });
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
    return state.map[productId] ?? null;
  }
  return staticUrl ?? null;
}
