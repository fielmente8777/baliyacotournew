import type { Metadata } from "next";
import CartView from "@/features/cart/CartView";

export const metadata: Metadata = {
  title: "My Cart | Baliye Couture",
};

export default function CartPage() {
  return <CartView />;
}
