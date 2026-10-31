"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CheckoutAssurances from "@/components/checkout/CheckoutAssurances";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import MobileCheckoutBar from "@/components/checkout/MobileCheckoutBar";
import Notice from "@/components/checkout/Notice";
import PriceSummary from "@/components/checkout/PriceSummary";
import DesignYourOwnPromo from "@/features/catalog/DesignYourOwnPromo";
import { useCart } from "@/hooks/useCart";
import { wrap } from "../../app/(website)/Home/Components/ui";

import CartItem from "../../app/(website)/cart/Components/CartItem";
import CartSkeleton from "../../app/(website)/cart/Components/CartSkeleton";
import EmptyCart from "../../app/(website)/cart/Components/EmptyCart";

/**
 * Checkout step 1, the bag.
 *
 *   header     breadcrumb, "Step 1 of 3", title, stepper
 *   items      one card per line, notices above them
 *   summary    sticky on desktop; a pinned bar on phones
 *   empty      two ways forward, then the "design it yourself" promo
 */
export default function CartView() {
  const router = useRouter();
  const { items, totals, isLoading, isError, refetch, hasShopifyItems, hasDesignItems } = useCart();

  /* Ready-to-wear and custom designs pay through two separate checkouts, so
     say so here — before the customer has picked an address — rather than
     only when they press "Proceed". */
  const mixedCart = hasShopifyItems && hasDesignItems;
  const outOfStock = items.some((item) => item.availableForSale === false);
  const goToAddress = () => router.push("/shipping");
  const hasItems = !isLoading && items.length > 0;
  const isEmpty = !isLoading && !isError && items.length === 0;

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      {/* With items, the pinned bar covers the bottom on phones and tablets. */}
      <section className={`${wrap} ${hasItems ? "pb-32 lg:pb-24" : "pb-16 md:pb-24"}`}>
        <CheckoutHeader
          step={1}
          crumb="Shopping bag"
          title="Your"
          accent="bag"
          meta={
            isLoading ? (
              <span className="inline-block h-4 w-16 animate-pulse rounded bg-black/5 align-middle" />
            ) : totals.itemCount > 0 ? (
              `${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"}`
            ) : (
              "Nothing added yet"
            )
          }
        />

        {isError && (
          <Notice tone="error" className="mt-8">
            We couldn&apos;t load your bag.{" "}
            <button type="button" onClick={() => refetch()} className="font-semibold underline underline-offset-4">
              Try again
            </button>
          </Notice>
        )}

        {isLoading && <CartSkeleton />}

        {isEmpty && <EmptyCart />}

        {hasItems && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
            <div className="min-w-0 space-y-4">
              {mixedCart && (
                <Notice className="animate-slide-down">
                  Your bag has both <strong>ready-to-wear</strong> items and <strong>custom designs</strong>. They
                  check out separately, so remove one type to continue.
                </Notice>
              )}

              {outOfStock && (
                <Notice tone="error" className="animate-slide-down">
                  Some items are out of stock. Remove them to place your order.
                </Notice>
              )}

              <ul className="space-y-4">
                {items.map((item, index) => (
                  <CartItem key={`${item.source}-${item.id}`} item={item} index={index} />
                ))}
              </ul>

              <Link
                href="/products"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-secondary"
              >
                <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
                Continue shopping
              </Link>
            </div>

            <aside className="animate-rise-in [animation-delay:120ms] lg:sticky lg:top-6 lg:self-start">
              <PriceSummary
                totals={totals}
                buttonText="Continue to address"
                onAction={goToAddress}
                disabled={mixedCart}
              />
              <CheckoutAssurances />
            </aside>
          </div>
        )}
      </section>

      {isEmpty && <DesignYourOwnPromo />}

      {hasItems && (
        <MobileCheckoutBar
          total={totals.total}
          buttonText="Continue"
          onAction={goToAddress}
          disabled={mixedCart}
        />
      )}
    </main>
  );
}
