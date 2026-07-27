const ITEMS = [
  'Raw & Unprocessed',
  'Single-Origin',
  'Lab Certified',
  'Western Ghats',
  'Sundarbans',
  'Himalayan Foothills',
  'Zero Additives',
  'Hive to Home',
];

export default function MarqueeBanner() {
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="bg-midnight border-y border-[#2C2010] overflow-hidden pause-on-hover py-3.5">
      <div className="flex whitespace-nowrap animate-marquee">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 shrink-0 font-jakarta text-[11px] uppercase tracking-[0.22em] text-earth mx-6"
          >
            <span>{item}</span>
            <span className="w-1 h-1 rounded-full bg-honey-600 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
