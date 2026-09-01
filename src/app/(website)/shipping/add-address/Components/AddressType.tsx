"use client";

import { Home, Briefcase, MapPin } from "lucide-react";
import type { AddressType as AddressTypeValue } from "@/@types/account";

const types: { value: AddressTypeValue; label: string; icon: typeof Home }[] = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "other", label: "Other", icon: MapPin },
];

interface Props {
  value: AddressTypeValue;
  onChange: (value: AddressTypeValue) => void;
}

/**
 * Controlled — the parent form owns the value, so it can be submitted. It kept
 * its own useState before, which meant the selection never reached the request.
 */
export default function AddressType({ value, onChange }: Props) {
  return (
    <div className="mt-8">
      <p className="mb-4 text-sm font-semibold">Address Type</p>

      <div className="flex flex-wrap gap-4">
        {types.map((item) => {
          const Icon = item.icon;
          const isActive = value === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 rounded-full border px-5 py-3 transition ${
                isActive
                  ? "border-[#972E47] bg-[#972E47] text-white"
                  : "border-[#DDD] bg-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
