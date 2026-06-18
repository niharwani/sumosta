'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag, Star,
  BarChart2, Image as ImageIcon, Settings, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Store',
    items: [
      { href: '/admin',           label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders',    label: 'Orders',    icon: ShoppingBag },
      { href: '/admin/products',  label: 'Products',  icon: Package },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/coupons',   label: 'Coupons',   icon: Tag },
      { href: '/admin/reviews',   label: 'Reviews',   icon: Star },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
      { href: '/admin/media',     label: 'Media',     icon: ImageIcon },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));

  return (
    <aside className="hidden lg:flex w-56 bg-midnight flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <Link href="/" className="font-satoshi text-cream font-bold text-sm tracking-widest hover:text-honey-300 transition-colors">
          SUMOSTA
        </Link>
        <p className="font-satoshi text-earth/60 text-[10px] mt-0.5 tracking-wider">Admin Panel</p>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-5 mb-1 font-satoshi text-[9px] uppercase tracking-[0.18em] text-earth/40">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-5 py-2 font-satoshi text-xs transition-colors relative',
                    active
                      ? 'text-cream bg-white/[0.07]'
                      : 'text-earth-light hover:text-cream hover:bg-white/[0.04]',
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-honey-400 rounded-r" />
                  )}
                  <Icon size={14} className={active ? 'text-honey-400' : ''} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Settings + logout */}
      <div className="border-t border-white/[0.06] py-2">
        <Link
          href="/admin/settings"
          className={cn(
            'flex items-center gap-2.5 px-5 py-2 font-satoshi text-xs transition-colors',
            isActive('/admin/settings') ? 'text-cream' : 'text-earth-light hover:text-cream',
          )}
        >
          <Settings size={14} /> Settings
        </Link>
        <Link
          href="/auth/login"
          className="flex items-center gap-2.5 px-5 py-2 font-satoshi text-xs text-earth-light hover:text-cream transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </Link>
      </div>
    </aside>
  );
}
