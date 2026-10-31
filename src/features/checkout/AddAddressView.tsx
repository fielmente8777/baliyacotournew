"use client";

/**
 * Checkout — add a delivery address on its own page. /shipping now opens the
 * same form inline, so this page mostly serves old links and bookmarks. On
 * success it returns to /shipping where the new address is selectable.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CheckoutAssurances from "@/components/checkout/CheckoutAssurances";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import PriceSummary from "@/components/checkout/PriceSummary";
import { useCart } from "@/hooks/useCart";

import { wrap } from "../../app/(website)/Home/Components/ui";
import AddressForm from "./AddressForm";

export default function AddAddressView() {
  const router = useRouter();
  const { totals } = useCart();

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className={`${wrap} pb-16 md:pb-24`}>
        <CheckoutHeader
          step={2}
          crumb="New address"
          trail={[
            { label: "Shopping bag", href: "/cart" },
            { label: "Delivery address", href: "/shipping" },
          ]}
          title="Add a new"
          accent="address"
          meta={
            <Link href="/shipping" className="group inline-flex min-h-11 items-center gap-2 font-medium text-secondary">
              <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
              Back to addresses
            </Link>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <CheckoutCard className="animate-rise-in" title="Delivery address" subtitle="Saved to your account for next time">
            <div className="p-5 sm:p-6">
              <AddressForm onSaved={() => router.push("/shipping")} onCancel={() => router.push("/shipping")} />
            </div>
          </CheckoutCard>

          <aside className="animate-rise-in [animation-delay:120ms] lg:sticky lg:top-6 lg:self-start">
            <PriceSummary totals={totals} />
            <CheckoutAssurances />
          </aside>
        </div>
      </section>
    </main>
  );
}
