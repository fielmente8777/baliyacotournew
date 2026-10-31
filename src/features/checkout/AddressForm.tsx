"use client";

/**
 * The checkout's new-address form. Used inline on /shipping (so adding an
 * address never leaves the checkout) and on /shipping/add-address.
 *
 * Posts to the same /addresses endpoint as the account section rather than
 * keeping a second, divergent address form.
 */

import { useState } from "react";

import Notice from "@/components/checkout/Notice";
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
import PlaceAutocomplete, { placeToAddress } from "@/components/inputs/PlaceAutocomplete";

import { useCreateAddressMutation } from "@/store/api/addressApi";
import { DEFAULT_COUNTRY_CODE, shippableCountry } from "@/lib/addressCountries";
import { useDetectedCountry } from "@/lib/detectCountry";
import type { Address, AddressType as AddressTypeValue } from "@/@types/account";

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

interface Props {
  onSaved: (address: Address) => void;
  onCancel: () => void;
  saveLabel?: string;
}

export const addressInputClass =
  "h-12 w-full rounded-md border border-[#E0D6C8] bg-white px-4 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:border-secondary focus:shadow-[0_0_0_3px_rgba(155,44,64,0.1)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#777]">{children}</span>;
}

export default function AddressForm({ onSaved, onCancel, saveLabel = "Save Address" }: Props) {
  const [createAddress, { isLoading }] = useCreateAddressMutation();

  const [form, setForm] = useState(emptyForm);
  /* Until the customer picks a country, use the one they're browsing from.
     Worked out after hydration, so the server and client markup match. */
  const detected = useDetectedCountry();
  const [countryChosen, setCountryChosen] = useState(false);
  const country = countryChosen ? form.country : (shippableCountry(detected) ?? form.country);
  const [error, setError] = useState<string | null>(null);
  /* Bumped on each failed attempt so the error shakes again. */
  const [errorKey, setErrorKey] = useState(0);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const fail = (message: string) => {
    setError(message);
    setErrorKey((k) => k + 1);
  };

  const handleSave = async () => {
    if (form.fullName.trim().length < 2) return fail("Please enter a full name.");
    if (form.street.trim().length < 3) return fail("Please enter a street address.");
    if (!form.city.trim()) return fail("Please enter a city.");
    const regionError = validateRegion(country, form.state, form.pincode);
    if (regionError) return fail(regionError);

    setError(null);

    try {
      const saved = await createAddress({
        fullName: form.fullName.trim(),
        street: form.street.trim(),
        landmark: form.landmark.trim() || undefined,
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        country: country,
        phone: form.phone.trim() || undefined,
        type: form.type,
      }).unwrap();

      onSaved(saved);
    } catch {
      fail("We couldn't save this address. Please try again.");
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Full name*</FieldLabel>
          <input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Who should we deliver to?"
            autoComplete="name"
            className={addressInputClass}
          />
        </label>

        <div>
          <FieldLabel>Delivery phone</FieldLabel>
          <PhoneField
            value={form.phone}
            onChange={(phone) => set("phone", phone)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Country*</FieldLabel>
        <CountrySelect
          value={country}
          onChange={(next) => {
            setCountryChosen(true);
            setForm((f) => ({ ...f, ...regionResetFor(next) }));
          }}
          className={addressInputClass}
        />
      </div>

      <div>
        <FieldLabel>Street address*</FieldLabel>
        <PlaceAutocomplete
          value={form.street}
          onChange={(street) => set("street", street)}
          onSelect={(place) => {
            setCountryChosen(true);
            setForm((f) => ({ ...f, street: place.street, ...placeToAddress(place) }));
          }}
          country={country}
          placeholder="Start typing for suggestions"
          className={addressInputClass}
        />
      </div>

      <label className="block">
        <FieldLabel>Landmark</FieldLabel>
        <input
          value={form.landmark}
          onChange={(e) => set("landmark", e.target.value)}
          placeholder="Optional — near a school, temple, etc."
          className={addressInputClass}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel>City*</FieldLabel>
          <PlaceAutocomplete
            mode="city"
            value={form.city}
            onChange={(city) => set("city", city)}
            onSelect={(place) => {
              const filled = placeToAddress(place);
              setCountryChosen(true);
              setForm((f) => ({ ...f, country: filled.country, city: filled.city, state: filled.state || f.state }));
            }}
            country={country}
            placeholder="City"
            className={addressInputClass}
          />
        </div>

        <div>
          <FieldLabel>State*</FieldLabel>
          <StateField
            country={country}
            value={form.state}
            onChange={(state) => set("state", state)}
            className={addressInputClass}
          />
        </div>

        <div>
          <FieldLabel>Postal code*</FieldLabel>
          <PostalField
            country={country}
            value={form.pincode}
            onChange={(pincode) => set("pincode", pincode)}
            className={addressInputClass}
          />
        </div>
      </div>

      <AddressType
        value={form.type}
        onChange={(t: AddressTypeValue) => set("type", t)}
      />

      {error && (
        <Notice key={errorKey} tone="error" role="alert" className="animate-shake">
          {error}
        </Notice>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <SecondaryButton type="button" onClick={onCancel}>
          Cancel
        </SecondaryButton>

        <PrimaryButton type="submit" fullWidth={false} disabled={isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Saving…
            </span>
          ) : (
            saveLabel
          )}
        </PrimaryButton>
      </div>
    </form>
  );
}
