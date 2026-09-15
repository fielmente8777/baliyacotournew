import type { Metadata } from "next";
import ShippingView from "@/features/checkout/ShippingView";

export const metadata: Metadata = {
  title: "Shipping | Baliye Couture",
};

export default function ShippingPage() {
  return <ShippingView />;
}
