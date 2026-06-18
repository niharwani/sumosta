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
      {/* pt accounts for fixed announcement bar (h-10 = 2.5rem) + fixed navbar (h-16 = 4rem) */}
      <main className="pt-[6.5rem]">{children}</main>
      <Footer />
    </>
  );
}
