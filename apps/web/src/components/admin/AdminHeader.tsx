'use client';
import { Bell, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const LABELS: Record<string, string> = {
  '/admin':            'Dashboard',
  '/admin/orders':     'Orders',
  '/admin/products':   'Products',
  '/admin/customers':  'Customers',
  '/admin/analytics':  'Analytics',
  '/admin/coupons':    'Coupons',
  '/admin/reviews':    'Reviews',
  '/admin/media':      'Media',
  '/admin/settings':   'Settings',
};

function getLabel(pathname: string): string {
  // Longest prefix match so /admin/orders/123 → "Orders"
  const match = Object.keys(LABELS)
    .filter((p) => pathname === p || (p !== '/admin' && pathname.startsWith(p + '/')))
    .sort((a, b) => b.length - a.length)[0];
  return match ? LABELS[match] : 'Dashboard';
}

export default function AdminHeader() {
  const pathname = usePathname();
  const label = getLabel(pathname);
  const isNested = pathname.split('/').length > 3;

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Link href="/admin" className="font-satoshi text-gray-400 text-sm hover:text-gray-600 transition-colors shrink-0">
          Admin
        </Link>
        {label !== 'Dashboard' && (
          <>
            <ChevronRight size={13} className="text-gray-300 shrink-0" />
            <span className="font-satoshi text-gray-800 font-semibold text-sm truncate">{label}</span>
          </>
        )}
        {isNested && (
          <>
            <ChevronRight size={13} className="text-gray-300 shrink-0" />
            <span className="font-satoshi text-gray-500 text-sm truncate">
              {pathname.split('/').pop()}
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
          <div className="w-7 h-7 rounded-full bg-honey-400 flex items-center justify-center shrink-0">
            <span className="text-midnight text-xs font-satoshi font-bold">A</span>
          </div>
          <span className="font-satoshi text-gray-700 text-sm font-medium hidden sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
