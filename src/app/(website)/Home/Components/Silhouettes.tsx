"use client";

import Image from "next/image";
import Link from "next/link";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetDesignImagesQuery } from "@/store/api/designApi";
import { designImageKey } from "@/lib/designImages";
import { primaryImage } from "@/@types/product";
import { formatINR } from "@/lib/format";
import type { HomePageContent } from "../pagedata";
import { SectionHead, wrap } from "./ui";

/** Soft backdrops behind the arches, in turn. */
const TINTS = ["#F2E4E6", "#EFE8DE", "#E6EEEA", "#F4EAD6"];

/**
 * One arch per silhouette. The admin picks the silhouettes (a Shopify
 * product type each) and may set a picture. Without one, the arch shows the
 * Design Builder's photo of that garment ("Sharara Set" → garment/sharara-set),
 * then any product photo of that type. The lowest price comes from the products.
 */
export default function Silhouettes({ eyebrow, title, titleAccent, linkLabel, items }: HomePageContent["silhouettes"]) {
  /* Same query as the Pre-made Designs page, so it's shared from cache. */
  const { data } = useGetProductsQuery({ limit: 250 });
  const { data: images = {} } = useGetDesignImagesQuery();
  const products = data?.items ?? [];

  const tiles = items.map((item, i) => {
    const ofType = products.filter((p) => p.productType?.toLowerCase() === item.productType.trim().toLowerCase());
    const prices = ofType.map((p) => p.salePrice ?? p.basePrice);
    const withPhoto = ofType.find((p) => p.images.length > 0);
    return {
      ...item,
      tint: TINTS[i % TINTS.length],
      image:
        item.image ||
        images[designImageKey.garment(item.productType.trim().replace(/\s+/g, "-"))] ||
        (withPhoto ? primaryImage(withPhoto) : ""),
      from: prices.length ? Math.min(...prices) : null,
    };
  });

  return (
    <section aria-label="Shop by silhouette" className={`${wrap} pt-14 md:pt-22`}>
      <SectionHead eyebrow={eyebrow} title={title} accent={titleAccent}>
        {linkLabel && (
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center text-[15px] font-medium text-secondary underline underline-offset-[6px]"
          >
            {linkLabel}
          </Link>
        )}
      </SectionHead>

      <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 md:gap-6 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <Link
            key={i}
            href={tile.productType ? `/products?type=${encodeURIComponent(tile.productType)}` : "/products"}
            className="group flex flex-col gap-3 md:gap-3.5"
          >
            <span
              style={{ backgroundColor: tile.tint }}
              className="relative block aspect-3/4 w-full overflow-hidden rounded-t-full rounded-b-sm transition-transform duration-300 group-hover:-translate-y-1"
            >
              {tile.image && (
                <Image src={tile.image} alt="" fill sizes="(max-width: 1024px) 50vw, 300px" className="object-cover object-top" />
              )}
            </span>
            <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
              <span className="text-lg font-medium text-dark transition-colors group-hover:text-secondary md:text-[22px]">
                {tile.title}
              </span>
              {tile.from !== null && (
                <span className="whitespace-nowrap text-xs text-[#6B6B6B] md:text-[13px]">From {formatINR(tile.from / 100)}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
