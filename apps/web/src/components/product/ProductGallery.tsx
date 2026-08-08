'use client';
import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import type { ProductImage } from 'shared';
import { HONEY_EASE_OUT } from '@/lib/animations';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reduce = useReducedMotion();

  const displayImages = images.length > 0 ? images : [];
  const currentImage = displayImages[selectedIndex];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-xl bg-cream-warm border border-sand overflow-hidden group">
        {currentImage ? (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.button
                key={currentImage.id ?? selectedIndex}
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Zoom ${currentImage.altText || productName}`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: HONEY_EASE_OUT }}
                className="absolute inset-0 w-full h-full flex items-center justify-center cursor-zoom-in"
              >
                <Image
                  src={currentImage.url}
                  alt={currentImage.altText || productName}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-6 md:p-10 transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </motion.button>
            </AnimatePresence>
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 bg-charcoal/85 text-cream text-[10px] font-satoshi font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={11} aria-hidden /> Zoom
            </span>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-satoshi text-xs uppercase tracking-[0.08em] text-earth-light">
              {productName}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail strip — horizontal scroll on mobile */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:grid md:grid-cols-5 md:overflow-visible">
          {displayImages.slice(0, 5).map((img, idx) => {
            const active = selectedIndex === idx;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                aria-pressed={active}
                className={`relative shrink-0 md:shrink w-20 h-20 md:w-auto md:h-auto md:aspect-square rounded-lg bg-cream-warm border overflow-hidden transition-all min-w-[44px] min-h-[44px] ${
                  active
                    ? 'border-honey-400 ring-2 ring-honey-400/30'
                    : 'border-sand hover:border-earth-light'
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="100px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && currentImage && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-midnight/85 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} — full image view`}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close image viewer"
              className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center transition-colors"
            >
              <X size={20} aria-hidden />
            </button>
            <motion.div
              layoutId={`product-image-${currentImage.id ?? selectedIndex}`}
              initial={reduce ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? undefined : { scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.35, ease: HONEY_EASE_OUT }}
              className="relative w-full max-w-4xl aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImage.url}
                alt={currentImage.altText || productName}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
