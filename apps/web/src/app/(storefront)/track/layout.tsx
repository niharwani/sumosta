import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Track Your Order — SUMOSTA',
  description: 'Track your SUMOSTA order — courier, AWB, and delivery status in real time.',
  alternates:  { canonical: '/track' },
  robots:      { index: false, follow: true },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
