"use client";

/**
 * Checkout — add a delivery address mid-flow.
 *
 * Posts to the same /addresses endpoint as the account section rather than
 * keeping a second, divergent address form. On success it returns to /shipping
 * where the new address is already selectable.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import PriceSummary from "@/components/checkout/PriceSummary";
import PrimaryButton from "@/components/checkout/PrimaryButton";
import SecondaryButton from "@/components/checkout/SecondaryButton";
import PhoneField from "@/components/inputs/PhoneField";
import {
  CountrySelect,
  PostalField,
  StateField,
  regionResetFor,
  validateRegion,
} from "@/components/inputs/AddressRegionFields";

import { useCreateAddressMutation } from "@/store/api/addressApi";
import { useCart } from "@/hooks/useCart";
import { DEFAULT_COUNTRY_CODE } from "@/lib/addressCountries";
import type { AddressType as AddressTypeValue } from "@/@types/account";

import AddressType from "../../app/(website)/shipping/add-address/Components/AddressType";

const emptyForm = {
  fullName: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  country: DEFAULT_COUNTRY_CODE,
  phone: "",
  type: "home" as AddressTypeValue,
};

export default function AddAddressView() {
  const router = useRouter();
  const { totals } = useCart();
  const [createAddress, { isLoading }] = useCreateAddressMutation();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (form.fullName.trim().length < 2) return setError("Please enter a full name.");
    if (form.street.trim().length < 3) return setError("Please enter a street address.");
    if (!form.city.trim()) return setError("Please enter a city.");
    const regionError = validateRegion(form.country, form.state, form.pincode);
    if (regionError) return setError(regionError);

    setError(null);

    try {
      await createAddress({
        fullName: form.fullName.trim(),
        street: form.street.trim(),
        landmark: form.landmark.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        country: form.country,
        phone: form.phone.trim() || undefined,
        type: form.type,
      }).unwrap();

      router.push("/shipping");
    } catch {
      setError("We couldn't save this address. Please try again.");
    }
  };

  const inputClass =
    "h-12 w-full rounded-md border border-[#E4E0D8] px-4 text-sm outline-none focus:border-[#972E47]";

  return (
    <main className="min-h-screen bg-[#F8F6EF]">
      <section className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-semibold">My Cart</h1>

        <p className="mt-2 text-[#777]">{totals.itemCount} Items</p>

        <div className="mt-8">
          <CheckoutStepper step={2} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_380px]">
          <CheckoutCard>
            <div className="border-b p-6">
              <h2 className="text-2xl font-semibold">Add New Address</h2>
            </div>

            <div className="space-y-4 p-6">
              <CountrySelect
                value={form.country}
                onChange={(country) => setForm((f) => ({ ...f, ...regionResetFor(country) }))}
                className={inputClass}
              />

              <input
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Full Name*"
                className={inputClass}
              />

              <input
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
                placeholder="Street Address*"
                className={inputClass}
              />

              <input
                value={form.landmark}
                onChange={(e) => set("landmark", e.target.value)}
                placeholder="Landmark (optional)"
                className={inputClass}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="City*"
                  className={inputClass}
                />

                <StateField
                  country={form.country}
                  value={form.state}
                  onChange={(state) => set("state", state)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <PostalField
                  country={form.country}
                  value={form.pincode}
                  onChange={(pincode) => set("pincode", pincode)}
                  className={inputClass}
                />

                <PhoneField
                  value={form.phone}
                  onChange={(phone) => set("phone", phone)}
                  placeholder="Delivery phone (optional)"
                />
              </div>

              <AddressType
                value={form.type}
                onChange={(t: AddressTypeValue) => set("type", t)}
              />

              {error && <p className="text-sm text-[#972E47]">{error}</p>}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <SecondaryButton
                  fullWidth={false}
                  className="px-8"
                  onClick={() => router.push("/shipping")}
                >
                  Cancel
                </SecondaryButton>

                <PrimaryButton
                  fullWidth={false}
                  className="px-8"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving…" : "Save Address"}
                </PrimaryButton>
              </div>
            </div>
          </CheckoutCard>

          <div>
            <PriceSummary totals={totals} />
            <DeliveryBanner />
          </div>
        </div>
      </section>
    </main>
  );
}
