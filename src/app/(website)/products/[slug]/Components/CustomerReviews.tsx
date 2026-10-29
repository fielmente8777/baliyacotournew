"use client";

import { useState } from "react";

import Link from "next/link";
import type { Review } from "@/@types/review";
import ReviewCard from "./ReviewCard";
import StarRating from "./StarRating";

/**
 * Reviews come from Shopify (Product Review metaobjects). A product with none
 * yet shows the demo reviews below instead; the moment it gets a real one,
 * only real reviews show for it.
 *
 * The demo set is four different customers with different words, ratings and
 * dates, and the count shown is the number listed — an earlier version
 * repeated one reviewer four times under "20 reviews", which read as fake.
 *
 * Switch demos off everywhere with NEXT_PUBLIC_DEMO_REVIEWS=false once real
 * reviews are coming in.
 */
const SHOW_DEMO_REVIEWS = process.env.NEXT_PUBLIC_DEMO_REVIEWS !== "false";

const DEMO_REVIEWS: Review[] = [
  {
    id: "demo-1",
    title: "Perfect fit and stunning quality",
    rating: 5,
    reviewerName: "Khushi Gaur",
    createdAt: "2026-09-14",
    body: "The fit is exactly right, and the fabric feels far more premium than I expected. The embroidery is neat and even all the way round. I wore it to my cousin's mehendi and got asked where it was from all evening.",
    images: ["/review-1.png", "/review-2.png"],
  },
  {
    id: "demo-2",
    title: "Lovely colour, true to the photos",
    rating: 4.5,
    reviewerName: "Ananya Sharma",
    createdAt: "2026-08-27",
    body: "The colour is just like the pictures and the dupatta drapes beautifully. Delivery took a few days longer than I hoped, but it was worth the wait.",
    images: [],
  },
  {
    id: "demo-3",
    title: "Comfortable for a long day",
    rating: 4,
    reviewerName: "Priya Malhotra",
    createdAt: "2026-07-19",
    body: "Soft, breathable and easy to wear for hours. I'd suggest checking the size chart carefully; I went one size up and it's perfect.",
    images: [],
  },
  {
    id: "demo-4",
    title: "Beautiful finishing",
    rating: 5,
    reviewerName: "Simran Kaur",
    createdAt: "2026-06-02",
    body: "Every seam is finished properly and the zari work catches the light really nicely. Already planning my next order.",
    images: ["/review-2.png"],
  },
];

/** The reviews a product shows: its real ones, or the demos if it has none. */
export const reviewsToShow = (real: Review[]): Review[] =>
  real.length > 0 ? real : SHOW_DEMO_REVIEWS ? DEMO_REVIEWS : [];

const PAGE = 4;

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

export { StarRating };

export default function CustomerReviews({ reviews: real }: { reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false);

  /* Real reviews win; demos only stand in for a product that has none. */
  const reviews = reviewsToShow(real);
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const count = reviews.length;
  const visible = showAll ? reviews : reviews.slice(0, PAGE);

  /* How many reviews gave each star rating, 5 down to 1 (half stars round up). */
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const n = reviews.filter((r) => Math.min(5, Math.max(1, Math.round(r.rating))) === stars).length;
    return { stars, n, percent: (n / count) * 100 };
  });

  return (
    <section className="mx-auto max-w-320 px-4 pb-16 md:px-10 md:pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B6E54] md:text-xs">From our customers</p>
      <h2 className="mt-2 text-2xl font-medium text-dark md:text-3xl">Customer Reviews</h2>

      <div className="mt-7 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
        {/* Summary: the average, the spread, and where reviews come from. */}
        <aside className="h-fit rounded-md border border-[#E8DFD3] bg-white p-6 lg:sticky lg:top-6">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-semibold leading-none text-dark">{average.toFixed(1)}</span>
            <span className="pb-1 text-sm text-[#6B6B6B]">out of 5</span>
          </div>
          <StarRating value={average} className="mt-3 text-xl" />
          <p className="mt-1.5 text-sm text-[#6B6B6B]">
            Based on <b className="text-dark">{count}</b> {count === 1 ? "review" : "reviews"}
          </p>

          <ul className="mt-5 space-y-2">
            {breakdown.map(({ stars, n, percent }) => (
              <li key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-7 shrink-0 text-[#6B6B6B]">{stars}★</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1EDE6]">
                  <span className="block h-full rounded-full bg-[#426340]" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-5 shrink-0 text-right text-[#6B6B6B]">{n}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-md bg-[#FAF7F2] p-4">
            <p className="text-sm font-semibold text-dark">Bought this?</p>
            <p className="mt-1 text-[13px] leading-snug text-[#6B6B6B]">
              Share how it fits and feels. You can review it from your orders once it&apos;s delivered.
            </p>
            <Link href="/my-account/orders" className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-secondary underline underline-offset-4">
              Go to my orders
            </Link>
          </div>
        </aside>

        <div>
          <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
            {visible.map((review) => (
              <ReviewCard
                key={review.id}
                title={review.title || "Verified purchase"}
                rating={review.rating}
                user={review.reviewerName}
                date={formatDate(review.createdAt)}
                review={review.body ?? ""}
                images={review.images}
                verified={Boolean(review.orderId)}
              />
            ))}
          </div>

          {reviews.length > PAGE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-6 inline-flex min-h-11 items-center rounded-full border border-dark px-7 text-sm font-medium text-dark transition-colors hover:bg-dark hover:text-white"
            >
              {showAll ? "Show fewer reviews" : `View all ${count} reviews`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
