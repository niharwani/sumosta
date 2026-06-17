'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount);
  const openCart = useCartStore((s) => s.openCart);
  const { openMobileMenu } = useUIStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-cream/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent',
      )}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="font-clash text-charcoal font-bold text-xl shrink-0">
          SUMOSTA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-satoshi text-bark text-sm hover:text-charcoal transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-honey-400 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            className="text-bark hover:text-charcoal transition-colors hidden sm:block"
          >
            <Search size={20} />
          </button>

          <Link
            href={isAuthenticated ? '/account/orders' : '/auth/login'}
            aria-label="Account"
            className="text-bark hover:text-charcoal transition-colors hidden sm:block"
          >
            <User size={20} />
          </Link>

          <button
            aria-label={`Cart (${itemCount} items)`}
            onClick={openCart}
            className="relative text-bark hover:text-charcoal transition-colors"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-honey-400 text-midnight text-[9px] font-bold font-satoshi min-w-[16px] h-4 rounded-full flex items-center justify-center px-0.5"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </motion.span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label="Open menu"
            onClick={openMobileMenu}
            className="text-bark hover:text-charcoal transition-colors lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
