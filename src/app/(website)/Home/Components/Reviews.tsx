import Image from "next/image";
import { Star } from "lucide-react";
import type { HomePageContent } from "../pagedata";
import { SectionHead, wrap } from "./ui";

/** Customer photos and quotes, added by hand in the admin. Off by default. */
export default function Reviews({ eyebrow, title, titleAccent, button, gallery, items }: HomePageContent["reviews"]) {
  const photos = gallery.filter((g) => g.image);
  const quotes = items.filter((r) => r.quote);
  if (!photos.length && !quotes.length) return null;

  return (
    <section aria-label="Customer reviews" className={`${wrap} flex flex-col gap-8 pt-16 md:pt-24`}>
      <SectionHead eyebrow={eyebrow} title={title} accent={titleAccent} className="mb-0 md:mb-0">
        {button.label && (
          <a
            href={button.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2.5 self-start rounded-full border border-dark px-6 text-[15px] font-medium text-dark transition-colors hover:bg-dark hover:text-white md:self-auto"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
            </svg>
            {button.label}
          </a>
        )}
      </SectionHead>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {photos.map((photo, i) => (
            <figure key={i} className="m-0 flex flex-col gap-2">
              <span className="relative block aspect-4/5 overflow-hidden rounded-sm bg-[#EFE8DE]">
                <Image src={photo.image} alt={photo.caption} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover object-top" />
              </span>
              {photo.caption && <figcaption className="text-[13px] text-[#6B6B6B]">{photo.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      {quotes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {quotes.map((review, i) => (
            <blockquote key={i} className="m-0 flex flex-col gap-3.5 rounded-md border border-[#E8DFD3] bg-white p-6 md:p-7">
              <span role="img" aria-label="5 out of 5 stars" className="flex gap-0.5 text-[#B07A1A]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={16} fill="currentColor" strokeWidth={0} aria-hidden />
                ))}
              </span>
              <p className="text-lg leading-snug text-dark">{review.quote}</p>
              <footer className="text-[13px] text-[#6B6B6B]">
                {[review.name, review.product].filter(Boolean).join(" · ")}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </section>
  );
}
