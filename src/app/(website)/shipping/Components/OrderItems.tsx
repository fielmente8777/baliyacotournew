import Image from "next/image";

import type { MergedCartItem } from "@/hooks/useCart";
import { formatINR } from "@/lib/format";

/** What's being delivered, inside the price summary, so the customer never has to go back to check. */
export default function OrderItems({ items }: { items: MergedCartItem[] }) {
  if (!items.length) return null;

  return (
    <ul className="max-h-60 space-y-3 overflow-y-auto border-b border-[#F1EBE2] px-5 py-4 sm:px-6">
      {items.map((item) => (
        <li key={`${item.source}-${item.id}`} className="flex items-center gap-3">
          <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-sm bg-[#F1EDE6]">
            <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
            {item.quantity > 1 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-dark/85 px-1 text-[10px] text-white">
                {item.quantity}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B6E54]">
              {item.kind === "design" ? "Custom design" : "Ready to wear"}
            </p>
            <p className="line-clamp-2 text-[13px] text-dark">{item.title}</p>
          </div>
          <span className="shrink-0 text-[13px] font-semibold text-dark">
            {formatINR((item.unitPrice * item.quantity) / 100)}
          </span>
        </li>
      ))}
    </ul>
  );
}
