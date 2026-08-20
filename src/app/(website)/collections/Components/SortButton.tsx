"use client";

import { useState } from "react";

const sortOptions = [
    "Sort By",
    "Best Selling",
    "Featured",
    "Newest",
    "Price : Low to High",
    "Price : High to Low",
];

export default function SortButton() {
  const [selected, setSelected] = useState(sortOptions[0]);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="
        flex
        items-center
        gap-3
        rounded-sm
        bg-white
        px-5
        py-3
        text-sm
        box-shadow
      "
      >
        {selected}
        {/* <ChevronDown
          size={18}
          className={`duration-300 ${
            open ? "rotate-180" : ""
          }`}
        /> */}
        icon
      </button>

      {open && (
        <div
          className="
          absolute
          right-0
          mt-3
          w-64
          overflow-hidden
          rounded-xl
          border
          bg-white
          shadow-xl
          z-30
        "
        >
          {sortOptions.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSelected(item);
                setOpen(false);
              }}
              className="
              w-full
              border-b
              px-5
              py-4
              text-left
              text-sm
              hover:bg-[#F8F8F8]
              last:border-none
            "
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
