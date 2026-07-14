'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Check } from 'lucide-react';
import { fadeUp } from '@/lib/animations';
import RevealOnScroll from '@/components/shared/RevealOnScroll';
import HoneycombLoader from '@/components/shared/HoneycombLoader';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
type FormData = z.infer<typeof schema>;

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@sumosta.com',
    href: 'mailto:hello@sumosta.com',
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: '+91 91378 81791',
    href: 'tel:+919137881791',
  },
  {
    icon: MapPin,
    label: 'Registered Office',
    value: '603, Om Residency, Murar Road, Mulund West, Mumbai, Maharashtra, India - 400080',
    href: null,
  },
  {
    icon: MapPin,
    label: 'Office & Storage',
    value: 'Office no. 6, Lalji Ramji Building, Bhat Bazar, Chinch Bunder, Mandvi, Mumbai - 400009, India',
    href: null,
  },
];

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
      reset();
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-4 py-3 text-sm font-satoshi text-bark bg-white focus:outline-none transition-colors ${
      hasError ? 'border-terracotta/50 focus:border-terracotta' : 'border-sand focus:border-honey-400'
    }`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-20">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="text-center mb-16"
      >
        <p className="font-satoshi text-honey-500 text-xs uppercase tracking-[0.2em] mb-3">Get in touch</p>
        <h1 className="font-clash text-charcoal font-bold" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
          Say Hello
        </h1>
        <p className="font-satoshi text-earth mt-4 max-w-xl mx-auto leading-relaxed">
          From raw, un-processed forest honeys, ultra-premium rare stingless bee honey to corporate gifting or B2B tie-ups – our team is here to help.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Contact Info */}
        <RevealOnScroll variant="slideInLeft">
          <div className="space-y-8">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <div className="w-10 h-10 bg-honey-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-honey-500" />
                </div>
                <div>
                  <p className="font-satoshi text-earth text-xs uppercase tracking-wider mb-1">{label}</p>
                  {href ? (
                    <a href={href} className="font-satoshi text-bark font-medium hover:text-honey-500 transition-colors">
                      {value}
                    </a>
                  ) : (
                    <p className="font-satoshi text-bark font-medium">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-sand">
              <p className="font-satoshi text-earth text-xs uppercase tracking-wider mb-3">Support Hours</p>
              <p className="font-satoshi text-bark text-sm">Monday – Saturday</p>
              <p className="font-satoshi text-earth text-sm">10:00 AM – 6:00 PM IST</p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Contact Form */}
        <RevealOnScroll variant="fadeUp" className="md:col-span-2">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-sage-light border border-sage/20 rounded-2xl p-10 text-center"
            >
              <div className="w-14 h-14 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-white" />
              </div>
              <h3 className="font-satoshi text-charcoal font-semibold text-lg mb-2">Message sent!</h3>
              <p className="font-satoshi text-earth text-sm">
                We'll get back to you within 1–2 business days. Thank you for reaching out.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 font-satoshi text-sm text-honey-500 hover:text-honey-600 underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">
                    Name *
                  </label>
                  <input
                    {...register('name')}
                    className={inputClass(!!errors.name)}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="font-satoshi text-terracotta text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className={inputClass(!!errors.email)}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="font-satoshi text-terracotta text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">
                    Phone
                  </label>
                  <input
                    {...register('phone')}
                    className={inputClass(false)}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">
                    Subject
                  </label>
                  <input
                    {...register('subject')}
                    className={inputClass(false)}
                    placeholder="Order enquiry, wholesale, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block font-satoshi text-bark text-sm font-medium mb-1.5">
                  Message *
                </label>
                <textarea
                  {...register('message')}
                  className={`${inputClass(!!errors.message)} resize-none`}
                  rows={6}
                  placeholder="Tell us how we can help..."
                />
                {errors.message && (
                  <p className="font-satoshi text-terracotta text-xs mt-1">{errors.message.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-terracotta-light border border-terracotta/20 rounded-lg px-4 py-3">
                  <p className="font-satoshi text-terracotta text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-honey-400 hover:bg-honey-500 disabled:opacity-60 text-midnight font-satoshi font-semibold text-sm px-8 py-3 rounded-xl transition-colors"
              >
                {submitting ? <HoneycombLoader size="sm" /> : null}
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </RevealOnScroll>
      </div>
    </div>
  );
}
