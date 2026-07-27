import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MobileMenu from '@/components/layout/MobileMenu';
import CartDrawer from '@/components/layout/CartDrawer';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar />
        <Navbar />
      </header>
      <MobileMenu />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}
