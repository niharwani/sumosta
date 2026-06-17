import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

interface RelatedProduct {
  id: string; name: string; slug: string; price: number; compareAtPrice: number | null; primary_image?: string;
}

export default function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  return (
    <div className="mb-16">
      <h2 className="font-clash text-charcoal font-bold text-2xl mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.slice(0, 4).map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} className="group">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cream-warm mb-3">
              {product.primary_image && (
                <Image
                  src={product.primary_image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              )}
            </div>
            <p className="font-satoshi text-charcoal text-sm font-medium line-clamp-2 mb-1">{product.name}</p>
            <p className="font-satoshi text-honey-500 text-sm font-semibold">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
