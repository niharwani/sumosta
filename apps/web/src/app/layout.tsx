import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Caveat, Bricolage_Grotesque, Manrope, Instrument_Serif } from 'next/font/google';
import { clashDisplay, satoshi, bespokeSerif } from '@/lib/fonts';
import QueryProvider from '@/components/providers/QueryProvider';
import LenisProvider from '@/components/shared/LenisProvider';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SUMOSTA — Natural Honey Straight from the Hive',
    template: '%s | SUMOSTA',
  },
  description:
    "Raw, unprocessed honey sourced from India's wildest apiaries. Western Ghats, Saranda, Abujhmarh, Kandhamal, and Himalayan single-origin honey. From hive to home, nothing added, nothing taken.",
  keywords: ['raw honey', 'organic honey', 'single origin honey', 'India honey', 'Western Ghats honey'],
  metadataBase: new URL('https://sumosta.com'),
  openGraph: {
    type:        'website',
    siteName:    'SUMOSTA',
    title:       "SUMOSTA — Natural Honey Straight from the Hive",
    description: "Raw, unprocessed honey sourced from India's wildest apiaries.",
    images:      [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SUMOSTA Honey' }],
  },
  twitter: {
    card:  'summary_large_image',
    title: "SUMOSTA — Natural Honey Straight from the Hive",
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
      className={`${jakarta.variable} ${caveat.variable} ${clashDisplay.variable} ${satoshi.variable} ${bespokeSerif.variable} ${bricolage.variable} ${manrope.variable} ${instrumentSerif.variable}`}
    >
      <body className="bg-[#FAF7F2] text-[#1A1A1A] font-jakarta antialiased">
        <QueryProvider>
          <LenisProvider>
            {children}
          </LenisProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
