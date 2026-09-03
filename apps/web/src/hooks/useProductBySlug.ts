'use client';
import { useEffect, useState } from 'react';
import type { ProductImage } from 'shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface D1Image {
  id: string;
  url: string;
  alt_text?: string | null;
  sort_order?: number;
  is_primary?: number | boolean;
}

export interface FetchedProduct {
  id: string;
  slug: string;
  images: ProductImage[];
}

export interface ProductBySlugState {
  loaded: boolean;
  product: FetchedProduct | null;
}

const cache = new Map<string, ProductBySlugState>();
const inflight = new Map<string, Promise<ProductBySlugState>>();

function normalizeImages(rows: D1Image[] | undefined): ProductImage[] {
  if (!rows || rows.length === 0) return [];
  return [...rows]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((r) => ({
      id: r.id,
      url: r.url,
      altText: r.alt_text ?? '',
      sortOrder: r.sort_order ?? 0,
      isPrimary: Boolean(r.is_primary),
    }));
}

export async function loadProduct(slug: string): Promise<ProductBySlugState> {
  const hit = cache.get(slug);
  if (hit) return hit;
  const pending = inflight.get(slug);
  if (pending) return pending;

  const promise = (async () => {
    let state: ProductBySlugState = { loaded: true, product: null };
    try {
      const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const p = json?.data;
        if (p && p.id && p.slug) {
          state = {
            loaded: true,
            product: {
              id: p.id,
              slug: p.slug,
              images: normalizeImages(p.images as D1Image[]),
            },
          };
        }
      }
    } catch {
      // ignore — fall back to static
    }
    cache.set(slug, state);
    inflight.delete(slug);
    return state;
  })();

  inflight.set(slug, promise);
  return promise;
}

export function useProductBySlug(slug: string | null | undefined): ProductBySlugState {
  const [state, setState] = useState<ProductBySlugState>(() =>
    slug ? cache.get(slug) ?? { loaded: false, product: null } : { loaded: true, product: null },
  );

  useEffect(() => {
    if (!slug) {
      setState({ loaded: true, product: null });
      return;
    }
    const hit = cache.get(slug);
    if (hit) {
      setState(hit);
      return;
    }
    let cancelled = false;
    loadProduct(slug).then((s) => {
      if (!cancelled) setState(s);
    });
    return () => { cancelled = true; };
  }, [slug]);

  return state;
}
