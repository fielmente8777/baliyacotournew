"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";

import ImageLightbox from "./ImageLightbox";
import StarRating from "./StarRating";

interface ReviewCardProps {
  title: string;
  rating: number;
  user: string;
  date: string;
  review: string;
  images?: string[];
  /** Written from an order — shown as "Verified purchase". */
  verified?: boolean;
}

/** Long reviews fold after this many characters. */
const CLAMP = 260;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function ReviewCard({ title, rating, user, date, review, images = [], verified }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const long = review.length > CLAMP;

  return (
    <article className="flex flex-col gap-4 rounded-md border border-[#E8DFD3] bg-white p-5 md:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F1EDE6] text-sm font-semibold text-secondary">
            {initials(user) || "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-dark">{user}</p>
            {verified ? (
              <p className="flex items-center gap-1 text-xs text-[#426340]">
                <BadgeCheck size={13} aria-hidden /> Verified purchase
              </p>
            ) : (
              date && <p className="text-xs text-[#8A8A8A]">{date}</p>
            )}
          </div>
        </div>
        {verified && date && <span className="shrink-0 text-xs text-[#8A8A8A]">{date}</span>}
      </header>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StarRating value={rating} className="text-[15px]" />
          <span className="text-sm font-semibold text-dark">{title}</span>
        </div>

        {review && (
          <p className="mt-2 text-[15px] leading-7 text-[#555]">
            {long && !expanded ? `${review.slice(0, CLAMP).trimEnd()}…` : review}
            {long && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="ml-1.5 text-sm font-medium text-secondary underline underline-offset-4"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setViewing(index)}
              aria-label={`View photo ${index + 1} from ${user}`}
              className="relative size-20 overflow-hidden rounded-sm bg-[#F1EDE6] transition hover:opacity-90 md:size-24"
            >
              <Image src={img} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {viewing !== null && (
        <ImageLightbox
          images={images.map((src, i) => ({ src, alt: `Photo ${i + 1} from ${user}` }))}
          start={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </article>
  );
}
