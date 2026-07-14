'use client';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6 bg-cream">
      <ShoppingBag size={64} className="text-sand animate-pulse" />
      <h1 className="font-clash text-charcoal text-3xl font-bold">Showcase Mode</h1>
      <p className="font-satoshi text-earth text-base max-w-md">
        SUMOSTA is currently operating as a product showcase catalog. Checkout is suspended until our FSSAI license is issued.
      </p>
      <Link href="/shop" className="bg-honey-400 text-midnight font-satoshi font-semibold px-8 py-3.5 rounded-md hover:bg-honey-500 transition-colors shadow-honey">
        Browse Product Catalog
      </Link>
    </div>
  );
}
