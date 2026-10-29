"use client";

/**
 * Checkout step 2 — pick a shipping address, then place the order.
 *
 * Addresses come from the same /addresses endpoints as the account section, so
 * one saved here appears there and vice versa. Placing the order sends the
 * chosen address id and lets the backend resolve, snapshot and price it.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, MapPin, Plus } from "lucide-react";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import MobileCheckoutBar from "@/components/checkout/MobileCheckoutBar";
import PriceSummary from "@/components/checkout/PriceSummary";
import { formatINR } from "@/lib/format";

import { useGetAddressesQuery } from "@/store/api/addressApi";
import { useStartDesignCheckoutMutation } from "@/store/api/orderApi";
import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/store/hooks";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { DEFAULT_COUNTRY_CODE, getAddressCountry } from "@/lib/addressCountries";
import { prepareShopifyCheckout } from "@/lib/shopifyAddress";
import { formatPhone } from "@/lib/phone";

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
    <main className="min-h-screen bg-[#F8F6EF]">
      <section className="container mx-auto px-4 py-8 pb-28 md:py-12 lg:pb-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/cart" className="mb-2 inline-flex items-center gap-1.5 text-sm text-[#777] transition-[gap] hover:gap-2.5 hover:text-[#972E47]">
              <ArrowLeft size={14} aria-hidden="true" />
              Back to bag
            </Link>
            <h1 className="text-3xl font-semibold md:text-4xl">Delivery Address</h1>
          </div>

          <CheckoutStepper step={2} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_380px] lg:gap-8">
          <div className="space-y-4">
            <CheckoutCard className="animate-rise-in overflow-hidden">
              <div className="border-b border-[#F2EEE8] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold">Where should we deliver?</h2>
                {!isLoading && !!addresses?.length && (
                  <p className="text-xs text-[#8A8A8A]">
                    {addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}
                  </p>
                )}
              </div>

              {isLoading && (
                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2" aria-busy="true" aria-label="Loading addresses">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-40 animate-pulse rounded-md border border-[#EFE8DD] bg-black/[0.03]" />
                  ))}
                </div>
              )}

              {!isLoading && !!addresses?.length && (
                <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2" role="radiogroup" aria-label="Delivery address">
                  {addresses.map((address, index) => {
                    const isSelected = activeId === address._id;
                    return (
                      <label
                        key={address._id}
                        style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                        className={`relative flex animate-rise-in cursor-pointer flex-col rounded-md border-2 p-4 transition-all duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#972E47]/30 ${
                          isSelected
                            ? "border-[#972E47] bg-[#FDF8F9] shadow-[0_8px_24px_-14px_rgba(151,46,71,0.5)]"
                            : "border-[#EFE8DD] bg-white hover:border-[#D9C3C9] hover:shadow-[0_6px_18px_-12px_rgba(34,34,34,0.3)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping-address"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedId(address._id);
                            setError(null);
                          }}
                          className="sr-only"
                        />

                        {/* Custom radio: a ring that fills with a check. */}
                        <span
                          className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                            isSelected ? "border-[#972E47] bg-[#972E47]" : "border-[#D9D3C8] bg-white"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <Check size={12} strokeWidth={3} className="animate-check-pop text-white" />}
                        </span>

                        <div className="flex flex-wrap items-center gap-2 pr-8">
                          <h3 className="font-semibold text-[#222]">{address.fullName}</h3>

                          <span className="rounded-full bg-[#F4F7F2] px-2.5 py-0.5 text-[11px] capitalize text-[#4B6B44]">
                            {address.type}
                          </span>

                          {address.isDefault && (
                            <span className="rounded-full bg-[#FBF6F7] px-2.5 py-0.5 text-[11px] text-[#972E47]">
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
                          {address.phone && <p className="pt-1 text-[#777]">Phone: {formatPhone(address.phone)}</p>}
                        </address>

                        {/* Grows open under the picked card. */}
                        <div
                          className={`grid transition-all duration-300 ${
                            isSelected ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <p className="flex items-center gap-1.5 overflow-hidden text-xs font-medium text-[#972E47]">
                            <MapPin size={13} aria-hidden="true" />
                            Delivering here
                          </p>
                        </div>
                      </label>
                    );
                  })}

                  {!showForm && (
                    <button
                      type="button"
                      onClick={() => setFormOpen(true)}
                      style={{ animationDelay: `${Math.min(addresses.length, 6) * 60}ms` }}
                      className="group flex min-h-40 animate-rise-in flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[#E0D6C8] p-4 text-sm font-medium text-[#972E47] transition-colors hover:border-[#972E47] hover:bg-[#FDF8F9]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBF6F7] transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
                        <Plus size={20} aria-hidden="true" />
                      </span>
                      Add a new address
                    </button>
                  )}
                </div>
              )}

              {!isLoading && showForm && (
                <div className={`animate-slide-down p-5 sm:p-6 ${addresses?.length ? "border-t border-[#F2EEE8]" : ""}`}>
                  <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                    <MapPin size={17} className="text-[#972E47]" aria-hidden="true" />
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
              <p key={errorKey} role="alert" className="flex animate-shake items-start gap-2 rounded-md border border-[#F0CFD6] bg-[#FBEAEA] px-4 py-3 text-sm text-[#972E47]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>

          <div className="animate-rise-in [animation-delay:120ms] lg:sticky lg:top-6 lg:self-start">
            <PriceSummary
              totals={totals}
              buttonText={buttonText}
              onAction={handlePlaceOrder}
              disabled={buttonDisabled}
            >
              {/* What's being delivered — so the customer never has to go back to check. */}
              {!cartLoading && items.length > 0 && (
                <ul className="max-h-56 space-y-3 overflow-y-auto border-b border-[#F2EEE8] px-5 py-4">
                  {items.map((item) => (
                    <li key={`${item.source}-${item.id}`} className="flex items-center gap-3">
                      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-[#F5F1EA]">
                        <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />
                        {item.quantity > 1 && (
                          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#222]/80 px-1 text-[10px] text-white">
                            {item.quantity}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-2 min-w-0 flex-1 text-[13px] text-[#444]">{item.title}</p>
                      <span className="shrink-0 text-[13px] font-medium text-[#222]">
                        {formatINR((item.unitPrice * item.quantity) / 100)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </PriceSummary>

            {selectedAddress && !showForm && (
              <div key={selectedAddress._id} className="mt-4 hidden animate-fade-in rounded-md border border-[#EFE8DD] bg-white p-4 text-sm lg:block">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A8A8A]">Delivering to</p>
                <p className="mt-1 font-medium text-[#222]">{selectedAddress.fullName}</p>
                <p className="text-[#666]">
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                </p>
              </div>
            )}

            <DeliveryBanner />
          </div>
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
