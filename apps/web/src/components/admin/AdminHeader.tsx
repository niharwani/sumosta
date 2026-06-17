'use client';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
  '/admin':           'Dashboard',
  '/admin/orders':    'Orders',
  '/admin/products':  'Products',
  '/admin/customers': 'Customers',
  '/admin/analytics': 'Analytics',
  '/admin/coupons':   'Coupons',
  '/admin/reviews':   'Reviews',
  '/admin/media':     'Media',
  '/admin/settings':  'Settings',
};

export default function AdminHeader() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? 'Admin';

  return (
    <header className="h-14 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="font-satoshi text-gray-800 font-semibold text-base">{label}</h1>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-honey-400 flex items-center justify-center">
          <span className="text-midnight text-xs font-satoshi font-bold">A</span>
        </div>
      </div>
    </header>
  );
}
