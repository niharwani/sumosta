'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ShoppingBag, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { Product, ProductVariant } from 'shared';

const ACCORDION_ITEMS = [
  { key: 'description',  label: 'Overview & Description' },
  { key: 'benefits',     label: 'Product Benefits' },
  { key: 'howto',        label: 'How to Use' },
];

export default function ProductInfo({ product }: { product: Product }) {
  const [selectedVariant, setVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpen] = useState<string | null>(null);
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem(product.id, selectedVariant?.id ?? null, quantity, product, selectedVariant);
    openCart();
  };

  const currentPrice = product.price + (selectedVariant?.priceAdjust ?? 0);

  return (
    <div className="font-jakarta">
      
      {/* Ratings & Social Proof (Ref Image 2: ⭐ 4.9 Ratings • 2.4K+ Reviews • 2.9K+ Sold) */}
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-3">
        <div className="flex items-center gap-1 text-[#F97316]">
          <Star size={14} fill="#F97316" />
          <span className="font-bold text-charcoal">{product.averageRating || '4.9'}</span>
        </div>
        <span>Ratings</span>
        <span>•</span>
        <span>2.4K+ Reviews</span>
        <span>•</span>
        <span>2.9K+ Sold</span>
      </div>

      {/* Product Title */}
      <h1 className="font-jakarta font-extrabold text-charcoal text-3xl sm:text-4xl leading-tight mb-3">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-jakarta font-bold text-2xl sm:text-3xl text-[#F97316]">
          {formatPrice(currentPrice)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > currentPrice && (
          <span className="font-jakarta text-gray-400 text-sm sm:text-base line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      {/* Select Size Options (Ref Image 2 pill buttons) */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">
          Select Size
        </label>
        <div className="flex flex-wrap gap-3">
          {['0.5gm', '1.2 Kg', '1.5 Kg', '1.8 Kg'].map((size, idx) => (
            <button
              key={size}
              onClick={() => {}}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                idx === 0
                  ? 'bg-white border border-[#F97316] text-[#F97316] shadow-2xs'
                  : 'bg-white/80 border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Select Quantity & Add to Cart Controls (Ref Image 2) */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-gray-500 hover:text-charcoal p-1"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="font-jakarta font-bold text-sm text-charcoal w-4 text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="text-gray-500 hover:text-charcoal p-1"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="btn-pill-orange flex-1 max-w-xs justify-center py-3.5 shadow-md"
        >
          <ShoppingBag size={18} />
          <span>Add to cart</span>
        </button>
      </div>

      {/* Description text matching reference paragraph layout */}
      <div className="font-jakarta text-gray-600 text-xs sm:text-sm leading-relaxed space-y-4 mb-8 text-justify">
        <p>
          Enjoy the miracle of honey in its most natural state with a gorgeous hunk of raw honeycomb sourced from pristine reserves. Spread it on warm bread, plop into salads, or just dig in with a spoon—yes, you can eat the wax!
        </p>
        <p>
          And now our smallest size has new packaging! Our upgraded reusable container with a snap-lid helps reduce leaking and make serving easier than ever. You can still see the beauty of the comb while reducing the mess. No more sticky fingers!
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="border-t border-gray-200 divide-y divide-gray-100">
        {ACCORDION_ITEMS.map((item) => (
          <div key={item.key}>
            <button
              onClick={() => setOpen(openAccordion === item.key ? null : item.key)}
              className="flex items-center justify-between w-full py-4 font-jakarta text-charcoal text-sm font-bold hover:text-[#F97316] transition-colors"
            >
              <span>{item.label}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${openAccordion === item.key ? 'rotate-180' : ''}`}
              />
            </button>
            {openAccordion === item.key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="pb-4 font-jakarta text-gray-500 text-xs leading-relaxed overflow-hidden"
              >
                {item.key === 'description' && <p>{product.description}</p>}
                {item.key === 'benefits' && (
                  <ul className="space-y-1.5">
                    {((product as any).nutritionalBenefits || [
                      '100% raw, unheated, unfiltered single-origin forest extraction.',
                      'Contains active anti-microbial components and natural plant pollen.',
                    ]).map((b: string, i: number) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>
                )}
                {item.key === 'howto' && <p>Enjoy by the spoonful, stir into warm beverages, or drizzle over yogurt.</p>}
              </motion.div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
