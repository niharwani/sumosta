import localFont from 'next/font/local';

export const clashDisplay = localFont({
  src: '../../public/fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash',
  display: 'swap',
  preload: true,
});

export const satoshi = localFont({
  src: '../../public/fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
  preload: true,
});

export const bespokeSerif = localFont({
  src: '../../public/fonts/BespokeSerif-Variable.woff2',
  variable: '--font-bespoke',
  display: 'swap',
  preload: false,
});
