import type { Metadata } from 'next';
import HeroSection        from '@/components/home/HeroSection';
import MarqueeBanner      from '@/components/home/MarqueeBanner';
import ProductShowcase    from '@/components/home/ProductShowcase';
import BrandStoryStrip    from '@/components/home/BrandStoryStrip';
import CategoryGrid       from '@/components/home/CategoryGrid';
import HoneyProcess       from '@/components/home/HoneyProcess';
import TestimonialCarousel from '@/components/home/TestimonialCarousel';
import NewsletterSection  from '@/components/home/NewsletterSection';
import GoldenDivider      from '@/components/shared/GoldenDivider';

export const metadata: Metadata = {
  title: "SUMOSTA — Nature's Golden Promise",
  description:
    "Raw, unprocessed honey from India's wildest apiaries. Western Ghats, Sundarbans, and Himalayan single-origin honey.",
};

async function getFeaturedProducts() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
    const res = await fetch(`${apiUrl}/api/products?sort=featured&limit=8`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.products ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <MarqueeBanner />
      <ProductShowcase products={featuredProducts} />
      <GoldenDivider />
      <BrandStoryStrip />
      <CategoryGrid />
      <HoneyProcess />
      <TestimonialCarousel />
      <NewsletterSection />
    </>
  );
}
