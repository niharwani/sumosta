import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Honey Spectrum
        honey: {
          50:  '#FFF9F0',
          100: '#FFF0D6',
          200: '#FFE0A8',
          300: '#FFCC66',
          400: '#F5A623',
          500: '#D4891A',
          600: '#A66A10',
          700: '#7A4D0B',
        },
        // Neutrals
        cream:       '#FFFDF8',
        'cream-warm': '#FDF6EC',
        sand:        '#F0E6D3',
        'earth-light': '#C4B39A',
        earth:       '#8B7355',
        bark:        '#5C4A32',
        charcoal:    '#2C2417',
        midnight:    '#1A150E',
        // Botanical Accents
        sage:        '#7C9A6E',
        'sage-light': '#E8F0E4',
        terracotta:  '#C4573A',
        'terracotta-light': '#FDE8E3',
        beeswax:     '#F7E89E',
      },
      fontFamily: {
        clash:   ['var(--font-clash)', 'sans-serif'],
        satoshi: ['var(--font-satoshi)', 'sans-serif'],
        bespoke: ['var(--font-bespoke)', 'serif'],
      },
      fontSize: {
        hero:    ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '1.0' }],
        display: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1' }],
        title:   ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.2' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '128': '32rem',
      },
      maxWidth: {
        content: '1400px',
      },
      boxShadow: {
        sm:    '0 1px 3px rgba(44, 36, 23, 0.06)',
        md:    '0 4px 12px rgba(44, 36, 23, 0.08)',
        lg:    '0 12px 40px rgba(44, 36, 23, 0.12)',
        honey: '0 8px 30px rgba(245, 166, 35, 0.2)',
      },
      backgroundImage: {
        'honeycomb-pattern': "url('/images/textures/honeycomb.svg')",
      },
      animation: {
        marquee:  'marquee 30s linear infinite',
        float:    'float 4s ease-in-out infinite',
        'float-delayed': 'float 4s ease-in-out 2s infinite',
        'bee-fly': 'beeFly 3s cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards',
        bounce:   'bounce 1s ease-in-out',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-16px)' },
        },
        beeFly: {
          '0%':   { transform: 'translateX(-100px) translateY(20px)', opacity: '0' },
          '50%':  { opacity: '1' },
          '100%': { transform: 'translateX(120%) translateY(-10px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
