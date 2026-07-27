import { STATIC_PRODUCTS, STATIC_COMBOS } from '@/lib/content';
import Content from './_content';

export function generateStaticParams() {
  const productSlugs = STATIC_PRODUCTS.map((p) => ({ slug: p.slug }));
  const comboSlugs = STATIC_COMBOS.map((c) => ({ slug: c.slug }));
  return [...productSlugs, ...comboSlugs];
}

export default function Page({ params }: { params: { slug: string } }) {
  return <Content slug={params.slug} />;
}
