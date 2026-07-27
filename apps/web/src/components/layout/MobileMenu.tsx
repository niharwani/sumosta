'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Instagram, Search, ShoppingBag, User, ArrowRight } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';
import { useUIStore } from '@/stores/ui-store';
import { useCartStore } from '@/stores/cart-store';

export default function MobileMenu() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { itemCount, openCart } = useCartStore();

  const handleCartClick = () => {
    closeMobileMenu();
    openCart();
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <motion.nav
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0F172A] flex flex-col px-8 py-8 shadow-2xl border-l border-white/10"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-8 border-b border-white/10">
              <Link
                href="/"
                className="font-clash font-bold text-[#FFFDF8] text-xl tracking-[0.06em] uppercase"
                onClick={closeMobileMenu}
              >
                Sumosta
              </Link>
              <button
                onClick={closeMobileMenu}
                className="text-[#8B7355] hover:text-[#F0E6D3] transition-colors p-2"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 my-6">
              <Link
                href="/search"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 bg-white/5 text-[#C4B39A] font-jakarta text-xs py-3 px-4 rounded border border-white/8 hover:border-honey-700 transition-colors"
              >
                <Search size={13} className="text-honey-500" />
                <span>Search</span>
              </Link>
              <button
                onClick={handleCartClick}
                className="flex items-center justify-center gap-2 bg-white/5 text-[#C4B39A] font-jakarta text-xs py-3 px-4 rounded border border-white/8 hover:border-honey-700 transition-colors"
              >
                <ShoppingBag size={13} className="text-honey-500" />
                <span>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</span>
              </button>
            </div>

            {/* Main Links */}
            <ul className="flex flex-col gap-1 py-4 flex-1">
              {NAV_LINKS.map((link, idx) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + idx * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    className="font-clash font-bold text-[#FFFDF8] text-[1.75rem] leading-tight hover:text-honey-400 transition-colors flex items-center justify-between group py-2"
                    onClick={closeMobileMenu}
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={16} className="text-[#5C4A32] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Footer / Account */}
            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 mt-auto">
              <Link
                href="/account"
                className="flex items-center gap-2.5 text-[#8B7355] font-jakarta text-sm hover:text-[#F0E6D3] transition-colors"
                onClick={closeMobileMenu}
              >
                <User size={15} className="text-honey-500" />
                <span>Sign In / My Account</span>
              </Link>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[#8B7355] font-jakarta text-xs hover:text-[#F0E6D3] transition-colors"
              >
                <Instagram size={14} className="text-honey-500" />
                <span>Follow @sumosta</span>
              </a>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
