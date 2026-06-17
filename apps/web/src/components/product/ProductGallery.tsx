'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductImage } from 'shared';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-cream-warm flex items-center justify-center">
        <span className="text-8xl">🍯</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-cream-warm mb-4 cursor-zoom-in">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={images[active].url}
              alt={images[active].altText ?? productName}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                'relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                i === active ? 'border-honey-400' : 'border-transparent hover:border-honey-200',
              )}
            >
              <Image src={img.url} alt={img.altText ?? `Image ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
