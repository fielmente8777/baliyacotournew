"use client";

import { Check, MapPin } from "lucide-react";

import type { Address } from "@/@types/account";
import { DEFAULT_COUNTRY_CODE, getAddressCountry } from "@/lib/addressCountries";
import { cn } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

interface Props {
  address: Address;
  selected: boolean;
  onSelect: () => void;
  /** Position in the list — staggers the entrance animation. */
  index?: number;
}

/** One saved address as a radio card. Part of the "Delivery address" radiogroup. */
export default function AddressCard({ address, selected, onSelect, index = 0 }: Props) {
  return (
    <label
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
      className={cn(
        "relative flex animate-rise-in cursor-pointer flex-col rounded-md border p-4 transition-all duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-secondary/30 sm:p-5",
        selected
          ? "border-secondary bg-[#FDF8F9] shadow-[0_0_0_1px_var(--color-secondary),0_10px_28px_-16px_rgba(155,44,64,0.55)]"
          : "border-[#E8DFD3] bg-white hover:border-[#D2C4B4] hover:shadow-[0_8px_22px_-14px_rgba(34,34,34,0.3)]"
      )}
    >
      <input type="radio" name="shipping-address" checked={selected} onChange={onSelect} className="sr-only" />

      {/* Custom radio: a ring that fills with a check. */}
      <span
        className={cn(
          "absolute right-4 top-4 flex size-5 items-center justify-center rounded-full border-2 transition-colors duration-300 sm:right-5 sm:top-5",
          selected ? "border-secondary bg-secondary" : "border-[#D9CFC2] bg-white"
        )}
        aria-hidden="true"
      >
        {selected && <Check size={12} strokeWidth={3} className="animate-check-pop text-white" />}
      </span>

      <div className="flex flex-wrap items-center gap-2 pr-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B6E54]">{address.type}</span>
        {address.isDefault && (
          <span className="rounded-sm bg-secondary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
            Default
          </span>
        )}
      </div>

      <h3 className="mt-1.5 font-semibold text-dark">{address.fullName}</h3>

      <address className="mt-1.5 space-y-0.5 text-sm not-italic leading-relaxed text-[#5C5C5C]">
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
        className={cn(
          "grid transition-all duration-300",
          selected ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <p className="flex items-center gap-1.5 overflow-hidden text-xs font-semibold text-secondary">
          <MapPin size={13} aria-hidden="true" />
          Delivering here
        </p>
      </div>
    </label>
  );
}

export function AddressCardSkeleton() {
  return <div className="h-44 animate-pulse rounded-md border border-[#E8DFD3] bg-black/[0.03]" />;
}
