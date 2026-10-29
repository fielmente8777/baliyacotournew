"use client";

/**
 * Checkout — add a delivery address on its own page. /shipping now opens the
 * same form inline, so this page mostly serves old links and bookmarks. On
 * success it returns to /shipping where the new address is selectable.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import PriceSummary from "@/components/checkout/PriceSummary";
import { useCart } from "@/hooks/useCart";

import AddressForm from "./AddressForm";

export default function AddAddressView() {
  const router = useRouter();
  const { totals } = useCart();

  return (
    <main className="min-h-screen bg-[#F8F6EF]">
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/shipping" className="mb-2 inline-flex items-center gap-1.5 text-sm text-[#777] hover:text-[#972E47]">
              <ArrowLeft size={14} aria-hidden="true" />
              Back to addresses
            </Link>
            <h1 className="text-3xl font-semibold md:text-4xl">Delivery Address</h1>
          </div>
          <CheckoutStepper step={2} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_380px] lg:gap-8">
          <CheckoutCard className="animate-rise-in">
            <div className="border-b border-[#F2EEE8] px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold">Add New Address</h2>
            </div>
            <div className="p-5 sm:p-6">
              <AddressForm onSaved={() => router.push("/shipping")} onCancel={() => router.push("/shipping")} />
            </div>
          </CheckoutCard>

          <div className="animate-rise-in [animation-delay:120ms] lg:sticky lg:top-6 lg:self-start">
            <PriceSummary totals={totals} />
            <DeliveryBanner />
          </div>
        </div>
      </section>
    </main>
  );
}
