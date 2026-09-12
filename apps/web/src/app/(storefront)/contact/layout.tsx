import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:       'Contact Us — SUMOSTA',
  description: 'Get in touch with the SUMOSTA team — orders, wholesale, media, or anything else.',
  alternates:  { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
