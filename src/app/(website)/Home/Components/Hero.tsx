import Image from "next/image";
import type { HomePageContent } from "../pagedata";
import FeaturedProductCard from "./FeaturedProductCard";
import { AccentTitle, Eyebrow, PillLink, wrap } from "./ui";

/** Words on the left, the campaign photo in an arch on the right (on top on phones). */
export default function Hero({ eyebrow, title, titleAccent, description, image, cta, secondaryCta, featured }: HomePageContent["hero"]) {
  return (
    <section aria-label="Introduction" className="overflow-hidden bg-[#F1EDE6]">
      <div
        className={`${wrap} grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:py-20`}
      >
        <div className="flex flex-col gap-5 md:gap-6">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <AccentTitle
            as="h1"
            title={title}
            accent={titleAccent}
            className="text-[44px] leading-[0.98] tracking-tight md:text-6xl lg:text-7xl xl:text-[84px]"
          />
          <p className="max-w-lg text-base leading-relaxed text-light md:text-lg">{description}</p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <PillLink href={cta.link} label={cta.label} arrow />
            <PillLink href={secondaryCta.link} label={secondaryCta.label} variant="outline" />
          </div>
        </div>

        <div className="relative flex justify-center p-3.5 max-lg:order-first">
          <div className="relative aspect-4/5 w-full max-w-72 overflow-hidden rounded-t-full rounded-b-sm bg-[#E6DCCB] outline outline-[#B8873B] outline-offset-[10px] sm:max-w-sm md:outline-offset-[12px] lg:max-w-md">
            {image && (
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 440px"
                className="object-cover object-top"
              />
            )}
          </div>
          {featured.show && featured.productHandle && (
            <FeaturedProductCard label={featured.label} handle={featured.productHandle} />
          )}
        </div>
      </div>
    </section>
  );
}
