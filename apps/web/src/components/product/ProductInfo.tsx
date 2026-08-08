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
    <div className="font-satoshi">
      {/* Ratings & Social Proof */}
      <div className="flex items-center gap-2 text-xs font-medium text-earth mb-3">
        <div className="flex items-center gap-1 text-honey-400">
          <Star size={14} className="fill-honey-400" aria-hidden />
          <span className="font-bold text-charcoal">{product.averageRating || '4.9'}</span>
        </div>
        <span>Ratings</span>
        <span aria-hidden>·</span>
        <span>2.4K+ Reviews</span>
        <span aria-hidden>·</span>
        <span>2.9K+ Sold</span>
      </div>

      {/* Product Title */}
      <h1 className="font-clash font-extrabold text-charcoal text-3xl sm:text-4xl leading-tight mb-3">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-clash font-bold text-2xl sm:text-3xl text-honey-500">
          {formatPrice(currentPrice)}
        </span>
        {product.compareAtPrice && product.compareAtPrice > currentPrice && (
          <span className="font-satoshi text-earth-light text-sm sm:text-base line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
      </div>

      {/* Select Size Options */}
      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <label className="block text-xs font-bold text-earth uppercase tracking-wider mb-2.5">
            Select Size
          </label>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((v) => {
              const active = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  aria-pressed={active}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all min-h-[44px] ${
                    active
                      ? 'bg-cream border border-honey-400 text-honey-500 shadow-sm'
                      : 'bg-cream/80 border border-sand text-earth hover:border-earth-light'
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex items-center gap-3 bg-cream border border-sand rounded-full px-4 py-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-earth hover:text-charcoal p-1 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
            aria-label="Decrease quantity"
          >
            <Minus size={14} aria-hidden />
          </button>
          <span className="font-satoshi font-bold text-sm text-charcoal w-4 text-center" aria-live="polite">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="text-earth hover:text-charcoal p-1 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
            aria-label="Increase quantity"
          >
            <Plus size={14} aria-hidden />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="inline-flex items-center justify-center gap-2 bg-honey-500 hover:bg-honey-600 text-cream font-satoshi font-semibold px-6 py-3.5 rounded-full flex-1 max-w-xs shadow-md transition-colors min-h-[44px]"
        >
          <ShoppingBag size={18} aria-hidden />
          <span>Add to cart</span>
        </button>
      </div>

      {/* Description text */}
      <div className="font-satoshi text-bark text-xs sm:text-sm leading-relaxed space-y-4 mb-8">
        <p>{product.shortDescription || product.description}</p>
      </div>

      {/* Accordion Sections */}
      <div className="border-t border-sand divide-y divide-sand">
        {ACCORDION_ITEMS.map((item) => {
          const open = openAccordion === item.key;
          const panelId = `product-info-${item.key}`;
          return (
            <div key={item.key}>
              <button
                onClick={() => setOpen(open ? null : item.key)}
                className="flex items-center justify-between w-full py-4 font-satoshi text-charcoal text-sm font-bold hover:text-honey-500 transition-colors min-h-[44px]"
                aria-expanded={open}
                aria-controls={panelId}
              >
                <span>{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`text-earth transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {open && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="pb-4 font-satoshi text-earth text-xs leading-relaxed overflow-hidden"
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
          );
        })}
      </div>
    </div>
  );
}
