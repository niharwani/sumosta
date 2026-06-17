import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import CartDrawer from '@/components/layout/CartDrawer';
import MobileMenu from '@/components/layout/MobileMenu';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <MobileMenu />
      <CartDrawer />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
