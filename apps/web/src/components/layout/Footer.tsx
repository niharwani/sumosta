import Link from 'next/link';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { FOOTER_LINKS, SITE_CONFIG } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-midnight">
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 pt-16 pb-8">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <span className="font-clash text-cream font-bold text-xl">SUMOSTA</span>
            <p className="font-bespoke italic text-earth-light text-sm mt-2 mb-5">
              {SITE_CONFIG.tagline}
            </p>
            <p className="font-satoshi text-earth-light text-xs leading-relaxed mb-5">
              Raw, unprocessed honey sourced from India&rsquo;s wildest apiaries. From hive to home, nothing added, nothing taken.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/sumosta" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-earth-light hover:text-honey-300 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com/sumosta" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-earth-light hover:text-honey-300 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://facebook.com/sumosta" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-earth-light hover:text-honey-300 transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-satoshi uppercase tracking-widest text-honey-300 text-xs font-semibold mb-4">Shop</h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-satoshi text-earth-light text-sm hover:text-honey-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-satoshi uppercase tracking-widest text-honey-300 text-xs font-semibold mb-4">Company</h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-satoshi text-earth-light text-sm hover:text-honey-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-satoshi uppercase tracking-widest text-honey-300 text-xs font-semibold mb-4">Help</h3>
            <ul className="flex flex-col gap-3">
              {FOOTER_LINKS.help.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-satoshi text-earth-light text-sm hover:text-honey-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-earth/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-satoshi text-earth-light text-xs">
            &copy; {new Date().getFullYear()} SUMOSTA. All rights reserved.
          </p>
          <p className="font-satoshi text-earth-light text-xs">
            UPI &bull; Visa &bull; Mastercard &bull; RuPay
          </p>
        </div>
      </div>
    </footer>
  );
}
