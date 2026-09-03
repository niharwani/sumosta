import { Zap, Heart, Leaf, Star, Gift, Package, Building2 } from 'lucide-react';
import { STATIC_PRODUCTS } from './content';

const bySlug = (slug: string) => STATIC_PRODUCTS.find((p) => p.slug === slug)!;

const WF    = bySlug('organic-wild-forest-honey');
const DAMM  = bySlug('rare-dammer-bee-honey');
const ARTIS = bySlug('artisanal-heritage-forest-honey');
const DEW   = bySlug('canopy-dew-forest-honey');
const BLOOD = bySlug('bloodseed-forest-honey');
const FIVE  = bySlug('5-elements-collection');

// Per-variant price/mrp resolved against the D1-seeded variant priceAdjust
// (variant[0] = 250g, variant[1] = 500g). variantIdx === -1 → no variant.
export function priceForVariant(p: typeof WF, variantIdx: number): number {
  if (variantIdx < 0) return p.price;
  const v = p.variants?.[variantIdx];
  return v ? p.price + v.priceAdjust : p.price;
}
export function mrpForVariant(p: typeof WF, variantIdx: number): number {
  if (variantIdx < 0) return p.compareAtPrice ?? p.price;
  const v = p.variants?.[variantIdx] as any;
  if (!v) return p.compareAtPrice ?? priceForVariant(p, variantIdx);
  return v.compareAtPriceAdjust != null
    ? (p.compareAtPrice ?? 0) + v.compareAtPriceAdjust
    : p.compareAtPrice ?? priceForVariant(p, variantIdx);
}

export interface ComboItem {
  product: typeof WF;
  label: string;
  origin: string;
  flavor: string;
}

export type ComboSizeKey = '250g' | '500g' | '5x70g';

export interface ComboSize {
  key: ComboSizeKey;
  variantIdx: number;    // idx into product.variants; -1 for single-SKU combos
  label: string;         // e.g. "3 × 250g" — used in headers & summaries
  perItemLabel: string;  // e.g. "250g" — used on the size toggle button
}

export interface Combo {
  id: string;
  tier: 'Duo' | 'Trio' | 'Quartet' | '5 Pack';
  name: string;
  tagline: string;
  items: ComboItem[];
  benefits: { icon: React.ReactNode; text: string }[];
  accent: string;
  accentDark: string;
  giftNote: string;
  sizes: ComboSize[];
  defaultSizeIdx: number;
  // Optional cover-image override. Used when the combo has a single ComboItem
  // that would otherwise render as one placeholder tile (e.g. the 5-Elements
  // set, where showing all five honey jars is more representative than the
  // single product's fallback image). `objectPosition` shifts the focal point
  // for images where the jars sit in the lower half.
  coverImages?: { url: string; alt: string; objectPosition?: string }[];
}

// Sum item prices/MRPs at the chosen size — reflects live D1 pricing per variant.
export function comboPriceAt(c: Combo, sizeIdx: number): number {
  const size = c.sizes[sizeIdx] ?? c.sizes[c.defaultSizeIdx];
  return c.items.reduce((sum, ci) => sum + priceForVariant(ci.product, size.variantIdx), 0);
}
export function comboMrpAt(c: Combo, sizeIdx: number): number {
  const size = c.sizes[sizeIdx] ?? c.sizes[c.defaultSizeIdx];
  return c.items.reduce((sum, ci) => sum + mrpForVariant(ci.product, size.variantIdx), 0);
}
export function defaultComboPrice(c: Combo): number {
  return comboPriceAt(c, c.defaultSizeIdx);
}
export function defaultComboMrp(c: Combo): number {
  return comboMrpAt(c, c.defaultSizeIdx);
}

// All raw-honey combos support 250g + 500g swaps (every jar SKU has both).
function multiSize(itemsCount: number, defaultKey: ComboSizeKey = '250g'): {
  sizes: ComboSize[];
  defaultSizeIdx: number;
} {
  const sizes: ComboSize[] = [
    { key: '250g', variantIdx: 0, label: `${itemsCount} × 250g`, perItemLabel: '250g' },
    { key: '500g', variantIdx: 1, label: `${itemsCount} × 500g`, perItemLabel: '500g' },
  ];
  return { sizes, defaultSizeIdx: sizes.findIndex((s) => s.key === defaultKey) };
}

export const COMBOS: Combo[] = [
  // ── 5 Pack ──────────────────────────────────────────────────────────────────
  {
    id: 'fivepack-elements',
    tier: '5 Pack',
    name: 'The 5 Elements Collection',
    tagline: 'Five 70g tasting jars — all 5 honeys in one extraordinary gift box.',
    giftNote: 'The perfect introduction to India\'s rarest forest honeys.',
    accent: '#B45309',
    accentDark: '#92400E',
    sizes: [{ key: '5x70g', variantIdx: -1, label: '5 × 70g', perItemLabel: '5×70g' }],
    defaultSizeIdx: 0,
    items: [
      { product: FIVE, label: '5 Honeys in 70g Tasting Jars', origin: 'Pan-India Forests', flavor: 'All 5 Varieties' },
    ],
    coverImages: [
      {
        url: 'https://sumosta-api.sumosta-dev.workers.dev/api/media/products/1786381859416-2.png',
        alt: 'The 5 Elements Collection Gift Box',
        objectPosition: 'center 85%',
      },
    ],
    benefits: [
      { icon: <Gift size={13}/>,  text: 'Beautiful gift-ready packaging included' },
      { icon: <Star size={13}/>,  text: 'All 5 single-origin wild forest honeys' },
      { icon: <Leaf size={13}/>,  text: 'NABL tested · NPOP Organic certified' },
    ],
  },

  // ── Duos ────────────────────────────────────────────────────────────────────
  {
    id: 'duo-bloodseed-artisanal',
    tier: 'Duo',
    name: 'Bloodseed & Artisanal Heritage',
    tagline: 'Iron-rich blood tonic meets wild-crafted tribal heritage — pick your size.',
    giftNote: 'A bold wellness gift for the active recipient.',
    accent: '#B91C1C',
    accentDark: '#991B1B',
    ...multiSize(2, '250g'),
    items: [
      { product: BLOOD, label: 'Bloodseed Forest',   origin: 'Abujhmarh, Chhattisgarh', flavor: 'Smoky · Spiced' },
      { product: ARTIS, label: 'Artisanal Heritage', origin: 'Kandhamal, Odisha',       flavor: 'Earthy · Caramel' },
    ],
    benefits: [
      { icon: <Zap size={13}/>,   text: 'High bio-available iron & anthocyanins' },
      { icon: <Heart size={13}/>, text: 'Natural blood tonic & anti-inflammatory' },
      { icon: <Leaf size={13}/>,  text: 'Ethically harvested from tribal reserves' },
    ],
  },
  {
    id: 'duo-wild-artisanal',
    tier: 'Duo',
    name: 'Organic Wild Forest & Artisanal Heritage',
    tagline: 'Certified organic meets wild-crafted biodiversity — choose 250g or 500g jars.',
    giftNote: 'Ideal for health-conscious professionals.',
    accent: '#065F46',
    accentDark: '#064E3B',
    ...multiSize(2, '250g'),
    items: [
      { product: WF,    label: 'Organic Wild Forest', origin: 'Central India',     flavor: 'Woody · Floral' },
      { product: ARTIS, label: 'Artisanal Heritage',  origin: 'Kandhamal, Odisha', flavor: 'Earthy · Caramel' },
    ],
    benefits: [
      { icon: <Leaf size={13}/>,  text: 'NPOP APEDA Organic certified' },
      { icon: <Heart size={13}/>, text: 'Gut-friendly prebiotics & enzymes' },
      { icon: <Star size={13}/>,  text: 'Everyday wellness, gifted beautifully' },
    ],
  },
  {
    id: 'duo-bloodseed-wild',
    tier: 'Duo',
    name: 'Bloodseed Forest & Organic Wild Forest',
    tagline: 'Two powerhouse honeys — iron-rich Bloodseed and certified Organic Wild.',
    giftNote: 'A wellness gift for the active, health-driven recipient.',
    accent: '#7A4D0B',
    accentDark: '#5C3800',
    ...multiSize(2, '250g'),
    items: [
      { product: BLOOD, label: 'Bloodseed Forest',    origin: 'Abujhmarh, Chhattisgarh', flavor: 'Smoky · Iron-rich' },
      { product: WF,    label: 'Organic Wild Forest', origin: 'Central India',           flavor: 'Woody · Floral' },
    ],
    benefits: [
      { icon: <Zap size={13}/>,   text: 'High iron & NPOP Organic certified' },
      { icon: <Heart size={13}/>, text: 'Natural tonic & everyday wellness' },
      { icon: <Leaf size={13}/>,  text: 'Certified organic forest ecosystems' },
    ],
  },
  {
    id: 'duo-dammer-dew',
    tier: 'Duo',
    name: 'Rare Dammer Bee & Canopy Dew Forest',
    tagline: 'India\'s rarest medicinal stingless bee honey paired with mineral-rich Canopy Dew.',
    giftNote: 'A prestigious pair for the most discerning recipient.',
    accent: '#7C3AED',
    accentDark: '#5B21B6',
    ...multiSize(2, '250g'),
    items: [
      { product: DAMM, label: 'Rare Dammer Bee',    origin: 'Nagaland',           flavor: 'Tangy · Medicinal' },
      { product: DEW,  label: 'Canopy Dew Forest',  origin: 'Saranda, Jharkhand', flavor: 'Dark · Mineral' },
    ],
    benefits: [
      { icon: <Zap size={13}/>,   text: 'Highest antioxidant & mineral density' },
      { icon: <Heart size={13}/>, text: 'Propolis-rich immunity & gut support' },
      { icon: <Leaf size={13}/>,  text: 'Sustainably harvested from tribal reserves' },
    ],
  },

  // ── Trios ───────────────────────────────────────────────────────────────────
  {
    id: 'trio-wellness',
    tier: 'Trio',
    name: 'The Wellness Trio',
    tagline: 'Organic Wild, Bloodseed & Artisanal Heritage — a complete daily wellness ritual.',
    giftNote: 'The most thoughtful wellness gift you can give.',
    accent: '#166534',
    accentDark: '#14532D',
    ...multiSize(3, '250g'),
    items: [
      { product: WF,    label: 'Organic Wild Forest', origin: 'Central India',     flavor: 'Woody · Floral' },
      { product: BLOOD, label: 'Bloodseed Forest',    origin: 'Chhattisgarh',      flavor: 'Smoky · Spiced' },
      { product: ARTIS, label: 'Artisanal Heritage',  origin: 'Kandhamal, Odisha', flavor: 'Earthy · Caramel' },
    ],
    benefits: [
      { icon: <Leaf size={13}/>,      text: 'Certified organic with NABL tested purity' },
      { icon: <Heart size={13}/>,     text: 'Gut, immunity & energy — all three covered' },
      { icon: <Building2 size={13}/>, text: 'Bulk pricing available for corporates' },
    ],
  },
  {
    id: 'trio-terroir',
    tier: 'Trio',
    name: 'The Terroir Trio',
    tagline: 'Bloodseed, Artisanal & Canopy Dew — three distinct forest ecosystems.',
    giftNote: 'For those who appreciate provenance and origin.',
    accent: '#1E3A5F',
    accentDark: '#162C47',
    ...multiSize(3, '250g'),
    items: [
      { product: BLOOD, label: 'Bloodseed Forest',   origin: 'Chhattisgarh',        flavor: 'Smoky · Iron-rich' },
      { product: ARTIS, label: 'Artisanal Heritage', origin: 'Kandhamal, Odisha',   flavor: 'Earthy · Caramel' },
      { product: DEW,   label: 'Canopy Dew Forest',  origin: 'Saranda, Jharkhand',  flavor: 'Dark · Mineral' },
    ],
    benefits: [
      { icon: <Star size={13}/>,  text: '3 forest terroirs · 3 tribal communities' },
      { icon: <Zap size={13}/>,   text: 'Iron, antioxidants & rare minerals' },
      { icon: <Gift size={13}/>,  text: 'Curated for corporate & festive gifting' },
    ],
  },

  // ── Quartet ─────────────────────────────────────────────────────────────────
  {
    id: 'quartet-main',
    tier: 'Quartet',
    name: 'The Forest Quartet',
    tagline: 'Four of India\'s finest wild forest honeys — a truly comprehensive collection.',
    giftNote: 'The complete forest honey journey for the discerning recipient.',
    accent: '#6D28D9',
    accentDark: '#5B21B6',
    ...multiSize(4, '250g'),
    items: [
      { product: DEW,   label: 'Canopy Dew Forest',   origin: 'Saranda, Jharkhand',        flavor: 'Dark · Mineral' },
      { product: WF,    label: 'Organic Wild Forest', origin: 'Central India',             flavor: 'Woody · Floral' },
      { product: BLOOD, label: 'Bloodseed Forest',    origin: 'Abujhmarh, Chhattisgarh',   flavor: 'Smoky · Iron-rich' },
      { product: ARTIS, label: 'Artisanal Heritage',  origin: 'Kandhamal, Odisha',         flavor: 'Earthy · Caramel' },
    ],
    benefits: [
      { icon: <Star size={13}/>,     text: '4 distinct forest terroirs in one gift' },
      { icon: <Zap size={13}/>,      text: 'Full spectrum antioxidants, minerals & iron' },
      { icon: <Package size={13}/>,  text: 'Premium gift box — NABL tested, NPOP certified' },
    ],
  },
];

export const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Duo':     { bg: '#FFF0D6', text: '#A66A10', border: '#F5A623' },
  'Trio':    { bg: '#F0FAF0', text: '#2E6B2E', border: '#4A8F4A' },
  'Quartet': { bg: '#F5F3FF', text: '#5B21B6', border: '#A78BFA' },
  '5 Pack':  { bg: '#EEF2FF', text: '#4338CA', border: '#818CF8' },
};
