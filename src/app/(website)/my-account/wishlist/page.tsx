import type { Metadata } from "next";
import WishlistView from "@/features/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist | Baliye Couture",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistView />;
}
