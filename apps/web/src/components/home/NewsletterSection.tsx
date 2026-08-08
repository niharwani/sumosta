'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { newsletterApi } from '@/lib/api';
import { HONEY_EASE_OUT } from '@/lib/animations';

export default function NewsletterSection() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await newsletterApi.subscribe(email, 'homepage');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ backgroundColor: 'var(--honey-50)' }}
    >
      {/* Honeycomb pattern texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zM28 100L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='%23F5A623' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: '56px 100px',
        }}
      />

      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 relative text-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: HONEY_EASE_OUT }}
          className="w-12 h-12 rounded-full bg-honey-100 flex items-center justify-center text-honey-600 mx-auto mb-5"
        >
          <Sparkles size={22} />
        </motion.div>

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.08, ease: HONEY_EASE_OUT }}
          className="font-clash font-bold text-charcoal tracking-[-0.01em] mb-3"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.05 }}
        >
          Join the Colony
        </motion.h2>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.16, ease: HONEY_EASE_OUT }}
          className="font-satoshi text-bark text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Get first access to new harvests, exclusive recipes, and 10% off your first order.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.24, ease: HONEY_EASE_OUT }}
        >
          {status === 'success' ? (
            <div className="inline-flex items-center gap-2 bg-sage-light text-sage px-6 py-4 rounded-md font-satoshi font-semibold text-sm">
              <Check size={18} />
              <span>Welcome to the colony — check your inbox.</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 rounded-md border border-sand bg-cream font-satoshi text-charcoal text-sm placeholder:text-earth-light focus:outline-none focus:border-honey-400 focus:ring-2 focus:ring-honey-200/60 transition"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-honey disabled:opacity-70"
              >
                <span>{status === 'loading' ? 'Subscribing…' : 'Subscribe'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="font-satoshi text-terracotta text-xs mt-3">
              Something went wrong. Please try again.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
