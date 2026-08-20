"use client";

import { useState } from "react";
import { Home, Briefcase, MapPin } from "lucide-react";

const types = [
  {
    label: "Home",
    icon: Home,
  },
  {
    label: "Work",
    icon: Briefcase,
  },
  {
    label: "Other",
    icon: MapPin,
  },
];

export default function AddressType() {
  const [selected, setSelected] = useState("Home");

  return (
    <div className="mt-8">

      <p className="mb-4 text-sm font-semibold">
        Address Type
      </p>

      <div className="flex gap-4">

        {types.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setSelected(item.label)}
              className={`flex items-center gap-2 rounded-full border px-5 py-3 transition ${
                selected === item.label
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