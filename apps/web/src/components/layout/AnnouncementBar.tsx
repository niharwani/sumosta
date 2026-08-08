'use client';

import { useEffect, useState } from 'react';
import { Leaf, ShieldCheck, Thermometer, BadgeCheck, Truck, Tag } from 'lucide-react';

const ITEMS: { icon: React.ReactNode; label: string }[] = [
  { icon: <Leaf size={13} strokeWidth={2.2} />, label: '100% RAW & UN-PROCESSED' },
  { icon: <ShieldCheck size={13} strokeWidth={2.2} />, label: '100% PURE, NO ADDITIVES' },
  { icon: <Thermometer size={13} strokeWidth={2.2} />, label: 'UN-HEATED, MINIMALLY FILTERED' },
  { icon: <BadgeCheck size={13} strokeWidth={2.2} />, label: 'NABL LAB TESTED & NPOP CERTIFIED' },
  { icon: <Truck size={13} strokeWidth={2.2} />, label: 'FREE DELIVERY ABOVE ₹499' },
  { icon: <Tag size={13} strokeWidth={2.2} />, label: '10% OFF ON YOUR FIRST ORDER' },
];

const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

export default function AnnouncementBar() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Reduced-motion fallback: show a single static row (no marquee, no duplication).
  if (reduceMotion) {
    return (
      <div
        role="region"
        aria-label="Site announcements"
        className="hidden md:flex bg-honey-500 text-cream items-center justify-center overflow-hidden"
        style={{ height: '36px' }}
      >
        <div className="flex items-center gap-8 px-6 overflow-x-auto whitespace-nowrap">
          {ITEMS.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 font-satoshi text-[11.5px] font-semibold tracking-[0.08em]"
            >
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Site announcements"
      className="hidden md:flex bg-honey-500 text-cream items-center overflow-hidden pause-on-hover"
      style={{ height: '36px' }}
    >
      <div
        aria-hidden="true"
        className="sum-announce-track flex items-center whitespace-nowrap"
        style={{ width: 'max-content' }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 font-satoshi text-[11.5px] font-semibold tracking-[0.08em]"
            style={{ padding: '0 28px', flexShrink: 0 }}
          >
            {item.icon}
            {item.label}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes sum-announce-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .sum-announce-track {
          animation: sum-announce-scroll 30s linear infinite;
        }
        .pause-on-hover:hover .sum-announce-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
