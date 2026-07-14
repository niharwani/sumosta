import { STATIC_PRODUCTS, STATIC_COMBOS } from '@/lib/content';

export function generateStaticParams() { 
  const productSlugs = STATIC_PRODUCTS.map((p) => ({ slug: p.slug })); 
  const comboSlugs = STATIC_COMBOS.map((c) => ({ slug: c.slug }));
  return [...productSlugs, ...comboSlugs];
}

import Content from './_content';
export default function Page() { return <Content />; }
