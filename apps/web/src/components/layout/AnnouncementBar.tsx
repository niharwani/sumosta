'use client';

import { Leaf, ShieldCheck, Thermometer, BadgeCheck, Truck, Tag } from 'lucide-react';

const ITEMS: { icon: React.ReactNode; label: string }[] = [
  { icon: <Leaf size={13} strokeWidth={2.2} />, label: '100% RAW & UN-PROCESSED' },
  { icon: <ShieldCheck size={13} strokeWidth={2.2} />, label: '100% PURE, NO ADDITIVES' },
  { icon: <Thermometer size={13} strokeWidth={2.2} />, label: 'UN-HEATED, MINIMALLY FILTERED' },
  { icon: <BadgeCheck size={13} strokeWidth={2.2} />, label: 'NABL LAB TESTED & NPO CERTIFIED' },
  { icon: <Truck size={13} strokeWidth={2.2} />, label: 'FREE DELIVERY ABOVE ₹499' },
  { icon: <Tag size={13} strokeWidth={2.2} />, label: '10% OFF ON YOUR FIRST ORDER' },
];

const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

export default function AnnouncementBar() {
  return (
    <div
      style={{
        background: '#C68642',
        color: '#FFF9F0',
        overflow: 'hidden',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="sum-announce-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-satoshi), ui-sans-serif, system-ui, sans-serif',
              padding: '0 28px',
              flexShrink: 0,
            }}
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
        .sum-announce-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
