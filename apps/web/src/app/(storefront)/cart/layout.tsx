import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Your Cart — SUMOSTA',
  description: 'Review the honey in your SUMOSTA cart before checkout.',
  alternates:  { canonical: '/cart' },
  robots:      { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
