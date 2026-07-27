'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from 'shared';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  batchCertificate?: any;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images.length > 0 ? images : [
    { id: '1', url: '/images/products/wild-forest-1.png', altText: productName, sortOrder: 1, isPrimary: true },
    { id: '2', url: '/images/products/wild-forest-2.png', altText: productName, sortOrder: 2, isPrimary: false },
    { id: '3', url: '/images/products/stingless-1.png', altText: productName, sortOrder: 3, isPrimary: false },
    { id: '4', url: '/images/products/tribal-1.png', altText: productName, sortOrder: 4, isPrimary: false },
    { id: '5', url: '/images/products/honeydew-1.png', altText: productName, sortOrder: 5, isPrimary: false },
  ];

  const currentImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="space-y-4">
      
      {/* Main Image Container (Ref Image 2 layout) */}
      <div className="relative aspect-square w-full rounded-3xl bg-[#F5F1E9] p-8 flex items-center justify-center overflow-hidden shadow-2xs">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={currentImage.url}
            alt={currentImage.altText || productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain transition-all duration-300"
          />
        </div>
      </div>

      {/* 5 Thumbnail Selectors Row (Ref Image 2 layout) */}
      <div className="grid grid-cols-5 gap-3">
        {displayImages.slice(0, 5).map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => setSelectedIndex(idx)}
            className={`relative aspect-square rounded-2xl bg-white border p-2 flex items-center justify-center overflow-hidden transition-all ${
              selectedIndex === idx
                ? 'border-[#F97316] ring-2 ring-[#F97316]/20 shadow-xs'
                : 'border-gray-200 hover:border-gray-300'
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
        ))}
      </div>

    </div>
  );
}
