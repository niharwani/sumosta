import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader  from '@/components/admin/AdminHeader';

export const metadata = { title: { default: 'Admin', template: '%s | SUMOSTA Admin' } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
