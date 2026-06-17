import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductGallery    from '@/components/product/ProductGallery';
import ProductInfo       from '@/components/product/ProductInfo';
import RelatedProducts   from '@/components/product/RelatedProducts';
import ReviewSection     from '@/components/product/ReviewSection';
import GoldenDivider     from '@/components/shared/GoldenDivider';
import type { Product }  from 'shared';

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
    const res = await fetch(`${apiUrl}/api/products/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription,
    openGraph: {
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sumosta.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description,
    image: product.images?.map((img: any) => img.url) ?? [],
    sku: (product as any).sku,
    brand: { '@type': 'Brand', name: 'SUMOSTA' },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: (product as any).stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'SUMOSTA' },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="bg-cream min-h-screen pt-8 pb-20">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        {/* Breadcrumbs */}
        <nav className="font-satoshi text-xs text-earth-light mb-8 flex gap-2">
          <a href="/" className="hover:text-honey-500">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-honey-500">Shop</a>
          <span>/</span>
          <span className="text-bark">{product.name}</span>
        </nav>

        {/* Main 2-col layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={product.images ?? []} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        <GoldenDivider className="my-16" />

        {/* Related + Reviews */}
        {(product as any).relatedProducts?.length > 0 && (
          <RelatedProducts products={(product as any).relatedProducts} />
        )}

        <ReviewSection productId={product.id} reviews={(product as any).reviews ?? []} />
      </div>
    </div>
    </>
  );
}
