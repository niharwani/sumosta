'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Minus, Plus, ChevronDown } from 'lucide-react';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { TRUST_BADGES } from '@/lib/constants';
import HoneycombLoader from '@/components/shared/HoneycombLoader';
import type { Product, ProductVariant } from 'shared';

const ACCORDION_ITEMS = [
  { key: 'description',  label: 'Description' },
  { key: 'ingredients',  label: 'Ingredients & Nutrition' },
  { key: 'shipping',     label: 'Shipping & Returns' },
  { key: 'howto',        label: 'How to Use' },
];

export default function ProductInfo({ product }: { product: Product }) {
  const [qty, setQty]                = useState(1);
  const [selectedVariant, setVariant] = useState<ProductVariant | null>(null);
  const [openAccordion, setOpen]     = useState<string | null>(null);
  const [addedState, setAdded]       = useState<'idle' | 'adding' | 'added'>('idle');
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const effectivePrice = product.price + (selectedVariant?.priceAdjust ?? 0);
  const discount       = product.compareAtPrice ? calculateDiscount(effectivePrice, product.compareAtPrice) : 0;

  const handleAdd = async () => {
    setAdded('adding');
    addItem(product.id, selectedVariant?.id ?? null, qty, product, selectedVariant ?? undefined);
    await new Promise((r) => setTimeout(r, 400));
    setAdded('added');
    openCart();
    setTimeout(() => setAdded('idle'), 2000);
  };

  return (
    <div>
      {/* Category */}
      <p className="font-satoshi text-earth-light text-xs uppercase tracking-wider mb-2">
        {product.category?.name}
      </p>

      {/* Name */}
      <h1 className="font-clash text-charcoal font-bold text-3xl md:text-4xl mb-3">
        {product.name}
      </h1>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(product.averageRating) ? 'text-honey-400 fill-honey-400' : 'text-sand fill-sand'} />
            ))}
          </div>
          <a href="#reviews" className="font-satoshi text-earth text-sm hover:text-honey-500">
            {product.reviewCount} review{product.reviewCount > 1 ? 's' : ''}
          </a>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-clash text-honey-500 text-3xl font-semibold">{formatPrice(effectivePrice)}</span>
        {product.compareAtPrice && (
          <span className="font-satoshi text-earth-light text-lg line-through">{formatPrice(product.compareAtPrice)}</span>
        )}
        {discount > 0 && (
          <span className="bg-terracotta text-white text-xs font-satoshi font-bold px-2 py-0.5 rounded">
            -{discount}%
          </span>
        )}
      </div>

      {/* Short description */}
      <p className="font-satoshi text-bark text-sm leading-relaxed mb-6">{product.shortDescription}</p>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-5">
          <p className="font-satoshi text-charcoal text-xs font-semibold uppercase tracking-wider mb-2">Size / Variant</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setVariant(null)}
              className={`px-4 py-2 rounded-md border text-sm font-satoshi transition-colors ${!selectedVariant ? 'border-honey-400 bg-honey-50 text-honey-600' : 'border-sand text-bark hover:border-honey-300'}`}
            >
              Default
            </button>
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v)}
                className={`px-4 py-2 rounded-md border text-sm font-satoshi transition-colors ${selectedVariant?.id === v.id ? 'border-honey-400 bg-honey-50 text-honey-600' : 'border-sand text-bark hover:border-honey-300'}`}
              >
                {v.name}
                {v.priceAdjust !== 0 && (
                  <span className="ml-1 text-xs text-earth-light">
                    ({v.priceAdjust > 0 ? '+' : ''}{formatPrice(v.priceAdjust)})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + Add */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center border border-sand rounded-md overflow-hidden">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 text-bark hover:text-charcoal transition-colors">
            <Minus size={14} />
          </button>
          <span className="px-4 py-3 font-satoshi text-charcoal text-sm font-medium min-w-[40px] text-center">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="px-3 py-3 text-bark hover:text-charcoal transition-colors">
            <Plus size={14} />
          </button>
        </div>

        <motion.button
          onClick={handleAdd}
          disabled={product.stock === 0 || addedState !== 'idle'}
          className={`flex-1 py-3.5 rounded-md font-satoshi font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
            addedState === 'added'
              ? 'bg-sage text-white'
              : 'bg-honey-400 text-midnight hover:bg-honey-500 disabled:opacity-60'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          {addedState === 'adding' && <HoneycombLoader size="sm" />}
          {addedState === 'added' ? 'Added to Cart ✓' : product.stock === 0 ? 'Out of Stock' : `Add to Cart — ${formatPrice(effectivePrice * qty)}`}
        </motion.button>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-4 py-4 border-y border-sand mb-6">
        {TRUST_BADGES.map((badge) => (
          <div key={badge.label} className="flex items-center gap-1.5">
            <span className="text-base">{badge.icon}</span>
            <span className="font-satoshi text-earth text-xs">{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Accordion */}
      <div className="flex flex-col divide-y divide-sand">
        {ACCORDION_ITEMS.map((item) => (
          <div key={item.key}>
            <button
              onClick={() => setOpen(openAccordion === item.key ? null : item.key)}
              className="flex items-center justify-between w-full py-4 font-satoshi text-charcoal text-sm font-medium hover:text-honey-500 transition-colors"
            >
              {item.label}
              <ChevronDown
                size={16}
                className={`text-earth-light transition-transform duration-300 ${openAccordion === item.key ? 'rotate-180' : ''}`}
              />
            </button>
            {openAccordion === item.key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pb-4 font-satoshi text-bark text-sm leading-relaxed overflow-hidden"
              >
                {item.key === 'description' && <p>{product.description}</p>}
                {item.key === 'ingredients' && <p>100% pure raw honey. No additives, preservatives, or artificial flavors. Lab tested for purity and quality.</p>}
                {item.key === 'shipping' && <p>Free shipping on orders over ₹500. Standard delivery 3–7 business days. We accept returns of unopened products within 7 days.</p>}
                {item.key === 'howto' && <p>Use as a spread on toast, stir into warm beverages, drizzle over yogurt or desserts, or enjoy by the spoonful. Store at room temperature. Crystallization is natural and does not affect quality.</p>}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
