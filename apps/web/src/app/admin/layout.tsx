export const metadata = { title: { default: 'Admin', template: '%s | SUMOSTA Admin' } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
