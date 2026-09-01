"use client";

/**
 * Checkout step 2 — pick a shipping address, then place the order.
 *
 * Addresses come from the same /addresses endpoints as the account section, so
 * one saved here appears there and vice versa. Placing the order sends the
 * chosen address id and lets the backend resolve, snapshot and price it.
 */

import { useEffect, useState } from "react";
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

export default function ShippingView() {
  const router = useRouter();
  const { totals, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Preselect the default so a single-address customer can just continue. */
  useEffect(() => {
    if (selectedId || !addresses?.length) return;
    setSelectedId((addresses.find((a) => a.isDefault) ?? addresses[0])._id);
  }, [addresses, selectedId]);

  const handlePlaceOrder = async () => {
    if (!selectedId) return setError("Please select a delivery address.");

    setError(null);

    try {
      const order = await placeOrder({ shippingAddressId: selectedId }).unwrap();
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
                    checked={selectedId === address._id}
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
              buttonText={isPlacing ? "Placing order…" : "Proceed To Buy"}
              onAction={handlePlaceOrder}
              disabled={isPlacing || !selectedId}
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
