import type { Metadata } from 'next';
import HeroSection        from '@/components/home/HeroSection';
import MarqueeBanner      from '@/components/home/MarqueeBanner';
import BrandIntro         from '@/components/home/BrandIntro';
import VisionMission      from '@/components/home/VisionMission';
import Philosophy         from '@/components/home/Philosophy';
import BrandStoryStrip    from '@/components/home/BrandStoryStrip';
import ProductShowcase    from '@/components/home/ProductShowcase';
import WhyChooseSumosta   from '@/components/home/WhyChooseSumosta';
import EvidenceHubHighlight from '@/components/home/EvidenceHubHighlight';
import ComboGifting       from '@/components/home/ComboGifting';
import FaqAccordion       from '@/components/home/FaqAccordion';
import ConnectWithUs      from '@/components/home/ConnectWithUs';
import NewsletterSection  from '@/components/home/NewsletterSection';

export const metadata: Metadata = {
  title: "SUMOSTA — Indulgence That Cares",
  description:
    "Raw, organic certified wild forest honey, stingless bee honey, and nutrient-dense superfoods from India's wildest apiaries. Zero refined sugars, zero filler chemicals.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeBanner />
      <BrandIntro />
      <VisionMission />
      <Philosophy />
      <BrandStoryStrip />
      <ProductShowcase />
      <WhyChooseSumosta />
      <EvidenceHubHighlight />
      <ComboGifting />
      <FaqAccordion />
      <ConnectWithUs />
      <NewsletterSection />
    </>
  );
}
