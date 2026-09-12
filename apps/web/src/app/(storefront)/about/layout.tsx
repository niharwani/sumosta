import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Our Story — SUMOSTA',
  description: 'Wild-crafted, single-origin honey sourced ethically from India\'s remote forests — Western Ghats, Sundarbans, and Himalayan foothills.',
  alternates:  { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
