'use client';
import { useState } from 'react';
import { newsletterApi } from '@/lib/api';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { useFirstOrderEligibility } from '@/hooks/useFirstOrderEligibility';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { eligible } = useFirstOrderEligibility();

  // The homepage newsletter's entire value prop is the first-order discount.
  // Suppress it for returning customers who can't redeem WELCOME10 anyway —
  // they can still subscribe via the footer form.
  if (!eligible) return null;

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
    <section className="section-padding bg-gradient-to-b from-cream to-honey-50 relative overflow-hidden">
      <div className="absolute inset-0 honeycomb-bg opacity-[0.04] pointer-events-none" />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative text-center">
        
        <RevealOnScroll variant="scaleIn">
          <div className="w-12 h-12 rounded-full bg-honey-100 flex items-center justify-center text-honey-600 mx-auto mb-4">
            <Sparkles size={22} />
          </div>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.1}>
          <h2 className="font-clash text-charcoal font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-3">
            Join the Colony
          </h2>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.2}>
          <p className="font-satoshi text-bark text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Get first access to new forest harvests, lab purity reports, and 10% off your first order.
          </p>
        </RevealOnScroll>

        <RevealOnScroll variant="fadeUp" delay={0.3}>
          {status === 'success' ? (
            <div className="inline-flex items-center gap-2 bg-sage-light text-sage px-6 py-4 rounded-xl font-satoshi font-semibold text-sm">
              <Check size={18} />
              <span>Welcome to the colony! Check your inbox for your discount.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-5 py-3.5 rounded-xl border border-sand bg-cream font-satoshi text-charcoal text-sm focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-200 transition-all"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary py-3.5 px-6 whitespace-nowrap"
              >
                <span>{status === 'loading' ? 'Subscribing...' : 'Subscribe'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="font-satoshi text-terracotta text-xs mt-3">Something went wrong. Please try again.</p>
          )}
        </RevealOnScroll>

      </div>
    </section>
  );
}
