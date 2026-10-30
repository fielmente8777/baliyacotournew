import Image from "next/image";
import type { HomePageContent } from "../pagedata";
import { Eyebrow, wrap } from "./ui";

/** The founders' photo in an arch beside their note. */
export default function FoundersMessage({ eyebrow, quote, description, signature, image }: HomePageContent["foundersMessage"]) {
  return (
    <section id="founders" aria-label="A note from the founders" className={`${wrap} scroll-mt-20 py-16 md:py-24`}>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-18">
        <div className="flex justify-center p-3.5">
          <div className="relative aspect-4/5 w-full max-w-72 overflow-hidden rounded-t-full rounded-b-sm bg-[#E6DCCB] outline outline-[#B8873B] outline-offset-[10px] sm:max-w-sm md:outline-offset-[12px] lg:max-w-100">
            {image && (
              <Image src={image} alt="The founders of Baliye Couture" fill sizes="(max-width: 1024px) 80vw, 400px" className="object-cover object-[22%_center]" />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <span aria-hidden className="h-8 text-[80px] leading-[0.75] text-[#B8873B]">
            &ldquo;
          </span>
          <p className="text-[22px] font-medium leading-snug text-dark md:text-[30px]">{quote}</p>
          {description && <p className="text-base leading-relaxed text-light">{description}</p>}
          {signature && <p className="pt-1 text-lg font-medium text-secondary">{signature}</p>}
        </div>
      </div>
    </section>
  );
}
