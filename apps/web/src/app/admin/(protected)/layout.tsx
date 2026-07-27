import AdminSidebar   from '@/components/admin/AdminSidebar';
import AdminHeader    from '@/components/admin/AdminHeader';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-white flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
