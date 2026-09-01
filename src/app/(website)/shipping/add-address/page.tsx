import type { Metadata } from "next";
import AddAddressView from "@/features/checkout/AddAddressView";

export const metadata: Metadata = {
  title: "Add Address | Baliye Couture",
};

export default function AddAddressPage() {
  return <AddAddressView />;
}
