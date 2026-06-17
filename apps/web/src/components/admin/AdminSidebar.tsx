'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag, Star,
  BarChart2, Image as ImageIcon, Settings, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { href: '/admin/products',   label: 'Products',   icon: Package },
  { href: '/admin/customers',  label: 'Customers',  icon: Users },
  { href: '/admin/analytics',  label: 'Analytics',  icon: BarChart2 },
  { href: '/admin/coupons',    label: 'Coupons',    icon: Tag },
  { href: '/admin/reviews',    label: 'Reviews',    icon: Star },
  { href: '/admin/media',      label: 'Media',      icon: ImageIcon },
  { href: '/admin/settings',   label: 'Settings',   icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-56 bg-midnight flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-earth/20">
        <span className="font-satoshi text-cream font-bold text-base tracking-wide">SUMOSTA Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-6 py-2.5 font-satoshi text-sm transition-colors relative',
                active
                  ? 'text-cream bg-white/5'
                  : 'text-earth-light hover:text-cream hover:bg-white/5',
              )}
            >
              {active && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-honey-400" />}
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-earth/20">
        <Link href="/auth/login" className="flex items-center gap-3 text-earth-light hover:text-cream transition-colors font-satoshi text-sm px-2 py-2">
          <LogOut size={16} /> Sign Out
        </Link>
      </div>
    </aside>
  );
}
