import { MapPin } from "lucide-react";

import type { Address } from "@/@types/account";

/** Desktop: the picked address, repeated under the summary beside the button. */
export default function DeliveringTo({ address }: { address: Address }) {
  return (
    <div key={address._id} className="mt-4 hidden animate-fade-in gap-3 rounded-md border border-[#E8DFD3] bg-white p-4 text-sm lg:flex">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary">
        <MapPin size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B6E54]">Delivering to</p>
        <p className="mt-0.5 font-semibold text-dark">{address.fullName}</p>
        <p className="text-[13px] text-[#6B6B6B]">
          {address.city}, {address.state} {address.pincode}
        </p>
      </div>
    </div>
  );
}
