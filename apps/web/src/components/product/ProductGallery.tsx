'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductImage } from 'shared';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  batchCertificate?: any;
}

export default function ProductGallery({ images, productName, batchCertificate }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  // We will show all product images.
  // If batchCertificate is present, we append a special "Lab Report" tab at the end.
  const showLabReport = !!batchCertificate;
  const totalTabs = images.length + (showLabReport ? 1 : 0);

  // Active index check:
  // If active < images.length, render active image
  // If active === images.length, render Lab Report specs
  const activeImage = active < images.length ? images[active] : null;

  const getParamResult = (key: string) => {
    if (!batchCertificate || !batchCertificate.parameters) return 'N/A';
    const found = batchCertificate.parameters.find((p: any) => 
      p.name.toLowerCase().includes(key.toLowerCase())
    );
    return found ? found.result : 'N/A';
  };

  const getParamLimit = (key: string, defaultLimit: string) => {
    if (!batchCertificate || !batchCertificate.parameters) return defaultLimit;
    const found = batchCertificate.parameters.find((p: any) => 
      p.name.toLowerCase().includes(key.toLowerCase())
    );
    return found ? found.fssaiLimit.replace(/fssai/gi, 'Permitted') : defaultLimit;
  };

  return (
    <div>
      {/* Main viewport */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-cream-warm border border-sand mb-4 p-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeImage ? (
            <motion.div
              key={activeImage.id}
              className="absolute inset-0 flex items-center justify-center p-6 bg-cream-warm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={activeImage.url}
                alt={activeImage.altText || productName}
                className="max-h-full max-w-full object-contain select-none"
              />
            </motion.div>
          ) : batchCertificate ? (
            // Render specifications table (Lab Report)
            <motion.div
              key="lab-report"
              className="absolute inset-0 flex flex-col justify-between p-6 bg-cream-warm overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-sand pb-3 mb-4">
                    <div>
                      <h3 className="font-clash font-bold text-charcoal text-base">Lab Quality Specifications</h3>
                      <p className="font-satoshi text-[10px] text-earth-light uppercase tracking-wider">Batch: {batchCertificate.batchNo}</p>
                    </div>
                    <span className="text-xs bg-sage-light text-sage font-bold px-2 py-0.5 rounded">PASSED</span>
                  </div>

                  <div className="space-y-2 font-satoshi text-xs text-bark">
                    <div className="flex justify-between py-1.5 border-b border-sand/40">
                      <span className="text-charcoal font-medium">Moisture Content</span>
                      <span className="font-semibold text-charcoal">{getParamResult('moisture')} (Limit: {getParamLimit('moisture', 'Max 20%')})</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-sand/40">
                      <span className="text-charcoal font-medium">Sucrose Content</span>
                      <span className="font-semibold text-charcoal">{getParamResult('sucrose')} (Limit: {getParamLimit('sucrose', 'Max 5%')})</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-sand/40">
                      <span className="text-charcoal font-medium">HMF (Freshness)</span>
                      <span className="font-semibold text-charcoal">{getParamResult('hmf')} (Limit: {getParamLimit('hmf', 'Max 80 mg/kg')})</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-sand/40">
                      <span className="text-charcoal font-medium">C3/C4 Sugar Syrups</span>
                      <span className="font-semibold text-charcoal">{getParamResult('c3/c4')} (Limit: {getParamLimit('c3/c4', 'Absent')})</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-sand/40">
                      <span className="text-charcoal font-medium">Pollen Count</span>
                      <span className="font-semibold text-charcoal">{getParamResult('pollen')} (Limit: {getParamLimit('pollen', 'Min 25,000 grains/g')})</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-sand text-[10px] text-earth-light flex items-center justify-between">
                  <span>NABL Food Diagnostics Labs Certified</span>
                  <span>100% Pure, Raw & Unpasteurized</span>
                </div>
              </div>
            </motion.div>
          ) : (
            // Fallback placeholder
            <motion.div
              key="fallback-placeholder"
              className="absolute inset-0 flex flex-col justify-between p-8 items-center text-center bg-cream-warm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-satoshi text-[10px] tracking-[0.2em] font-semibold text-honey-600 uppercase">
                SUMOSTA • 100% PURE
              </span>
              <span className="text-[120px] select-none my-auto">🍯</span>
              <span className="font-satoshi text-xs text-bark bg-sand/30 border border-sand/65 px-3 py-1 rounded uppercase font-semibold">
                Glass Jar
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={cn(
              'relative shrink-0 w-16 h-16 rounded-lg border-2 transition-colors flex items-center justify-center bg-cream-warm p-1.5',
              i === active ? 'border-honey-400' : 'border-transparent hover:border-honey-200',
            )}
          >
            <img src={img.url} alt="" className="max-h-full max-w-full object-contain" />
          </button>
        ))}

        {showLabReport && (
          <button
            onClick={() => setActive(images.length)}
            className={cn(
              'relative shrink-0 w-16 h-16 rounded-lg border-2 transition-colors flex flex-col items-center justify-center bg-cream-warm text-[10px] font-bold text-honey-600',
              active === images.length ? 'border-honey-400' : 'border-transparent hover:border-honey-200',
            )}
          >
            <span className="text-xl">📊</span>
            <span className="text-[7px] text-bark select-none uppercase tracking-tighter mt-0.5">Lab Report</span>
          </button>
        )}
      </div>
    </div>
  );
}
