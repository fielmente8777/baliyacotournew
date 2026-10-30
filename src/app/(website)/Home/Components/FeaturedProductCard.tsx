"use client";

import Link from "next/link";
import { useGetProductBySlugQuery } from "@/store/api/productApi";
import { formatINR } from "@/lib/format";

/**
 * The small card on the hero photo. Name and price are read live from the
 * Shopify product, so they never go stale; if the product is gone the card
 * simply doesn't show.
 */
export default function FeaturedProductCard({ label, handle }: { label: string; handle: string }) {
  const { data: product } = useGetProductBySlugQuery(handle);
  if (!product) return null;

  const price = product.salePrice ?? product.basePrice;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="absolute bottom-6 left-0 flex max-w-56 animate-fade-in flex-col gap-1 rounded-sm bg-[#FAF7F2] px-5 py-4 text-dark shadow-[0_12px_32px_rgba(34,34,34,0.12)] transition-transform hover:-translate-y-0.5 md:bottom-12"
    >
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B6E54]">{label}</span>
      )}
      {/* "Embroidered Sharara Set – Dusty Pink": the name without its colour, and no dash. */}
      <span className="text-lg font-medium leading-tight">{product.name.split(/\s[–—-]\s/)[0]}</span>
      <span className="text-sm text-[#6B6B6B]">From {formatINR(price / 100)}</span>
    </Link>
  );
}
