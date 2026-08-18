'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Check, Loader2 } from 'lucide-react';
import { newsletterApi } from '@/lib/api';
import { FOOTER_LINKS, SOCIAL_LINKS } from '@/lib/constants';

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook:  Facebook,
  twitter:   Twitter,
};

function FooterNewsletter() {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError]     = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setError('');
    try {
      await newsletterApi.subscribe(email.trim(), 'footer');
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Could not subscribe. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-honey-300 font-satoshi text-sm">
        <Check size={16} strokeWidth={2.2} aria-hidden="true" />
        <span>You&apos;re on the list. Watch your inbox for our next harvest.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row flex-wrap gap-2 w-full max-w-sm"
    >
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="your.email@example.com"
        aria-invalid={status === 'error'}
        aria-describedby={status === 'error' ? 'footer-newsletter-error' : undefined}
        className="flex-1 bg-charcoal/60 border border-earth/30 text-cream placeholder:text-earth rounded-md font-satoshi text-sm px-4 py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 focus:border-honey-400 transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 font-satoshi text-[12px] font-semibold uppercase tracking-[0.1em] bg-honey-500 hover:bg-honey-600 disabled:opacity-60 text-cream px-5 py-2.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight whitespace-nowrap"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Subscribing…
          </>
        ) : (
          'Subscribe'
        )}
      </button>
      {status === 'error' && (
        <p
          id="footer-newsletter-error"
          role="alert"
          className="w-full font-satoshi text-terracotta-light text-xs mt-1"
        >
          {error}
        </p>
      )}
    </form>
  );
}

const PAYMENT_METHODS = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'COD'];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-midnight text-cream font-satoshi"
      style={{ padding: '64px 24px 32px' }}
    >
      {/* Noise texture overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 mix-blend-overlay opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-content mx-auto relative">
        {/* Top newsletter banner */}
        <div className="mb-12 pb-10 border-b border-earth/20 grid gap-6 md:grid-cols-[1.2fr,1fr] md:items-end">
          <div>
            <p className="font-satoshi text-honey-300 uppercase tracking-[0.15em] text-[11px] font-bold mb-2">
              Join the Colony
            </p>
            <h2 className="font-clash font-extrabold text-cream text-2xl md:text-3xl leading-tight mb-1">
              First harvest. First offer.
            </h2>
            <p className="font-satoshi text-earth-light text-sm max-w-md">
              Subscribe for new-batch alerts, honey rituals, and 10% off your first order.
            </p>
          </div>
          <FooterNewsletter />
        </div>

        {/* Link columns */}
        <div className="sum-footer-grid mb-12">
          {/* Brand */}
          <div>
            <span className="font-clash font-extrabold text-cream text-[20px] block">
              SUMOSTA
            </span>
            <p className="font-bespoke italic text-earth-light text-sm mt-2 mb-4">
              Indulgence that cares
            </p>
            <p className="text-earth-light text-xs leading-[1.7] mb-6">
              Raw, unprocessed honey sourced from India&apos;s wildest apiaries.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3" aria-label="Follow us on social media">
              {SOCIAL_LINKS.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform] ?? Instagram;
                return (
                  <a
                    key={s.platform}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-earth/30 flex items-center justify-center text-earth-light hover:text-honey-300 hover:border-honey-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400"
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-honey-300 uppercase tracking-[0.15em] text-[11px] font-bold mb-4">Shop</h3>
            <div className="flex flex-col gap-2.5">
              {FOOTER_LINKS.shop.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-earth-light text-[13px] hover:text-honey-300 transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-honey-300 uppercase tracking-[0.15em] text-[11px] font-bold mb-4">Company</h3>
            <div className="flex flex-col gap-2.5">
              {FOOTER_LINKS.company.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-earth-light text-[13px] hover:text-honey-300 transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-honey-300 uppercase tracking-[0.15em] text-[11px] font-bold mb-4">Help</h3>
            <div className="flex flex-col gap-2.5">
              {FOOTER_LINKS.help.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-earth-light text-[13px] hover:text-honey-300 transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 rounded-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Certification logos row */}
        <div className="border-t border-earth/20 pt-6 mb-5">
          <p className="uppercase tracking-[0.12em] text-earth text-[10px] font-semibold mb-4">
            Certified &amp; Compliant
          </p>
          {/* Left-aligned single row. Logos normalized on HEIGHT (not width)
              so the landscape marks (FSSAI, Make in India) and the square
              marks (Jaivik, NABL) read at the same visual weight. */}
          <div className="flex flex-nowrap items-center justify-start gap-4 md:flex-wrap md:gap-7">
            {[
              { src: '/images/brand/fssai-logo-freelogovectors.net_.png',    alt: 'FSSAI Registered',            desc: 'Food Safety Certified', w: 80, h: 36 },
              { src: '/images/brand/makeinindia.png',                        alt: 'Make in India',               desc: 'Proudly Indian',         w: 80, h: 36 },
              { src: '/images/brand/Jaivik_Bharat_eng.png',                  alt: 'Jaivik Bharat / NPOP APEDA',  desc: 'Organic Certified',      w: 56, h: 56 },
              { src: '/images/brand/nabl-india-logo-png_seeklogo-96699.png', alt: 'NABL ISO/IEC 17025',          desc: 'Lab Tested',             w: 56, h: 56 },
            ].map((cert) => (
              <div key={cert.alt} className="flex flex-col items-start gap-1 md:gap-1.5 shrink-0">
                <Image
                  src={cert.src}
                  alt={cert.alt}
                  width={cert.w}
                  height={cert.h}
                  className="w-auto h-7 md:h-9"
                  style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.8 }}
                />
                <span className="hidden md:inline text-earth text-[9px] tracking-[0.04em]">{cert.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar: copyright + payment methods */}
        <div className="border-t border-earth/20 pt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-earth-light text-xs m-0">
            © 2026 SUMOSTA · Yatris NutriFoods Pvt Ltd. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
            {PAYMENT_METHODS.map((m) => (
              <li
                key={m}
                className="font-satoshi text-earth-light text-[11px] border border-sand/30 rounded px-2 py-0.5"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .sum-footer-grid { display:grid; grid-template-columns:1fr; gap:36px; }
        @media(min-width:768px){ .sum-footer-grid{ grid-template-columns:1.4fr 1fr 1fr 1fr !important; } }
      `}</style>
    </footer>
  );
}
