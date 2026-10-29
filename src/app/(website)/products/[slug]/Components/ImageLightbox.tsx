"use client";

/**
 * Full-screen photo viewer, opened by tapping a product photo.
 *
 * Tap or click the photo to zoom in 2.5×, then move the pointer or drag a
 * finger to look around; tap again to zoom out. Swipe or use the arrows to
 * change photo. Escape, the close button or the back of the photo closes it.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

import { cn } from "@/lib/format";

export default function ImageLightbox({
  images,
  start,
  onClose,
  onChange,
}: {
  images: { src: string; alt: string }[];
  start: number;
  onClose: () => void;
  /** Reports the photo shown, so the page gallery matches on close. */
  onChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(start);
  const [zoomed, setZoomed] = useState(false);
  /* Where the zoom is centred, in % of the photo. */
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const touch = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const count = images.length;
  const current = images[index];

  const go = (step: 1 | -1) => {
    setZoomed(false);
    setIndex((i) => {
      const next = (i + step + count) % count;
      onChange?.(next);
      return next;
    });
  };

  /* Keys, scroll lock and focus — once, while open. */
  const goRef = useRef(go);
  const closeFn = useRef(onClose);
  useEffect(() => {
    goRef.current = go;
    closeFn.current = onClose;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFn.current();
      if (e.key === "ArrowRight") goRef.current(1);
      if (e.key === "ArrowLeft") goRef.current(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const pointAt = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOrigin({
      x: Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - r.top) / r.height) * 100)),
    });
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Product photos" className="fixed inset-0 z-[10000] flex animate-fade-in flex-col bg-[#FAF7F2]">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <span className="text-sm text-[#6B6B6B]">
          {index + 1} / {count}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className="flex size-11 items-center justify-center rounded-full text-dark transition hover:bg-[#F1EDE6]"
          >
            {zoomed ? <ZoomOut size={20} aria-hidden /> : <ZoomIn size={20} aria-hidden />}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-full text-dark transition hover:bg-[#F1EDE6]"
          >
            <X size={22} aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className={cn("relative mx-auto h-full max-w-5xl touch-none overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
          onClick={(e) => {
            if (touch.current?.moved) return;
            pointAt(e.clientX, e.clientY, e.currentTarget);
            setZoomed((z) => !z);
          }}
          onMouseMove={(e) => zoomed && pointAt(e.clientX, e.clientY, e.currentTarget)}
          onTouchStart={(e) => {
            touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, moved: false };
          }}
          onTouchMove={(e) => {
            const t = touch.current;
            if (!t) return;
            const dx = e.touches[0].clientX - t.x;
            if (Math.abs(dx) > 8) t.moved = true;
            /* Zoomed: the finger pans. Not zoomed: it's a swipe (handled on end). */
            if (zoomed) pointAt(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
          }}
          onTouchEnd={(e) => {
            const t = touch.current;
            if (t && !zoomed && count > 1) {
              const dx = e.changedTouches[0].clientX - t.x;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            }
            /* Let the click that follows a swipe or pan be ignored. */
            setTimeout(() => (touch.current = null), 0);
          }}
        >
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            sizes="100vw"
            priority
            draggable={false}
            style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
            className={cn(
              "select-none object-contain transition-transform duration-300 ease-out",
              zoomed ? "scale-250" : "scale-100"
            )}
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-dark shadow-md transition hover:bg-white md:left-6 md:size-12"
            >
              <ChevronLeft size={22} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-dark shadow-md transition hover:bg-white md:right-6 md:size-12"
            >
              <ChevronRight size={22} aria-hidden />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="scrollbar-none flex justify-center gap-2.5 overflow-x-auto px-4 py-3">
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              onClick={() => {
                setZoomed(false);
                setIndex(i);
                onChange?.(i);
              }}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-3/4 w-12 shrink-0 overflow-hidden rounded-sm bg-[#F1EDE6] transition md:w-14",
                i === index ? "ring-2 ring-secondary ring-offset-2 ring-offset-[#FAF7F2]" : "opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img.src} alt="" fill sizes="56px" className="object-cover object-top" />
            </button>
          ))}
        </div>
      )}

      <p className="pb-3 text-center text-xs text-[#8A8A8A] md:hidden">
        {zoomed ? "Drag to look around · tap to zoom out" : "Tap to zoom · swipe for more"}
      </p>
    </div>,
    document.body
  );
}
