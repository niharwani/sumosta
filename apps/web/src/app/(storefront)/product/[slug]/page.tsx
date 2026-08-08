import type { Metadata } from 'next';
import { STATIC_PRODUCTS, STATIC_COMBOS } from '@/lib/content';
import Content from './_content';

export function generateStaticParams() {
  const productSlugs = STATIC_PRODUCTS.map((p) => ({ slug: p.slug }));
  const comboSlugs = STATIC_COMBOS.map((c) => ({ slug: c.slug }));
  return [...productSlugs, ...comboSlugs];
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = STATIC_PRODUCTS.find((p) => p.slug === params.slug);
  const combo   = !product ? STATIC_COMBOS.find((c) => c.slug === params.slug) : null;

  if (!product && !combo) {
    return {
      title: 'Product not found — SUMOSTA',
      description: 'The product you are looking for could not be found.',
    };
  }

  const name = product?.name ?? combo?.name ?? 'Product';
  const description =
    (product as any)?.shortDescription ||
    product?.description?.slice(0, 160) ||
    combo?.description?.slice(0, 160) ||
    "Raw, unprocessed honey sourced from India's wildest apiaries.";
  const image = product?.images?.[0]?.url ?? (combo as any)?.image ?? '/og-image.jpg';
  const title = `${name} — SUMOSTA`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, alt: name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <Content slug={params.slug} />;
}
