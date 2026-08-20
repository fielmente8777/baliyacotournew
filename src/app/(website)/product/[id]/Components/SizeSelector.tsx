"use client";

import { useState } from "react";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function SizeSelector() {
  const [selected, setSelected] = useState("XS");

  return (
    <div className="mt-8 flex items-center gap-4">

      <p className=" tracking-[2px] uppercase">
        Select Size
      </p>

      <div className="flex flex-wrap gap-3">

        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelected(size)}
            className={`h-11 w-11 rounded-full border text-sm font-medium transition ${
              selected === size
                ? "border-[#8D2F46] bg-[#8D2F46] text-white"
                : "border-[#D7D7D7] bg-white"
            }`}
          >
            {size}
          </button>
        ))}

      </div>

    </div>
  );
}