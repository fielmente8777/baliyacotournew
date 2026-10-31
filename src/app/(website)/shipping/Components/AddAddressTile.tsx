"use client";

import { Plus } from "lucide-react";

interface Props {
  onClick: () => void;
  /** Position in the grid — staggers the entrance animation. */
  index?: number;
}

/** The dashed "Add a new address" tile at the end of the saved addresses. */
export default function AddAddressTile({ onClick, index = 0 }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
      className="group flex min-h-44 animate-rise-in flex-col items-center justify-center gap-2.5 rounded-md border border-dashed border-[#D2C4B4] p-4 text-sm font-semibold text-secondary transition-colors hover:border-secondary hover:bg-[#FDF8F9]"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-[#F1EDE6] transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
        <Plus size={20} aria-hidden="true" />
      </span>
      Add a new address
    </button>
  );
}
