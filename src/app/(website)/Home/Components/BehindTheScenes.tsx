import Image from "next/image";
import LineWithFlower from "@/components/LineWithFlower";
import { cn } from "@/lib/format";
import type { HomePageContent } from "../pagedata";
import { AccentTitle, Eyebrow, PillLink, wrap } from "./ui";

/**
 * Where each of the six photos sits. Phones: two columns, seven rows.
 * Desktop: four columns, six rows (tall, two stacked, tall, short over medium).
 */
const TILES = [
  "col-start-1 row-start-1 row-span-3 lg:col-start-1 lg:row-start-1 lg:row-span-6",
  "col-start-2 row-start-1 row-span-2 lg:col-start-2 lg:row-start-1 lg:row-span-3",
  "col-start-2 row-start-4 row-span-2 lg:col-start-2 lg:row-start-4 lg:row-span-3",
  "col-start-1 row-start-4 row-span-4 lg:col-start-3 lg:row-start-1 lg:row-span-6",
  "col-start-2 row-start-3 row-span-1 lg:col-start-4 lg:row-start-1 lg:row-span-2",
  "col-start-2 row-start-6 row-span-2 lg:col-start-4 lg:row-start-3 lg:row-span-4",
];

export default function BehindTheScenes({ eyebrow, title, titleAccent, description, cta, photos, steps }: HomePageContent["behindTheScenes"]) {
  const tiles = photos.filter((p) => p.image).slice(0, TILES.length);

  return (
    <section id="story" aria-label="Behind the scenes" className="bg-secondary pt-7 text-white">
      <LineWithFlower bgColor="bg-white" />
      <div className={`${wrap} flex flex-col gap-10 pb-16 pt-12 md:gap-12 md:pb-24 md:pt-14`}>
        <div className="grid items-end gap-5 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-4">
            {eyebrow && <Eyebrow className="text-[#F0D4A8]">{eyebrow}</Eyebrow>}
            <AccentTitle
              title={title}
              accent={titleAccent}
              className="text-[34px] text-white md:text-[56px]"
              accentClassName="text-[#F0D4A8]"
            />
          </div>
          <div className="flex flex-col items-start gap-5">
            {description && <p className="max-w-lg text-base leading-relaxed text-white/85">{description}</p>}
            <PillLink href={cta.link} label={cta.label} variant="outlineLight" arrow />
          </div>
        </div>

        {tiles.length > 0 && (
          <div className="grid grid-cols-2 grid-rows-[repeat(7,84px)] gap-2 md:grid-rows-[repeat(7,110px)] lg:grid-cols-4 lg:grid-rows-[repeat(6,88px)] lg:gap-3.5">
            {tiles.map((photo, i) => (
              <figure key={i} className={cn("relative m-0 overflow-hidden rounded-sm bg-[#7d2233]", TILES[i])}>
                <Image src={photo.image} alt={photo.caption} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                {photo.caption && (
                  <figcaption className="absolute bottom-2.5 left-2.5 rounded-full bg-[#FAF7F2]/95 px-3 py-1.5 text-[11px] font-semibold text-dark md:bottom-3 md:left-3 md:text-xs">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {steps.length > 0 && (
          <ol className="grid gap-6 border-t border-white/30 pt-8 md:grid-cols-3 md:gap-10">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span aria-hidden className="text-4xl font-light leading-[0.9] text-[#F0D4A8]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[17px] font-semibold">{step.title}</span>
                  <span className="text-sm leading-relaxed text-white/80">{step.description}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
