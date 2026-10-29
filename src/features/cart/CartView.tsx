"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import EmptyState from "@/components/EmptyState";
import { EmptyBagIllustration } from "@/components/illustrations";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import MobileCheckoutBar from "@/components/checkout/MobileCheckoutBar";
import PriceSummary from "@/components/checkout/PriceSummary";
import { useCart } from "@/hooks/useCart";

import CartItem from "../../app/(website)/cart/Components/CartItem";

export default function CartView() {
  const router = useRouter();
  const { items, totals, isLoading, isError, refetch, hasShopifyItems, hasDesignItems } = useCart();

  /* Ready-to-wear and custom designs pay through two separate checkouts, so
     say so here — before the customer has picked an address — rather than
     only when they press "Proceed". */
  const mixedCart = hasShopifyItems && hasDesignItems;
  const outOfStock = items.some((item) => item.availableForSale === false);
  const goToAddress = () => router.push("/shipping");

  return (
    <main className="min-h-screen bg-[#F8F6EF]">
      <section className={`container mx-auto px-4 py-8 md:py-12 ${items.length > 0 ? "pb-28 lg:pb-12" : ""}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Shopping Bag</h1>
            <p className="mt-1.5 text-sm text-[#777]">
              {isLoading ? (
                <span className="inline-block h-4 w-16 animate-pulse rounded bg-black/5 align-middle" />
              ) : (
                `${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"}`
              )}
            </p>
          </div>

          <CheckoutStepper step={1} />
        </div>

        {isError && (
          <div className="mt-8 animate-fade-in rounded-md border border-[#EFE8DD] bg-white p-8 text-center">
            <p className="text-[#972E47]">We couldn&apos;t load your bag.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-[#972E47] underline"
            >
              Try again
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_380px]" aria-busy="true" aria-label="Loading your bag">
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex animate-pulse gap-4 rounded-md border border-[#EFE8DD] bg-white p-4">
                  <div className="h-[124px] w-[96px] rounded bg-black/5 sm:h-[150px] sm:w-[120px]" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 w-2/3 rounded bg-black/5" />
                    <div className="h-3 w-1/4 rounded bg-black/5" />
                    <div className="h-8 w-28 rounded bg-black/5" />
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden h-64 animate-pulse rounded-md border border-[#EFE8DD] bg-white lg:block" />
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="mt-8 animate-rise-in rounded-md border border-[#EFE8DD] bg-white">
            <EmptyState
              illustration={<EmptyBagIllustration />}
              title="Your bag is empty"
              message="Pick a ready-made design, or create one that's entirely yours."
              action={{ label: "Shop designs", href: "/products" }}
            />
            <p className="-mt-6 pb-10 text-center text-sm">
              <Link href="/create-your-own-design" className="font-medium text-[#972E47] hover:underline">
                or start designing
              </Link>
            </p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_380px] lg:gap-8">
            <div className="space-y-4">
              {mixedCart && (
                <div className="flex animate-slide-down gap-3 rounded-md border border-[#F1D9A8] bg-[#FDF7EA] p-4 text-sm text-[#7A5A1E]">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p>
                    Your bag has both <strong>ready-to-wear</strong> items and <strong>custom designs</strong>. They
                    check out separately — remove one type to continue.
                  </p>
                </div>
              )}

              {outOfStock && (
                <div className="flex animate-slide-down gap-3 rounded-md border border-[#F0CFD6] bg-[#FBEAEA] p-4 text-sm text-[#972E47]">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p>Some items are out of stock. Remove them to place your order.</p>
                </div>
              )}

              {items.map((item, index) => (
                <CartItem key={`${item.source}-${item.id}`} item={item} index={index} />
              ))}

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-[#972E47] transition-[gap] hover:gap-2.5"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Continue shopping
              </Link>
            </div>

            <div className="animate-rise-in [animation-delay:120ms] lg:sticky lg:top-6 lg:self-start">
              <PriceSummary
                totals={totals}
                buttonText="Place Order"
                onAction={goToAddress}
                disabled={mixedCart}
              />

              <DeliveryBanner />
            </div>
          </div>
        )}
      </section>

      {!isLoading && items.length > 0 && (
        <MobileCheckoutBar
          total={totals.total}
          buttonText="Place Order"
          onAction={goToAddress}
          disabled={mixedCart}
        />
      )}
    </main>
  );
}
