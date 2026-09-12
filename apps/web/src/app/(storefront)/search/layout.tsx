import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Search — SUMOSTA',
  description: 'Search SUMOSTA\'s collection of raw, single-origin honey and curated bundles.',
  alternates:  { canonical: '/search' },
  // Query-driven pages shouldn't be indexed — every distinct search string
  // is a variant of the same base page.
  robots:      { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
