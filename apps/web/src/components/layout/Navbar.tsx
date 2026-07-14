'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { useUIStore } from '@/stores/ui-store';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { openMobileMenu, announcementVisible } = useUIStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => {
    const normPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const normHref = href.endsWith('/') ? href.slice(0, -1) : href;
    if (normHref === '/shop') {
      return normPath.startsWith('/shop') || normPath.startsWith('/product');
    }
    return normPath === normHref;
  };

  return (
    <motion.header
      className={cn(
        'fixed inset-x-0 z-40 transition-all duration-300',
        announcementVisible ? 'top-10' : 'top-0',
        scrolled ? 'bg-cream/95 backdrop-blur-sm shadow-sm' : 'bg-transparent',
      )}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-content mx-auto px-6 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="font-clash text-charcoal font-bold text-xl shrink-0 hover:text-honey-500 transition-colors">
          SUMOSTA
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-satoshi text-sm transition-colors relative group pb-0.5',
                  active ? 'text-charcoal' : 'text-bark hover:text-charcoal',
                )}
              >
                {link.label}
                <span className={cn(
                  'absolute -bottom-0.5 left-0 h-px bg-honey-400 transition-all duration-300',
                  active ? 'w-full' : 'w-0 group-hover:w-full',
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            aria-label="Search"
            className="text-bark hover:text-charcoal transition-colors hidden sm:block"
          >
            <Search size={20} />
          </Link>



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
