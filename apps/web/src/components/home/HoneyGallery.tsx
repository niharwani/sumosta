'use client';
import Image from 'next/image';

const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop',
    alt: 'Dripping honeycomb',
    className: 'col-span-1 row-span-2 aspect-[3/4]',
  },
  {
    url: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=800&auto=format&fit=crop',
    alt: 'Honey jars and dipper spoon',
    className: 'col-span-2 row-span-1 aspect-[2/1]',
  },
  {
    url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=800&auto=format&fit=crop',
    alt: 'Close up bees on honeycomb',
    className: 'col-span-1 row-span-1 aspect-square',
  },
  {
    url: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?q=80&w=800&auto=format&fit=crop',
    alt: 'Beekeeper harvesting honey',
    className: 'col-span-1 row-span-1 aspect-square',
  },
  {
    url: 'https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=800&auto=format&fit=crop',
    alt: 'Wild bees foraging',
    className: 'col-span-1 row-span-1 aspect-square',
  },
];

export default function HoneyGallery() {
  return (
    <section className="py-20 md:py-28 bg-[#FFFDF8]">
      <div className="max-w-content mx-auto px-6 md:px-10">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="block font-jakarta text-[11px] uppercase tracking-[0.2em] text-earth mb-3">
            From the hive
          </span>
          <h2 className="font-clash font-bold text-charcoal text-[clamp(2rem,4vw,3.5rem)] leading-[1.0] tracking-tight">
            Life of the honey
          </h2>
        </div>

        {/* Gallery grid — asymmetric */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-xl group ${
                i === 1 ? 'col-span-2 md:col-span-2 aspect-[2/1]' : 'aspect-square'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-transparent transition-colors duration-500" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
