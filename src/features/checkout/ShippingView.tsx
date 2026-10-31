"use client";

/**
 * Checkout step 2 — pick a shipping address, then place the order.
 *
 * Addresses come from the same /addresses endpoints as the account section, so
 * one saved here appears there and vice versa. Placing the order sends the
 * chosen address id and lets the backend resolve, snapshot and price it.
 *
 *   header     breadcrumb, "Step 2 of 3", title, stepper
 *   address    saved addresses as radio cards, or the new-address form
 *   payment    shown as what comes next (Shopify's checkout)
 *   summary    items, figures and the button; sticky on desktop, a bar on phones
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import CheckoutAssurances from "@/components/checkout/CheckoutAssurances";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import MobileCheckoutBar from "@/components/checkout/MobileCheckoutBar";
import Notice from "@/components/checkout/Notice";
import PriceSummary from "@/components/checkout/PriceSummary";

import { useGetAddressesQuery } from "@/store/api/addressApi";
import { useStartDesignCheckoutMutation } from "@/store/api/orderApi";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { prepareShopifyCheckout } from "@/lib/shopifyAddress";

import { wrap } from "../../app/(website)/Home/Components/ui";
import AddAddressTile from "../../app/(website)/shipping/Components/AddAddressTile";
import AddressCard, { AddressCardSkeleton } from "../../app/(website)/shipping/Components/AddressCard";
import DeliveringTo from "../../app/(website)/shipping/Components/DeliveringTo";
import OrderItems from "../../app/(website)/shipping/Components/OrderItems";
import PaymentNext from "../../app/(website)/shipping/Components/PaymentNext";
import AddressForm from "./AddressForm";

export default function ShippingView() {
  const router = useRouter();
  const {
    items,
    totals,
    isLoading: cartLoading,
    checkoutUrl,
    hasShopifyItems,
    hasDesignItems,
  } = useCart();
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [startDesignCheckout, { isLoading: isPlacing }] = useStartDesignCheckoutMutation();
  /* Prefills Shopify checkout's Contact step. The live profile comes first:
     s.auth.user is a copy saved to localStorage at sign-in, so it can be
     stale or email-less (e.g. a session from before the profile had one). */
  const { data: profile } = useGetProfileQuery();
  const sessionEmail = useAppSelector((s) => s.auth.user?.email);
  const email = profile?.email || sessionEmail || undefined;

  /* Only the customer's explicit pick is state. Until they pick one, the
     selection is derived from the addresses list below — no effect needed. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setErrorText] = useState<string | null>(null);
  /* Bumped with each error so the message shakes again on a repeat attempt. */
  const [errorKey, setErrorKey] = useState(0);
  const setError = (message: string | null) => {
    setErrorText(message);
    if (message) setErrorKey((k) => k + 1);
  };
  /* The new-address form opens inline; with no saved addresses it starts open. */
  const [formOpen, setFormOpen] = useState(false);
  const showForm = formOpen || addresses?.length === 0;
  /* Stays true through the redirect — the page is unloading, so there's
     nothing to reset it for, and it stops a double-click firing twice. */
  const [isRedirecting, setIsRedirecting] = useState(false);

  /** The address actually in use: the customer's pick if it still exists
      (it may have been deleted in another tab), else the default, else the
      first one — so a single-address customer can just continue. */
  const selectedAddress =
    addresses?.find((a) => a._id === selectedId) ??
    addresses?.find((a) => a.isDefault) ??
    addresses?.[0] ??
    null;
  const activeId = selectedAddress?._id ?? null;

  const mixedCart = hasShopifyItems && hasDesignItems;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return setError("Please select a delivery address.");

    /* Shopify's hosted checkout and baliye-node's own order flow are two
       separate systems that can't be paid for in one action — a cart with
       both a Shopify product and a custom design has no single checkout
       to send the customer to. Simplest resolution for now: ask them to
       check out one kind at a time rather than silently picking one and
       dropping the other. */
    if (mixedCart) {
      return setError(
        "Your cart has both ready-to-wear items and custom designs — please check out one type at a time. Remove one to continue."
      );
    }

    setError(null);

    /* Ready-to-wear (Shopify) items: baliye-node's placeOrder doesn't know
       about Shopify's cart at all — Shopify's own checkout takes payment
       and completes the order on Shopify's side. The address picked above
       is copied onto the Shopify cart first (lib/shopifyAddress.ts) so
       checkout opens prefilled; if that copy fails, checkout still opens
       and simply asks for the address again. */
    if (hasShopifyItems) {
      setIsRedirecting(true);
      try {
        const url = await prepareShopifyCheckout(selectedAddress, checkoutUrl, {
          email,
        });
        window.location.href = url;
      } catch {
        setIsRedirecting(false);
        setError("Your cart couldn't be prepared for checkout. Please try again.");
      }
      return;
    }

    /* Design-only cart: paid on Shopify too. The backend turns the designs
       into a Shopify draft order (priced server-side) and returns its
       checkout; paying there creates the order in Shopify. */
    setIsRedirecting(true);
    try {
      const { checkoutUrl: designCheckoutUrl } = await startDesignCheckout({
        shippingAddressId: selectedAddress._id,
      }).unwrap();
      window.location.href = designCheckoutUrl;
    } catch (err) {
      setIsRedirecting(false);
      const message = (err as { data?: { message?: string } }).data?.message;
      /* The backend rejects a design with no measurements — say which. */
      setError(message ?? "We couldn't start checkout. Please try again.");
    }
  };

  const buttonText = isRedirecting
    ? "Taking you to payment…"
    : isPlacing
      ? "Placing order…"
      : "Continue to Payment";
  const buttonDisabled = isPlacing || isRedirecting || !activeId || showForm;

  return (
    <main className="min-h-screen bg-[#FAF7F2]">
      <section className={`${wrap} pb-32 lg:pb-24`}>
        <CheckoutHeader
          step={2}
          crumb="Delivery address"
          trail={[{ label: "Shopping bag", href: "/cart" }]}
          title="Where should we"
          accent="deliver?"
          meta={
            <Link href="/cart" className="group inline-flex min-h-11 items-center gap-2 font-medium text-secondary">
              <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
              Back to bag
            </Link>
          }
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
          <div className="min-w-0 space-y-4">
            <CheckoutCard
              className="animate-rise-in overflow-hidden"
              title="Delivery address"
              subtitle={
                !isLoading && !!addresses?.length
                  ? `${addresses.length} saved ${addresses.length === 1 ? "address" : "addresses"}`
                  : "Saved to your account for next time"
              }
            >
              {isLoading && (
                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2" aria-busy="true" aria-label="Loading addresses">
                  <AddressCardSkeleton />
                  <AddressCardSkeleton />
                </div>
              )}

              {!isLoading && !!addresses?.length && (
                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2" role="radiogroup" aria-label="Delivery address">
                  {addresses.map((address, index) => (
                    <AddressCard
                      key={address._id}
                      address={address}
                      index={index}
                      selected={activeId === address._id}
                      onSelect={() => {
                        setSelectedId(address._id);
                        setError(null);
                      }}
                    />
                  ))}

                  {!showForm && <AddAddressTile onClick={() => setFormOpen(true)} index={addresses.length} />}
                </div>
              )}

              {!isLoading && showForm && (
                <div className={`animate-slide-down p-5 sm:p-6 ${addresses?.length ? "border-t border-[#F1EBE2]" : ""}`}>
                  <h3 className="mb-5 flex items-center gap-2.5 text-base font-semibold text-dark">
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary">
                      <MapPin size={15} aria-hidden="true" />
                    </span>
                    {addresses?.length ? "Add a new address" : "Add your delivery address"}
                  </h3>
                  <AddressForm
                    saveLabel="Save & Deliver Here"
                    onSaved={(address) => {
                      setSelectedId(address._id);
                      setFormOpen(false);
                      setError(null);
                    }}
                    onCancel={() => (addresses?.length ? setFormOpen(false) : router.push("/cart"))}
                  />
                </div>
              )}
            </CheckoutCard>

            {error && (
              <Notice key={errorKey} tone="error" role="alert" className="animate-shake">
                {error}
              </Notice>
            )}

            <PaymentNext />
          </div>

          <aside className="animate-rise-in [animation-delay:120ms] lg:sticky lg:top-6 lg:self-start">
            <PriceSummary
              totals={totals}
              buttonText={buttonText}
              onAction={handlePlaceOrder}
              disabled={buttonDisabled}
            >
              {!cartLoading && <OrderItems items={items} />}
            </PriceSummary>

            {selectedAddress && !showForm && <DeliveringTo address={selectedAddress} />}

            <CheckoutAssurances />
          </aside>
        </div>
      </section>

      <MobileCheckoutBar
        total={totals.total}
        buttonText={showForm ? "Save the address first" : buttonText}
        onAction={handlePlaceOrder}
        disabled={buttonDisabled}
      />
    </main>
  );
}
