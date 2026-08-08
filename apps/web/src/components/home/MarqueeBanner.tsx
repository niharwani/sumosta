'use client';
import { useReducedMotion } from 'framer-motion';

const MARQUEE_ITEMS = [
  'RAW HONEY',
  'WILD SOURCED',
  'UNPROCESSED',
  'SINGLE ORIGIN',
  'WESTERN GHATS',
  'SUNDARBANS',
  'HIMALAYAN',
  'PURE NATURE',
];

// Duplicate the sequence so the marquee loops seamlessly at translateX(-50%).
const RUN = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

export default function MarqueeBanner() {
  const reduce = useReducedMotion();

  return (
    <div
      className="bg-honey-100 border-y border-honey-200/60 overflow-hidden pause-on-hover"
      aria-hidden={reduce ? undefined : true}
    >
      <div
        className={reduce ? 'flex whitespace-nowrap' : 'flex whitespace-nowrap animate-marquee'}
        style={reduce ? { transform: 'none' } : undefined}
      >
        {RUN.map((label, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 shrink-0 py-4 px-6 font-clash font-medium text-honey-500 text-lg md:text-xl uppercase"
            style={{ letterSpacing: '0.2em' }}
          >
            <span>{label}</span>
            <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-honey-400/60" />
          </span>
        ))}
      </div>
    </div>
  );
}
