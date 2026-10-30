"use client";

import Image from "next/image";
import { useGetGarmentTypesQuery } from "@/store/api/productApi";
import { useGetDesignConfigQuery, useGetDesignImagesQuery } from "@/store/api/designApi";
import { designImageKey } from "@/lib/designImages";
import { formatINR } from "@/lib/format";
import type { HomePageContent } from "../pagedata";
import { PillLink, SectionHead, wrap } from "./ui";

/**
 * Every fabric the designer offers, with its price and swatch picture, read
 * from the Design Builder (pictures from Admin → Design Builder or Shopify
 * "Design Image" option/fabric/…). Hidden if there's no fabric step.
 */
export default function FabricLibrary({ eyebrow, title, titleAccent, description, cta }: HomePageContent["fabrics"]) {
  const { data: garments = [] } = useGetGarmentTypesQuery();
  const { data: images = {} } = useGetDesignImagesQuery();
  const first = garments[0];
  const { data: config } = useGetDesignConfigQuery({ garmentTypeId: first?._id }, { skip: !first });

  const group = config?.groups.find((g) => g.code === "fabric");
  if (!group?.options.length) return null;

  return (
    <section aria-label="The fabric library" className={`${wrap} pb-16 md:pb-24`}>
      <div className="flex flex-col rounded-lg bg-[#F1EDE6] px-4 py-8 md:p-12">
        <SectionHead eyebrow={eyebrow} title={title} accent={titleAccent} description={description}>
          <PillLink href={cta.link} label={cta.label} variant="outline" className="self-start whitespace-nowrap md:self-auto" />
        </SectionHead>

        <ul className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {group.options.map((option) => {
            const src = images[designImageKey.option(group.code, option.value)] ?? option.image;
            return (
              <li key={option._id} className="flex w-24 shrink-0 flex-col gap-2 md:w-auto md:flex-1 md:basis-24">
                <span className="relative block aspect-square overflow-hidden rounded-sm bg-[#E6DCCB] shadow-[inset_0_0_0_1px_rgba(34,34,34,0.08)]">
                  {src && <Image src={src} alt={`${option.label} fabric`} fill sizes="120px" className="object-cover" />}
                </span>
                <span className="text-sm font-semibold text-dark">{option.label}</span>
                <span className="-mt-1.5 text-xs text-[#6B6B6B]">
                  {option.priceModifier ? `+${formatINR(option.priceModifier / 100)}` : "Included"}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
