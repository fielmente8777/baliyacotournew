"use client";

/**
 * Checkout step 2 — pick a shipping address, then place the order.
 *
 * Addresses come from the same /addresses endpoints as the account section, so
 * one saved here appears there and vice versa. Placing the order sends the
 * chosen address id and lets the backend resolve, snapshot and price it.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import PriceSummary from "@/components/checkout/PriceSummary";
import PrimaryButton from "@/components/checkout/PrimaryButton";

import { useGetAddressesQuery } from "@/store/api/addressApi";
import { usePlaceOrderMutation } from "@/store/api/orderApi";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { DEFAULT_COUNTRY_CODE, getAddressCountry } from "@/lib/addressCountries";
import { prepareShopifyCheckout } from "@/lib/shopifyAddress";

export default function ShippingView() {
  const router = useRouter();
  const {
    totals,
    isLoading: cartLoading,
    checkoutUrl,
    hasShopifyItems,
    hasDesignItems,
  } = useCart();
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();
  /* Prefills Shopify checkout's Contact step. The live profile comes first:
     s.auth.user is a copy saved to localStorage at sign-in, so it can be
     stale or email-less (e.g. a session from before the profile had one). */
  const { data: profile } = useGetProfileQuery();
  const sessionEmail = useAppSelector((s) => s.auth.user?.email);
  const email = profile?.email || sessionEmail || undefined;

  /* Only the customer's explicit pick is state. Until they pick one, the
     selection is derived from the addresses list below — no effect needed. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    /* Design-only cart: unchanged, still baliye-node's own order flow. */
    try {
      const order = await placeOrder({ shippingAddressId: selectedAddress._id }).unwrap();
      router.push(`/order-success?order=${order._id}`);
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      /* The backend rejects an order with no measurements — say which. */
      setError(message ?? "We couldn't place your order. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F6EF]">
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-semibold">My Cart</h1>

        <p className="mt-2 text-[#777]">
          {cartLoading ? "Loading…" : `${totals.itemCount} Items`}
        </p>

        <div className="mt-8">
          <CheckoutStepper step={2} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_380px]">
          <CheckoutCard>
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-2xl font-semibold">Saved Addresses</h2>

              <Link href="/shipping/add-address">
                <PrimaryButton fullWidth={false} className="px-8">
                  Add New Address
                </PrimaryButton>
              </Link>
            </div>

            <div className="divide-y">
              {isLoading && <p className="p-6 text-[#777]">Loading addresses…</p>}

              {!isLoading && addresses?.length === 0 && (
                <div className="p-6">
                  <p className="text-[#777]">
                    You have no saved addresses yet.
                  </p>
                  <Link
                    href="/shipping/add-address"
                    className="mt-3 inline-block font-medium text-[#972E47]"
                  >
                    Add one to continue
                  </Link>
                </div>
              )}

              {addresses?.map((address) => (
                <label
                  key={address._id}
                  className="flex cursor-pointer gap-4 p-6"
                >
                  <input
                    type="radio"
                    name="shipping-address"
                    checked={activeId === address._id}
                    onChange={() => setSelectedId(address._id)}
                    className="mt-1 h-4 w-4 accent-[#972E47]"
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold">{address.fullName}</h3>

                      <span className="rounded-full bg-[#F4F7F2] px-2.5 py-0.5 text-xs capitalize text-[#4B6B44]">
                        {address.type}
                      </span>

                      {address.isDefault && (
                        <span className="rounded-full bg-[#FBF6F7] px-2.5 py-0.5 text-xs text-[#972E47]">
                          Default
                        </span>
                      )}
                    </div>

                    <address className="mt-2 space-y-0.5 text-sm not-italic leading-relaxed text-[#5C5C5C]">
                      <p>{address.street}</p>
                      {address.landmark && <p>{address.landmark}</p>}
                      <p>
                        {address.city}, {address.state} {address.pincode}
                      </p>
                      {address.country && address.country !== DEFAULT_COUNTRY_CODE && (
                        <p>{getAddressCountry(address.country).name}</p>
                      )}
                      {address.phone && <p>{address.phone}</p>}
                    </address>
                  </div>
                </label>
              ))}
            </div>
          </CheckoutCard>

          <div>
            <PriceSummary
              totals={totals}
              buttonText={
                isRedirecting
                  ? "Taking you to checkout…"
                  : isPlacing
                    ? "Placing order…"
                    : "Proceed To Buy"
              }
              onAction={handlePlaceOrder}
              disabled={isPlacing || isRedirecting || !activeId}
            />

            {error && (
              <p className="mt-3 text-sm text-[#972E47]">{error}</p>
            )}

            <DeliveryBanner />
          </div>
        </div>
      </section>
    </main>
  );
}