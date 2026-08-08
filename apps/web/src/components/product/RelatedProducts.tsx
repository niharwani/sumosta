import Link from 'next/link';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface RelatedProduct {
  id: string; name: string; slug: string; price: number; compareAtPrice: number | null; primary_image?: string;
}

export default function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  return (
    <div className="mb-16">
      <h2 className="font-clash font-bold text-charcoal text-2xl md:text-3xl mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.slice(0, 4).map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} className="group">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream-warm mb-3">
              {product.primary_image ? (
                <Image
                  src={product.primary_image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-earth-light">
                  <Package size={40} strokeWidth={1.25} aria-hidden />
                </div>
              )}
            </div>
            <p className="font-satoshi text-charcoal text-sm font-medium line-clamp-2 mb-1 group-hover:text-honey-600 transition-colors">
              {product.name}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-clash text-honey-500 text-sm font-semibold">{formatPrice(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="font-satoshi text-earth-light text-xs line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
