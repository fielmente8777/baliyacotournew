import Image from "next/image";
import Link from "next/link";
import type { HomePageContent } from "../pagedata";
import { AccentTitle, Eyebrow, PillLink, wrap } from "./ui";

/**
 * Two collection tiles: a dark panel with its photo, and a mint tile with
 * the photo behind the words.
 */
export default function Collections({ main, side }: HomePageContent["collections"]) {
  return (
    <section aria-label="Collections" className={`${wrap} pb-16 pt-14 md:pb-24 md:pt-18`}>
      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid overflow-hidden rounded-sm sm:grid-cols-2 lg:min-h-125">
          <div className="flex flex-col justify-between gap-8 bg-dark px-6 py-8 text-white md:px-8 md:py-10">
            <div className="flex flex-col gap-4">
              {main.eyebrow && <Eyebrow className="text-[#E2C08A]">{main.eyebrow}</Eyebrow>}
              <AccentTitle
                as="h3"
                title={main.title}
                accent={main.titleAccent}
                className="text-[32px] text-white md:text-[40px]"
                accentClassName="text-[#F0D4A8]"
              />
              {main.description && <p className="text-[15px] leading-relaxed text-white/75">{main.description}</p>}
            </div>
            <PillLink href={main.cta.link} label={main.cta.label} variant="light" arrow className="self-start" />
          </div>
          <div className="relative min-h-72 bg-[#EFE8DE] sm:min-h-0">
            {main.image && (
              <Image src={main.image} alt="" fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover object-top" />
            )}
          </div>
        </div>

        <Link
          href={side.cta.link || "/products"}
          className="group relative flex min-h-105 flex-col justify-end overflow-hidden rounded-sm bg-primary text-dark lg:min-h-125"
        >
          {side.image && (
            <Image
              src={side.image}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 520px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
          {/* Keeps the words readable over any photo. */}
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-primary via-primary/80 to-transparent" />
          <div className="relative flex flex-col gap-2.5 px-6 py-8 md:px-8 md:py-9">
            {side.eyebrow && <Eyebrow className="text-dark/70">{side.eyebrow}</Eyebrow>}
            <AccentTitle as="h3" title={side.title} accent={side.titleAccent} className="text-[32px] md:text-[40px]" />
            {side.description && <p className="max-w-sm text-[15px] leading-relaxed text-light">{side.description}</p>}
            {side.cta.label && (
              <span className="pt-1.5 text-[15px] font-semibold text-secondary underline underline-offset-[6px]">
                {side.cta.label}
              </span>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}
