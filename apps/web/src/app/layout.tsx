import type { Metadata } from 'next';
import { clashDisplay, satoshi, bespokeSerif } from '@/lib/fonts';
import QueryProvider from '@/components/providers/QueryProvider';
import LenisProvider from '@/components/shared/LenisProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SUMOSTA — Nature\'s Golden Promise',
    template: '%s | SUMOSTA',
  },
  description:
    "Raw, unprocessed honey sourced from India's wildest apiaries. Western Ghats, Sundarbans, and Himalayan single-origin honey. From hive to home, nothing added, nothing taken.",
  keywords: ['raw honey', 'organic honey', 'single origin honey', 'India honey', 'Western Ghats honey'],
  metadataBase: new URL('https://sumosta.com'),
  openGraph: {
    type:        'website',
    siteName:    'SUMOSTA',
    title:       "SUMOSTA — Nature's Golden Promise",
    description: "Raw, unprocessed honey sourced from India's wildest apiaries.",
    images:      [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SUMOSTA Honey' }],
  },
  twitter: {
    card:  'summary_large_image',
    title: "SUMOSTA — Nature's Golden Promise",
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${satoshi.variable} ${bespokeSerif.variable}`}
    >
      <body className="bg-cream text-charcoal font-satoshi antialiased">
        <QueryProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
