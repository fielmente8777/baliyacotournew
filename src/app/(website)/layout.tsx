import Navbar from "@/components/navbar/NavBar";
import Footer from "@/components/footer/Footer";

/**
 * The storefront chrome. Lives here rather than in the root layout so the
 * admin panel (app/admin) renders without the shop's navbar and footer.
 */
export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
