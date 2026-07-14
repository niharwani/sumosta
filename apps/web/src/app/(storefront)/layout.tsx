import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import MobileMenu from '@/components/layout/MobileMenu';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <MobileMenu />
      {/* pt accounts for fixed announcement bar (h-10 = 2.5rem) + fixed navbar (h-16 = 4rem) */}
      <main className="pt-[6.5rem]">{children}</main>
      <Footer />
    </>
  );
}
