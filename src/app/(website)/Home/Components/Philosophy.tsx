import type { HomePageContent } from "../pagedata";
import { AccentTitle } from "./ui";

/** One centred statement between the silhouettes and the designer. */
export default function Philosophy({ title, titleAccent, description }: HomePageContent["philosophy"]) {
  return (
    <section aria-label="Our philosophy" className="mx-auto flex max-w-230 flex-col items-center gap-5 px-4 py-16 text-center md:gap-6 md:px-10 md:py-24">
      <svg width="44" height="12" viewBox="0 0 44 12" fill="none" stroke="#B8873B" aria-hidden>
        <path d="M0 6h16M28 6h16" />
        <path d="M22 1l5 5-5 5-5-5z" />
      </svg>
      <AccentTitle as="p" title={title} accent={titleAccent} className="text-[30px] leading-[1.12] md:text-5xl" />
      <p className="max-w-160 text-base leading-relaxed text-light md:text-[17px]">{description}</p>
    </section>
  );
}
