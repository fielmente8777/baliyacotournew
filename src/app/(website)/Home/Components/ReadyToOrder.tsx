"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ProductCard from "@/features/catalog/ProductCard";
import { useGetProductsQuery, usePrefetchProducts } from "@/store/api/productApi";
import { cn } from "@/lib/format";
import type { HomePageContent } from "../pagedata";
import { AccentTitle, Eyebrow, PillLink, SectionHead, wrap } from "./ui";

/**
 * Four designs per tab, each tab a Shopify tag (bestseller, editors-pick,
 * custom…). A tab with fewer than four is topped up by the "design it from
 * scratch" card.
 *
 * Switching tabs: the white pill slides to the chosen tab, and the designs
 * slide in from that side, one after another. The other tabs are loaded in
 * the background, so the switch is instant.
 */
export default function ReadyToOrder({ eyebrow, title, titleAccent, tabs, button, promo }: HomePageContent["products"]) {
  const usable = tabs.filter((t) => t.label && t.tag);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const index = Math.min(active, usable.length - 1);
  const tab = usable[index];

  const { data, isLoading, isFetching } = useGetProductsQuery({ tag: tab?.tag, limit: 4 }, { skip: !tab });
  const prefetch = usePrefetchProducts();
  const tagList = usable.map((t) => t.tag).join("|");
  useEffect(() => {
    for (const tag of tagList.split("|")) if (tag) prefetch({ tag, limit: 4 });
  }, [tagList, prefetch]);

  /* The sliding pill: measured from the active button. */
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = buttons.current[index];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [index, tagList]);

  if (!tab) return null;

  const pick = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? "right" : "left");
    setActive(i);
    buttons.current[i]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };

  /* Shown while the new tab loads: the previous designs, dimmed. They slide
     only once the new ones arrive (the key changes with the designs). */
  const products = data?.items ?? [];
  const gridKey = products.map((p) => p._id).join(",") || `empty-${tab.tag}`;
  const slide = direction === "right" ? "animate-slide-from-right" : direction === "left" ? "animate-slide-from-left" : "";

  return (
    <section id="bestsellers" aria-label="Ready to order" className={`${wrap} scroll-mt-20 overflow-x-clip pt-16 md:pt-24`}>
      <SectionHead eyebrow={eyebrow} title={title} accent={titleAccent}>
        {usable.length > 1 && (
          <div role="group" aria-label="Filter designs" className="scrollbar-none -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <div className="relative flex w-max gap-1 rounded-full bg-[#F1EDE6] p-1">
              {pill && (
                <span
                  aria-hidden
                  className="absolute bottom-1 top-1 rounded-full bg-white shadow-[0_1px_3px_rgba(34,34,34,0.14)] transition-[left,width] duration-300 ease-(--ease-smooth)"
                  style={{ left: pill.left, width: pill.width }}
                />
              )}
              {usable.map((t, i) => {
                const on = i === index;
                return (
                  <button
                    key={`${t.tag}-${i}`}
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(i)}
                    className={cn(
                      "relative z-10 min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-300 md:px-5",
                      on ? "text-secondary" : "text-light hover:text-dark",
                      /* Before the pill is measured (first paint), the active tab keeps its own background. */
                      on && !pill && "bg-white"
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </SectionHead>

      <div
        key={gridKey}
        aria-live="polite"
        className={cn(
          "grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-6",
          isFetching && !isLoading && "opacity-60 transition-opacity"
        )}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-3/4 animate-pulse rounded-sm bg-black/5" />)
          : products.map((product, i) => (
              <div key={product._id} className={slide} style={{ animationDelay: `${i * 60}ms` }}>
                <ProductCard product={product} priority={i < 2} />
              </div>
            ))}

        {!isLoading && products.length < 4 && promo.title && (
          <div
            className={cn(
              "flex min-h-72 flex-col justify-end gap-4 rounded-sm bg-dark p-6 text-white md:p-10",
              products.length % 2 === 0 ? "col-span-2" : "col-span-1 lg:col-span-2",
              products.length === 0 && "lg:col-span-4",
              slide
            )}
            style={{ animationDelay: `${products.length * 60}ms` }}
          >
            {promo.eyebrow && <Eyebrow className="text-[#E2C08A]">{promo.eyebrow}</Eyebrow>}
            <AccentTitle
              as="h3"
              title={promo.title}
              accent={promo.titleAccent}
              className="text-2xl text-white md:text-4xl"
              accentClassName="text-[#F0D4A8]"
            />
            {promo.description && <p className="max-w-md text-[15px] leading-relaxed text-white/75">{promo.description}</p>}
            <PillLink href={promo.cta.link} label={promo.cta.label} variant="light" className="self-start" />
          </div>
        )}
      </div>

      <div className="flex justify-center pt-10 md:pt-12">
        <PillLink href={button.link} label={button.label} variant="outline" />
      </div>
    </section>
  );
}
