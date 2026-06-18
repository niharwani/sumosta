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

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeBanner />
      <ProductShowcase />
      <GoldenDivider />
      <BrandStoryStrip />
      <CategoryGrid />
      <HoneyProcess />
      <TestimonialCarousel />
      <NewsletterSection />
    </>
  );
}
