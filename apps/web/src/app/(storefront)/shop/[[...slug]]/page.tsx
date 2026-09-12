import type { Metadata } from 'next';
import ShopPageContent from './_content';

export function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['raw-honey'] },
    { slug: ['superfoods'] },
    { slug: ['spreads'] },
    { slug: ['honey-nuts'] },
    { slug: ['gift-boxes'] },
  ];
}

const CATEGORY_META: Record<string, { title: string; description: string; path: string }> = {
  'raw-honey':  { title: 'Raw Honey — Single-Origin Wild Honey', description: 'Explore our raw, unprocessed single-origin honeys from Western Ghats, Sundarbans, and Himalayan foothills.', path: '/shop/raw-honey' },
  'gift-boxes': { title: 'Honey Gift Boxes & Bundles',           description: 'Curated SUMOSTA honey gift boxes and multi-jar bundles — Duo, Trio, Quartet & 5-Pack.',            path: '/shop/gift-boxes' },
  'superfoods': { title: 'Honey Superfoods',                     description: 'Nutrient-dense honey superfood combinations.',                                                    path: '/shop/superfoods' },
  'spreads':    { title: 'Honey Spreads',                        description: 'Handcrafted flavoured honey spreads.',                                                            path: '/shop/spreads' },
  'honey-nuts': { title: 'Honey with Nuts',                      description: 'Raw honey blended with dry fruits and nuts.',                                                    path: '/shop/honey-nuts' },
};

export function generateMetadata({ params }: { params: { slug?: string[] } }): Metadata {
  const cat = params.slug?.[0];
  const hit = cat ? CATEGORY_META[cat] : null;
  return {
    title:       hit ? hit.title : 'The Collection — Raw Wild Honey',
    description: hit ? hit.description : 'Browse SUMOSTA\'s full collection of raw, single-origin wild honey and curated gift bundles.',
    alternates:  { canonical: hit?.path ?? '/shop' },
  };
}

export default function ShopPage() {
  return <ShopPageContent />;
}
