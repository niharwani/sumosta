'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ProductGallery  from '@/components/product/ProductGallery';
import ProductInfo     from '@/components/product/ProductInfo';
import RelatedProducts from '@/components/product/RelatedProducts';
import ReviewSection   from '@/components/product/ReviewSection';
import GoldenDivider   from '@/components/shared/GoldenDivider';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await fetch(`${API}/api/products/${slug}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!slug && slug !== '_placeholder',
  });

  const product = data?.data;

  if (isLoading || !product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <HoneycombLoader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-satoshi text-earth text-lg">Product not found.</p>
        <a href="/shop" className="font-satoshi text-honey-500 underline">Browse all products</a>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen pt-8 pb-20">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12">
        <nav className="font-satoshi text-xs text-earth-light mb-8 flex gap-2">
          <a href="/" className="hover:text-honey-500">Home</a>
          <span>/</span>
          <a href="/shop" className="hover:text-honey-500">Shop</a>
          <span>/</span>
          <span className="text-bark">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductGallery images={product.images ?? []} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        <GoldenDivider className="my-16" />

        {product.relatedProducts?.length > 0 && (
          <RelatedProducts products={product.relatedProducts} />
        )}

        <ReviewSection productId={product.id} reviews={product.reviews ?? []} />
      </div>
    </div>
  );
}
