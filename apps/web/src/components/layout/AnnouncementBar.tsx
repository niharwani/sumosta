'use client';

const ITEMS = [
  '🚚  Free delivery on orders above ₹499',
  '🎁  10% discount on your first order',
  '📦  10% discount on Bundles & Combos',
  '💳  5% discount on pre-paid orders',
];

export default function AnnouncementBar() {
  const repeated = [...ITEMS, ...ITEMS];

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
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: '12px',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-manrope), var(--font-jakarta), sans-serif',
              padding: '0 40px',
              flexShrink: 0,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes sum-announce-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .sum-announce-track {
          animation: sum-announce-scroll 22s linear infinite;
        }
        .sum-announce-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
