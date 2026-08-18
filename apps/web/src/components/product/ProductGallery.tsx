'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import type { ProductImage } from 'shared';
import { HONEY_EASE_OUT } from '@/lib/animations';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  activeIndex?: number;
}

const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

export default function ProductGallery({ images, productName, activeIndex }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(activeIndex ?? 0);

  // Sync external activeIndex (e.g. variant selection) into the gallery
  useEffect(() => {
    if (activeIndex == null) return;
    if (activeIndex < 0 || activeIndex >= images.length) return;
    setSelectedIndex(activeIndex);
  }, [activeIndex, images.length]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const reduce = useReducedMotion();

  const displayImages = images.length > 0 ? images : [];
  const currentImage = displayImages[selectedIndex];

  // Reset zoom whenever lightbox opens or image switches
  useEffect(() => {
    if (!lightboxOpen) return;
    setZoom(1);
    setOrigin({ x: 50, y: 50 });
  }, [lightboxOpen, selectedIndex]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  // Keyboard: Esc closes, arrows navigate, +/- zoom
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft')  setSelectedIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
      else if (e.key === 'ArrowRight') setSelectedIndex((i) => (i + 1) % displayImages.length);
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(MAX_ZOOM, z + 0.5));
      else if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(MIN_ZOOM, z - 0.5));
      else if (e.key === '0') { setZoom(1); setOrigin({ x: 50, y: 50 }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, displayImages.length]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [lightboxOpen]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (zoom > 1) {
      setZoom(1);
      setOrigin({ x: 50, y: 50 });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setOrigin({ x, y });
    setZoom(2);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setOrigin({ x, y });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  };

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
                  className="object-cover"
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

      {/* Thumbnail strip — horizontal scroll on mobile, dynamic grid on desktop */}
      {displayImages.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:grid md:overflow-visible"
          style={{
            gridTemplateColumns: `repeat(${displayImages.length}, minmax(0, 1fr))`,
          }}
        >
          {displayImages.map((img, idx) => {
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
                  className="object-cover"
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
            className="fixed inset-0 z-[100] bg-midnight/90 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} — full image view`}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close image viewer"
              className="absolute top-6 right-6 z-20 w-11 h-11 rounded-full bg-cream/10 hover:bg-cream/20 text-cream flex items-center justify-center transition-colors"
            >
              <X size={20} aria-hidden />
            </button>

            {/* Zoom controls */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.5))}
                aria-label="Zoom out"
                disabled={zoom <= MIN_ZOOM}
                className="w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 disabled:opacity-30 text-cream flex items-center justify-center transition-colors"
              >
                <ZoomOut size={18} aria-hidden />
              </button>
              <span className="font-satoshi text-cream/80 text-[11px] font-semibold tabular-nums min-w-[42px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5))}
                aria-label="Zoom in"
                disabled={zoom >= MAX_ZOOM}
                className="w-10 h-10 rounded-full bg-cream/10 hover:bg-cream/20 disabled:opacity-30 text-cream flex items-center justify-center transition-colors"
              >
                <ZoomIn size={18} aria-hidden />
              </button>
            </div>

            {/* Thumbnail rail — bottom */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 max-w-[90vw] overflow-x-auto px-2 py-2 rounded-2xl bg-cream/5" onClick={(e) => e.stopPropagation()}>
                {displayImages.map((img, idx) => {
                  const active = selectedIndex === idx;
                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                      aria-pressed={active}
                      className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        active ? 'border-honey-400' : 'border-cream/20 hover:border-cream/50'
                      }`}
                    >
                      <Image src={img.url} alt="" fill sizes="60px" className="object-cover" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Image stage */}
            <motion.div
              key={currentImage.id ?? selectedIndex}
              initial={reduce ? false : { scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? undefined : { scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: HONEY_EASE_OUT }}
              className="relative w-full max-w-5xl aspect-square select-none overflow-hidden"
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onWheel={handleWheel}
              style={{ cursor: zoom > 1 ? 'zoom-out' : 'zoom-in' }}
            >
              <div
                className="relative w-full h-full transition-transform duration-300 ease-out"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                }}
              >
                <Image
                  src={currentImage.url}
                  alt={currentImage.altText || productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
