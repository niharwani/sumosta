import { Leaf, ShieldCheck, Thermometer, BadgeCheck, MapPin, Droplets, FlaskConical, Home } from 'lucide-react';

const ITEMS: { icon: React.ReactNode; label: string }[] = [
  { icon: <Leaf size={12} strokeWidth={2.2} />, label: 'Raw & Unprocessed' },
  { icon: <MapPin size={12} strokeWidth={2.2} />, label: 'Single-Origin' },
  { icon: <FlaskConical size={12} strokeWidth={2.2} />, label: 'Lab Certified' },
  { icon: <MapPin size={12} strokeWidth={2.2} />, label: 'Western Ghats' },
  { icon: <Droplets size={12} strokeWidth={2.2} />, label: 'Sundarbans' },
  { icon: <MapPin size={12} strokeWidth={2.2} />, label: 'Himalayan Foothills' },
  { icon: <ShieldCheck size={12} strokeWidth={2.2} />, label: 'Zero Additives' },
  { icon: <Home size={12} strokeWidth={2.2} />, label: 'Hive to Home' },
];

const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

export default function MarqueeBanner() {
  return (
    <div className="bg-midnight border-y border-[#2C2010] overflow-hidden pause-on-hover py-3.5">
      <div className="flex whitespace-nowrap animate-marquee">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 shrink-0 text-earth mx-6"
            style={{
              fontFamily: 'var(--font-satoshi), ui-sans-serif, system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
            <span className="w-1 h-1 rounded-full bg-honey-600 shrink-0 ml-4" />
          </span>
        ))}
      </div>
    </div>
  );
}
