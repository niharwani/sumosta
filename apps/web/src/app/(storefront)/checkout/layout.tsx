import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Checkout — SUMOSTA',
  description: 'Complete your SUMOSTA order — secure checkout with UPI, cards, and net banking.',
  alternates:  { canonical: '/checkout' },
  robots:      { index: false, follow: true },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
