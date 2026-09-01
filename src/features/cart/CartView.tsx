"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import PriceSummary from "@/components/checkout/PriceSummary";
import { useCart } from "@/hooks/useCart";

import CartItem from "../../app/(website)/cart/Components/CartItem";

export default function CartView() {
  const router = useRouter();
  const { items, totals, isLoading, isError, refetch } = useCart();

  return (
    <main className="min-h-screen bg-[#F8F6EF]">
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-semibold">My Cart</h1>

        <p className="mt-2 text-[#777]">
          {isLoading ? "Loading…" : `${totals.itemCount} Items`}
        </p>

        <div className="mt-8">
          <CheckoutStepper step={1} />
        </div>

        {isError && (
          <div className="mt-10 rounded bg-white p-8 text-center">
            <p className="text-[#972E47]">We couldn&apos;t load your cart.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-[#972E47] underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="mt-10 rounded bg-white p-12 text-center">
            <p className="text-lg text-[#555]">Your cart is empty.</p>
            <Link
              href="/create-your-own-design"
              className="mt-4 inline-block font-medium text-[#972E47]"
            >
              Start designing
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_380px]">
            <div className="space-y-6">
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            <div>
              <PriceSummary
                totals={totals}
                buttonText="Continue"
                onAction={() => router.push("/shipping")}
              />

              <DeliveryBanner />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
