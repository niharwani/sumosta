'use client';
import { useState } from 'react';
import { newsletterApi } from '@/lib/api';
import RevealOnScroll from '@/components/shared/RevealOnScroll';

export default function NewsletterSection() {
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await newsletterApi.subscribe(email, 'footer');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-honey-50 relative overflow-hidden">
      <div className="absolute inset-0 honeycomb-bg opacity-[0.04] pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative text-center">
        <RevealOnScroll variant="scaleIn">
          <h2 className="font-clash text-charcoal font-bold mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Join the Colony
          </h2>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.1}>
          <p className="font-satoshi text-earth text-base md:text-lg max-w-xl mx-auto mb-8">
            Get first access to new harvests, exclusive recipes, and 10% off your first order.
          </p>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.2}>
          {status === 'success' ? (
            <p className="font-satoshi text-sage font-medium text-lg">
              🐝 Welcome to the colony! Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 rounded-md border border-sand bg-cream font-satoshi text-charcoal text-sm focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-200 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-honey-400 text-midnight font-satoshi font-semibold text-sm px-7 py-3.5 rounded-md hover:bg-honey-500 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="font-satoshi text-terracotta text-sm mt-3">Something went wrong. Please try again.</p>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
