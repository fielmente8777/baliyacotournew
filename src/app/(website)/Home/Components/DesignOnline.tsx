import Image from "next/image";
import type { HomePageContent } from "../pagedata";
import { AccentTitle, Eyebrow, PillLink, wrap } from "./ui";

/**
 * "A perfect fit, designed online": the words on the left, a laptop on the
 * right showing a picture of the designer. The picture is the admin's
 * (16:10 screenshot); the laptop frame is drawn here.
 */
export default function DesignOnline({ eyebrow, title, titleAccent, description, image, cta }: HomePageContent["designOnline"]) {
  return (
    <section aria-label="Design your dress online" className={`${wrap} py-16 md:py-24`}>
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col items-start gap-5 md:gap-6">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <AccentTitle
            title={title}
            accent={titleAccent}
            className="text-[36px] leading-[1.05] md:text-[56px]"
            accentClassName="block text-secondary"
          />
          {description && <p className="max-w-md text-base leading-relaxed text-light md:text-[17px]">{description}</p>}
          <PillLink href={cta.link} label={cta.label} variant="outline" arrow className="mt-1" />
        </div>

        {image && (
          <div aria-hidden className="mx-auto w-full max-w-170 px-[5%] lg:px-0">
            {/* Screen */}
            <div className="rounded-t-[18px] bg-[#1d1d1f] p-[2.2%] pb-[2.6%] shadow-[0_30px_60px_-30px_rgba(34,34,34,0.45)]">
              <div className="relative mx-auto -mt-[1.2%] mb-[1.2%] size-1.5 rounded-full bg-[#3a3a3c]" />
              <div className="relative aspect-16/10 overflow-hidden rounded-[3px] bg-white">
                <Image src={image} alt="" fill sizes="(max-width: 1024px) 90vw, 640px" className="object-cover object-top-left" />
              </div>
            </div>
            {/* Base */}
            <div className="relative -mx-[6%] h-3 rounded-b-[14px] bg-linear-to-b from-[#e4e4e6] to-[#c9c9cd] shadow-[0_18px_30px_-18px_rgba(34,34,34,0.5)] md:h-4">
              <div className="absolute left-1/2 top-0 h-1.5 w-[16%] -translate-x-1/2 rounded-b-md bg-[#b5b5ba]" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
