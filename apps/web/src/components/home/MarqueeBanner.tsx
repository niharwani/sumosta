import { MARQUEE_TEXT } from '@/lib/constants';

export default function MarqueeBanner() {
  return (
    <div className="bg-honey-100 py-3 overflow-hidden pause-on-hover">
      <div className="flex whitespace-nowrap animate-marquee">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="font-clash text-honey-400 text-sm uppercase tracking-[0.2em] mx-8 inline-flex items-center gap-8 shrink-0"
          >
            {MARQUEE_TEXT}
          </span>
        ))}
      </div>
    </div>
  );
}
