"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

import { cn } from "@/lib/format";
import ImageLightbox from "./ImageLightbox";

interface ImageItem {
  src: string;
  alt: string;
}

interface Props {
  images: ImageItem[];
  /** The selected variant's photo — the gallery jumps to it when it changes. */
  activeSrc?: string;
  /** Laid over the main photo's top-left corner (badges). */
  overlay?: ReactNode;
}

/** Desktop hover zoom: the pop-up shows the lens area this many times larger. */
const ZOOM = 2.5;
/** The lens, as a % of the photo — 100 / ZOOM, so lens and pop-up match. */
const LENS = 100 / ZOOM;

/**
 * Product photos.
 *
 *   Desktop  thumbnails in a column beside the photo; hovering shows a lens
 *            on the photo and the magnified area in a pop-up beside it (the
 *            arrows stay usable); clicking opens the full-screen viewer.
 *   Phones   the photo runs edge to edge; swipe for the next one; tap to open
 *            the viewer (pinch-free zoom: tap to zoom, drag to look around).
 *
 * Arrows, the counter and thumbnails only appear with more than one photo.
 */
export default function ProductGallery({ images, activeSrc, overlay }: Props) {
  const [active, setActive] = useState(0);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [viewer, setViewer] = useState(false);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);

  /* Follow the selected variant (e.g. picking a colour shows that colour).
     Adjusted during render, as React recommends for state derived from a
     changing prop, rather than in an effect. */
  const [followedSrc, setFollowedSrc] = useState<string | undefined>(undefined);
  if (activeSrc !== followedSrc) {
    setFollowedSrc(activeSrc);
    const index = activeSrc ? images.findIndex((img) => img.src === activeSrc) : -1;
    if (index >= 0) setActive(index);
  }

  const count = images.length;
  const several = count > 1;
  const shown = Math.min(active, count - 1);
  const current = images[shown];
  const go = (step: 1 | -1) => setActive((i) => (i + step + count) % count);

  const thumb = (img: ImageItem, index: number, className: string) => (
    <button
      key={`${img.src}-${index}`}
      type="button"
      onClick={() => setActive(index)}
      aria-label={`Show photo ${index + 1}`}
      aria-current={shown === index}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-sm bg-[#F1EDE6] transition",
        shown === index ? "ring-2 ring-secondary ring-offset-2 ring-offset-[#FAF7F2]" : "opacity-70 hover:opacity-100",
        className
      )}
    >
      <Image src={img.src} alt="" fill sizes="80px" className="object-cover object-top" />
    </button>
  );

  return (
    <div className={cn(several && "md:grid md:grid-cols-[64px_minmax(0,1fr)] md:gap-3 lg:grid-cols-[76px_minmax(0,1fr)] lg:gap-4")}>
      {several && (
        /* Exactly as tall as the main photo; scrolls if there are many. */
        <div className="relative hidden md:block">
          <div className="scrollbar-none absolute inset-0 flex flex-col gap-3 overflow-y-auto p-1">
            {images.map((img, i) => thumb(img, i, "aspect-3/4 w-full"))}
          </div>
        </div>
      )}

      {/* The main photo, plus (desktop) the zoom pop-up beside it — kept
          outside the photo's overflow-hidden box so it can sit over the
          details column. */}
      <div className="relative">
        {/* Edge to edge on phones (-mx-4 undoes the page padding). */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Open the photo full screen"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setViewer(true);
            }
          }}
          className="relative aspect-3/4 cursor-zoom-in overflow-hidden bg-[#F1EDE6] outline-none focus-visible:ring-2 focus-visible:ring-secondary max-md:-mx-4 md:rounded-sm"
          onClick={() => {
            if (swiped.current) return;
            setLens(null);
            setViewer(true);
          }}
          onPointerMove={(e) => {
            /* Mouse on a wide screen only, and never over the arrows — they
               must stay visible and clickable. */
            const overControl = (e.target as HTMLElement).closest("button");
            if (e.pointerType !== "mouse" || overControl || !window.matchMedia("(min-width: 1024px)").matches) {
              if (lens) setLens(null);
              return;
            }
            const r = e.currentTarget.getBoundingClientRect();
            /* The lens centre, kept far enough in that the lens stays on the photo. */
            const half = LENS / 2;
            setLens({
              x: Math.min(100 - half, Math.max(half, ((e.clientX - r.left) / r.width) * 100)),
              y: Math.min(100 - half, Math.max(half, ((e.clientY - r.top) / r.height) * 100)),
            });
          }}
          onPointerLeave={() => setLens(null)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
            swiped.current = false;
          }}
          onTouchEnd={(e) => {
            if (!several || touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) {
              swiped.current = true;
              go(dx < 0 ? 1 : -1);
              setTimeout(() => (swiped.current = false), 0);
            }
            touchX.current = null;
          }}
        >
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="animate-fade-in object-cover object-top"
            priority
          />

          {/* The lens: the square that's shown magnified in the pop-up. */}
          {lens && (
            <span
              aria-hidden
              className="pointer-events-none absolute border border-white/90 bg-white/25 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]"
              style={{
                width: `${LENS}%`,
                height: `${LENS}%`,
                left: `${lens.x - LENS / 2}%`,
                top: `${lens.y - LENS / 2}%`,
              }}
            />
          )}

          {overlay && (
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">{overlay}</div>
          )}

          {several && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#FAF7F2]/95 text-dark shadow-md transition hover:bg-white md:flex"
              >
                <ChevronLeft size={20} aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#FAF7F2]/95 text-dark shadow-md transition hover:bg-white md:flex"
              >
                <ChevronRight size={20} aria-hidden />
              </button>
            </>
          )}

          {/* Counter and the open-viewer button share the bottom-right corner. */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            {several && (
              <span className="pointer-events-none rounded-full bg-dark/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {shown + 1} / {count}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewer(true);
              }}
              aria-label="View full screen"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-dark/70 text-white backdrop-blur-sm transition hover:bg-dark"
            >
              <Expand size={15} aria-hidden />
            </button>
          </div>
        </div>

        {/* Desktop zoom pop-up: the lens area at ZOOM×, beside the photo. */}
        {lens && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-[calc(100%+1.5rem)] top-0 z-30 hidden aspect-3/4 w-full animate-fade-in overflow-hidden rounded-sm border border-[#E8DFD3] bg-white bg-no-repeat shadow-[0_24px_60px_-20px_rgba(34,34,34,0.45)] lg:block"
            style={{
              backgroundImage: `url("${current.src}")`,
              backgroundSize: `${ZOOM * 100}%`,
              backgroundPosition: `${((lens.x - LENS / 2) / (100 - LENS)) * 100}% ${((lens.y - LENS / 2) / (100 - LENS)) * 100}%`,
            }}
          />
        )}
      </div>

      {several && (
        /* Phones: a thumbnail row under the edge-to-edge photo. */
        <div className="scrollbar-none mt-3 flex gap-2.5 overflow-x-auto p-1 md:hidden">
          {images.map((img, i) => thumb(img, i, "aspect-3/4 w-14"))}
        </div>
      )}

      {viewer && (
        <ImageLightbox images={images} start={shown} onClose={() => setViewer(false)} onChange={setActive} />
      )}
    </div>
  );
}
