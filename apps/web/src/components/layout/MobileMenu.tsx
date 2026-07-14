'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Instagram } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useUIStore } from '@/stores/ui-store';

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
          />
          <motion.nav
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-midnight flex flex-col px-8 py-10"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={closeMobileMenu}
              className="absolute top-6 right-6 text-earth-light hover:text-cream transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            <Link
              href="/"
              className="font-clash text-cream text-2xl font-bold mb-10"
              onClick={closeMobileMenu}
            >
              SUMOSTA
            </Link>

            <ul className="flex flex-col gap-6 flex-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-clash text-cream text-3xl font-semibold hover:text-honey-300 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 mt-auto border-t border-earth/20 pt-6">
              <Link href="/auth/login" className="text-earth-light font-satoshi text-sm hover:text-cream" onClick={closeMobileMenu}>
                Sign In / Register
              </Link>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-earth-light font-satoshi text-sm hover:text-cream"
              >
                <Instagram size={16} /> @sumosta
              </a>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
