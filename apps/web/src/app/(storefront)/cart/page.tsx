'use client';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6 bg-[#FAF7F2]">
      <ShoppingBag size={64} className="text-[#E5E7EB] animate-pulse" />
      <h1 className="font-jakarta font-bold text-charcoal text-3xl">Showcase Mode</h1>
      <p className="font-jakarta text-gray-600 text-base max-w-md">
        SUMOSTA is currently operating as a product showcase catalog. Checkout is suspended until our FSSAI license is issued.
      </p>
      <Link href="/shop" className="btn-pill-orange">
        Browse Product Catalog
      </Link>
    </div>
  );
}
