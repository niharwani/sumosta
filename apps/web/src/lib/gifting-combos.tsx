import { Zap, Heart, Leaf, Star, Gift, Package, Building2 } from 'lucide-react';
import { STATIC_PRODUCTS } from './content';

const bySlug = (slug: string) => STATIC_PRODUCTS.find((p) => p.slug === slug)!;

const WF    = bySlug('organic-certified-wild-forest-honey');
const DAMM  = bySlug('rare-dammer-bee-honey');
const ARTIS = bySlug('artisanal-heritage-forest-honey');
const DEW   = bySlug('canopy-dew-forest-honey');
const BLOOD = bySlug('bloodseed-forest-honey');
const FIVE  = bySlug('5-elements-collection');

// 250g helpers — variant[0]
function price250(p: typeof WF) {
  const v = p.variants?.[0];
  return v ? p.price + v.priceAdjust : p.price;
}
function mrp250(p: typeof WF) {
  const v = p.variants?.[0] as any;
  return v?.compareAtPriceAdjust != null
    ? (p.compareAtPrice ?? 0) + v.compareAtPriceAdjust
    : p.compareAtPrice ?? price250(p);
}

// 500g helpers — variant[1] (priceAdjust = 0, base price IS the 500g price)
function price500(p: typeof WF) {
  return p.price;
}
function mrp500(p: typeof WF) {
  return p.compareAtPrice ?? p.price;
}

export interface ComboItem {
  product: typeof WF;
  variantIdx: number;
  label: string;
  origin: string;
  flavor: string;
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
  comboPrice: number;
  mrpPrice: number;
  giftNote: string;
  sizeLabel: string;
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
    sizeLabel: '5 × 70g',
    items: [
      { product: FIVE, variantIdx: -1, label: '5 Honeys in 70g Tasting Jars', origin: 'Pan-India Forests', flavor: 'All 5 Varieties' },
    ],
    comboPrice: FIVE.price,
    mrpPrice:   FIVE.compareAtPrice ?? FIVE.price,
    benefits: [
      { icon: <Gift size={13}/>,  text: 'Beautiful gift-ready packaging included' },
      { icon: <Star size={13}/>,  text: 'All 5 single-origin wild forest honeys' },
      { icon: <Leaf size={13}/>,  text: 'NABL tested · NPOP Organic certified' },
    ],
  },

  // ── Quartet ─────────────────────────────────────────────────────────────────
  {
    id: 'quartet-main',
    tier: 'Quartet',
    name: 'The Forest Quartet',
    tagline: 'Four of India\'s finest 250g wild forest honeys — a truly comprehensive collection.',
    giftNote: 'The complete forest honey journey for the discerning recipient.',
    accent: '#6D28D9',
    accentDark: '#5B21B6',
    sizeLabel: '4 × 250g',
    items: [
      { product: DEW,   variantIdx: 0, label: 'Canopy Dew Forest',   origin: 'Saranda, Jharkhand',        flavor: 'Dark · Mineral' },
      { product: WF,    variantIdx: 0, label: 'Organic Wild Forest',  origin: 'Madhya Pradesh',            flavor: 'Woody · Floral' },
      { product: BLOOD, variantIdx: 0, label: 'Bloodseed Forest',     origin: 'Abujhmarh, Chhattisgarh',   flavor: 'Smoky · Iron-rich' },
      { product: ARTIS, variantIdx: 0, label: 'Artisanal Heritage',   origin: 'Kandhamal, Odisha',         flavor: 'Earthy · Caramel' },
    ],
    comboPrice: price250(DEW)+price250(WF)+price250(BLOOD)+price250(ARTIS),
    mrpPrice:   mrp250(DEW)  +mrp250(WF)  +mrp250(BLOOD)  +mrp250(ARTIS),
    benefits: [
      { icon: <Star size={13}/>,     text: '4 distinct forest terroirs in one gift' },
      { icon: <Zap size={13}/>,      text: 'Full spectrum antioxidants, minerals & iron' },
      { icon: <Package size={13}/>,  text: 'Premium gift box — NABL tested, NPOP certified' },
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
    sizeLabel: '3 × 250g',
    items: [
      { product: WF,    variantIdx: 0, label: 'Organic Wild Forest', origin: 'Madhya Pradesh',    flavor: 'Woody · Floral' },
      { product: BLOOD, variantIdx: 0, label: 'Bloodseed Forest',    origin: 'Chhattisgarh',      flavor: 'Smoky · Spiced' },
      { product: ARTIS, variantIdx: 0, label: 'Artisanal Heritage',  origin: 'Kandhamal, Odisha', flavor: 'Earthy · Caramel' },
    ],
    comboPrice: price250(WF)+price250(BLOOD)+price250(ARTIS),
    mrpPrice:   mrp250(WF)  +mrp250(BLOOD)  +mrp250(ARTIS),
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
    sizeLabel: '3 × 250g',
    items: [
      { product: BLOOD, variantIdx: 0, label: 'Bloodseed Forest',   origin: 'Chhattisgarh',        flavor: 'Smoky · Iron-rich' },
      { product: ARTIS, variantIdx: 0, label: 'Artisanal Heritage', origin: 'Kandhamal, Odisha',   flavor: 'Earthy · Caramel' },
      { product: DEW,   variantIdx: 0, label: 'Canopy Dew Forest',  origin: 'Saranda, Jharkhand',  flavor: 'Dark · Mineral' },
    ],
    comboPrice: price250(BLOOD)+price250(ARTIS)+price250(DEW),
    mrpPrice:   mrp250(BLOOD)  +mrp250(ARTIS)  +mrp250(DEW),
    benefits: [
      { icon: <Star size={13}/>,  text: '3 forest terroirs · 3 tribal communities' },
      { icon: <Zap size={13}/>,   text: 'Iron, antioxidants & rare minerals' },
      { icon: <Gift size={13}/>,  text: 'Curated for corporate & festive gifting' },
    ],
  },

  // ── Duos (all 500g) ─────────────────────────────────────────────────────────
  {
    id: 'duo-bloodseed-artisanal',
    tier: 'Duo',
    name: 'Bloodseed & Artisanal Heritage',
    tagline: 'Iron-rich blood tonic meets wild-crafted tribal heritage — both in full 500g jars.',
    giftNote: 'A bold wellness gift for the active recipient.',
    accent: '#B91C1C',
    accentDark: '#991B1B',
    sizeLabel: '2 × 500g',
    items: [
      { product: BLOOD, variantIdx: 1, label: 'Bloodseed Forest',   origin: 'Abujhmarh, Chhattisgarh', flavor: 'Smoky · Spiced' },
      { product: ARTIS, variantIdx: 1, label: 'Artisanal Heritage', origin: 'Kandhamal, Odisha',       flavor: 'Earthy · Caramel' },
    ],
    comboPrice: price500(BLOOD)+price500(ARTIS),
    mrpPrice:   mrp500(BLOOD)  +mrp500(ARTIS),
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
    tagline: 'Certified organic meets wild-crafted biodiversity — full 500g jars.',
    giftNote: 'Ideal for health-conscious professionals.',
    accent: '#065F46',
    accentDark: '#064E3B',
    sizeLabel: '2 × 500g',
    items: [
      { product: WF,    variantIdx: 1, label: 'Organic Wild Forest', origin: 'Madhya Pradesh',   flavor: 'Woody · Floral' },
      { product: ARTIS, variantIdx: 1, label: 'Artisanal Heritage',  origin: 'Kandhamal, Odisha', flavor: 'Earthy · Caramel' },
    ],
    comboPrice: price500(WF)+price500(ARTIS),
    mrpPrice:   mrp500(WF)  +mrp500(ARTIS),
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
    tagline: 'Two powerhouse honeys — iron-rich Bloodseed and certified Organic Wild in 500g.',
    giftNote: 'A wellness gift for the active, health-driven recipient.',
    accent: '#7A4D0B',
    accentDark: '#5C3800',
    sizeLabel: '2 × 500g',
    items: [
      { product: BLOOD, variantIdx: 1, label: 'Bloodseed Forest',    origin: 'Abujhmarh, Chhattisgarh', flavor: 'Smoky · Iron-rich' },
      { product: WF,    variantIdx: 1, label: 'Organic Wild Forest', origin: 'Madhya Pradesh',           flavor: 'Woody · Floral' },
    ],
    comboPrice: price500(BLOOD)+price500(WF),
    mrpPrice:   mrp500(BLOOD)  +mrp500(WF),
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
    sizeLabel: '2 × 500g',
    items: [
      { product: DAMM, variantIdx: 1, label: 'Rare Dammer Bee',    origin: 'Nagaland',           flavor: 'Tangy · Medicinal' },
      { product: DEW,  variantIdx: 1, label: 'Canopy Dew Forest',  origin: 'Saranda, Jharkhand', flavor: 'Dark · Mineral' },
    ],
    comboPrice: price500(DAMM)+price500(DEW),
    mrpPrice:   mrp500(DAMM)  +mrp500(DEW),
    benefits: [
      { icon: <Zap size={13}/>,   text: 'Highest antioxidant & mineral density' },
      { icon: <Heart size={13}/>, text: 'Propolis-rich immunity & gut support' },
      { icon: <Leaf size={13}/>,  text: 'Sustainably harvested from tribal reserves' },
    ],
  },
];

export const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Duo':     { bg: '#FFF0D6', text: '#A66A10', border: '#F5A623' },
  'Trio':    { bg: '#F0FAF0', text: '#2E6B2E', border: '#4A8F4A' },
  'Quartet': { bg: '#F5F3FF', text: '#5B21B6', border: '#A78BFA' },
  '5 Pack':  { bg: '#EEF2FF', text: '#4338CA', border: '#818CF8' },
};
