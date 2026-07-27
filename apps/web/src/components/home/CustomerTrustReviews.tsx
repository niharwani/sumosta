'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, ArrowUpRight } from 'lucide-react';

const REVIEWS = [
  {
    id: '1',
    name: 'Arjun Mehta',
    role: 'Nutritionist, Mumbai',
    quote: "The Western Ghats jar is unlike anything I've tasted — raw, complex, and genuinely unprocessed.",
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Priya Nair',
    role: 'Wellness Coach, Bangalore',
    quote: "I've tried a dozen natural honeys. Sumosta is the only one that actually smells and tastes wild.",
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Rohan Das',
    role: 'Chef, New Delhi',
    quote: "The Himalayan batch crystallised naturally — that's how you know it's untouched. We use it on the menu.",
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
  },
];

export default function CustomerTrustReviews() {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <section className="py-20 md:py-28 bg-[#FFFDF8]">
      <div className="max-w-content mx-auto px-6 md:px-10">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div>
            <span className="block font-satoshi text-[11px] uppercase tracking-[0.2em] text-earth mb-3">
              What people say
            </span>
            <h2 className="font-clash font-bold text-charcoal text-[clamp(2rem,4vw,3.5rem)] leading-[1.0] tracking-tight">
              1,000+ customers<br />
              <span className="font-bespoke italic font-normal text-honey-500">trust us</span>
            </h2>
          </div>
          <Link
            href="/about"
            className="group hidden md:inline-flex items-center gap-2 font-satoshi text-[13px] tracking-wide text-earth hover:text-charcoal transition-colors"
          >
            Read all reviews
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Portrait review cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-8">
          {REVIEWS.map((rev, i) => {
            const isPlaying = playingId === rev.id;
            return (
              <div
                key={rev.id}
                className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                  i === 1 ? 'md:mt-6' : ''
                }`}
                style={{ aspectRatio: '3/4' }}
                onClick={() => setPlayingId(isPlaying ? null : rev.id)}
              >
                {/* Background image */}
                <Image
                  src={rev.image}
                  alt={rev.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A120A]/90 via-[#1A120A]/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-4">

                  {/* Pull quote */}
                  <p className="font-bespoke italic text-[#F0E6D3] text-[15px] leading-snug line-clamp-3">
                    "{rev.quote}"
                  </p>

                  {/* Name row */}
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="font-satoshi font-semibold text-[#FFFDF8] text-sm">{rev.name}</p>
                      <p className="font-satoshi text-earth-light text-[11px] mt-0.5">{rev.role}</p>
                    </div>
                    <button
                      aria-label={isPlaying ? 'Pause' : 'Play review video'}
                      className="w-10 h-10 rounded-full bg-[#FFFDF8]/15 backdrop-blur-sm border border-[#FFFDF8]/20 flex items-center justify-center text-[#FFFDF8] hover:bg-[#FFFDF8]/25 transition-all shrink-0"
                    >
                      {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" className="ml-0.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="flex md:hidden justify-center">
          <Link href="/about" className="btn-outline inline-flex items-center gap-2 text-sm">
            Read all reviews
            <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}
