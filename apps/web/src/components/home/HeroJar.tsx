export default function HeroJar() {
  return (
    <svg
      viewBox="0 0 180 290"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="SUMOSTA Western Ghats Raw Honey jar"
      role="img"
    >
      <defs>
        <linearGradient id="hj-honey" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFCC66" />
          <stop offset="100%" stopColor="#A66A10" />
        </linearGradient>
        <linearGradient id="hj-glass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FFE0A8" stopOpacity="0.42" />
          <stop offset="38%"  stopColor="#FFFDF8" stopOpacity="0.68" />
          <stop offset="100%" stopColor="#FFE0A8" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id="hj-neck" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FFE0A8" stopOpacity="0.48" />
          <stop offset="50%"  stopColor="#FFFDF8" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#FFE0A8" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id="hj-label" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#FFFDF8" />
          <stop offset="100%" stopColor="#FFF0D6" />
        </linearGradient>
        <radialGradient id="hj-glow" cx="50%" cy="68%" r="48%">
          <stop offset="0%"   stopColor="#F5A623" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hj-body-clip">
          <path d="M 18 68 L 18 258 Q 18 278 40 280 L 140 280 Q 162 278 162 258 L 162 68 Z" />
        </clipPath>
      </defs>

      {/* Ambient glow behind jar */}
      <ellipse cx="90" cy="210" rx="88" ry="68" fill="url(#hj-glow)" />

      {/* ── BODY ── */}
      <path
        d="M 18 68 L 18 258 Q 18 280 40 282 L 140 282 Q 162 280 162 258 L 162 68 Z"
        fill="url(#hj-glass)"
        stroke="#F5A623"
        strokeWidth="1.4"
      />

      {/* Honey fill, clipped to jar body */}
      <rect x="18" y="148" width="144" height="134"
            fill="url(#hj-honey)"
            clipPath="url(#hj-body-clip)"
            opacity="0.92" />

      {/* Honey surface — gentle wave */}
      <path
        d="M 20 150 Q 56 141 90 149 Q 126 157 162 144"
        fill="none"
        stroke="#FFCC66"
        strokeWidth="1.4"
        opacity="0.75"
        clipPath="url(#hj-body-clip)"
      />

      {/* Glass left shine */}
      <path
        d="M 30 74 Q 28 88 30 216"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeOpacity="0.28"
        strokeLinecap="round"
      />

      {/* Glass right subtle highlight */}
      <path
        d="M 150 78 Q 152 94 150 158"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.14"
        strokeLinecap="round"
      />

      {/* ── NECK ── */}
      <path
        d="M 57 32 L 57 68 L 123 68 L 123 32 Q 123 27 118 26 L 62 26 Q 57 27 57 32 Z"
        fill="url(#hj-neck)"
        stroke="#F5A623"
        strokeWidth="1.4"
      />
      <rect x="63" y="32" width="20" height="32" rx="2"
            fill="white" fillOpacity="0.2" />

      {/* ── LID ── */}
      <rect x="40" y="8" width="100" height="23" rx="5" fill="#2C2417" />
      <rect x="48" y="12" width="38" height="8" rx="3"
            fill="white" fillOpacity="0.08" />
      {/* Lid-to-neck shadow seam */}
      <rect x="40" y="28" width="100" height="5"
            fill="#1A150E" fillOpacity="0.22" />

      {/* ── LABEL ── */}
      <rect x="34" y="160" width="112" height="82" rx="3"
            fill="url(#hj-label)" fillOpacity="0.97" />

      {/* Top rule */}
      <line x1="42" y1="170" x2="138" y2="170"
            stroke="#F5A623" strokeWidth="0.7" />

      {/* Brand name */}
      <text
        x="90" y="192"
        textAnchor="middle"
        fontFamily="var(--font-clash), sans-serif"
        fontWeight="700"
        fontSize="11"
        letterSpacing="4"
        fill="#2C2417"
      >
        SUMOSTA
      </text>

      {/* Mid divider */}
      <line x1="56" y1="200" x2="124" y2="200"
            stroke="#F5A623" strokeWidth="0.5" />

      {/* Origin italic */}
      <text
        x="90" y="214"
        textAnchor="middle"
        fontFamily="var(--font-bespoke), serif"
        fontStyle="italic"
        fontSize="8"
        fill="#8B7355"
      >
        Western Ghats
      </text>

      {/* Product type */}
      <text
        x="90" y="229"
        textAnchor="middle"
        fontFamily="var(--font-satoshi), sans-serif"
        fontSize="6.5"
        letterSpacing="2.5"
        fill="#8B7355"
      >
        RAW HONEY
      </text>

      {/* Bottom rule */}
      <line x1="42" y1="235" x2="138" y2="235"
            stroke="#F5A623" strokeWidth="0.7" />

      {/* ── HONEY DRIP ── */}
      <path
        className="drip-path"
        d="M 160 108 C 172 122 174 140 170 156 C 166 170 161 178 164 190 C 167 201 163 211 159 220"
        fill="none"
        stroke="#F5A623"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <ellipse
        className="drip-drop"
        cx="158" cy="228"
        rx="6" ry="8"
        fill="#F5A623"
      />
    </svg>
  );
}
