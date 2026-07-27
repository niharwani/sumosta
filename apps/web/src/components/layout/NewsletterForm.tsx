'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="font-jakarta text-honey-400 text-sm">
        You're on the list. Watch your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 w-full md:max-w-md"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 bg-[#2C2010] border border-[#3D2F18] text-[#F0E6D3] placeholder-earth rounded font-jakarta text-sm px-4 py-3 focus:outline-none focus:border-honey-500 transition-colors"
      />
      <button
        type="submit"
        className="font-jakarta text-[13px] font-semibold uppercase tracking-[0.1em] bg-honey-500 hover:bg-honey-600 text-[#FFFDF8] px-6 py-3 rounded transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  );
}
