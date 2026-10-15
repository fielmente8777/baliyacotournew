"use client";

import { useState } from "react";

import { SectionWithContainer } from "@/components/sectionComponants";
import type { Review } from "@/@types/review";
import ReviewCard from "./ReviewCard";

/**
 * Reviews come from Shopify (Product Review metaobjects). A product with
 * none yet shows the demo reviews below instead.
 *
 * Demo reviews are not from real customers, so they are switched off with
 * NEXT_PUBLIC_DEMO_REVIEWS=false once real reviews start coming in.
 */
const SHOW_DEMO_REVIEWS = process.env.NEXT_PUBLIC_DEMO_REVIEWS !== "false";

const DEMO_REVIEWS: Review[] = [
  {
    id: "demo-1",
    title: "Perfect Fit and Stunning Quality!",
    rating: 4.5,
    reviewerName: "Khushi Gaur",
    createdAt: "2026-06-09",
    body: "I recently purchased a corset set from this shop, and I couldn't be more thrilled! The fit is absolutely perfect hugging my curves in all the right places without feeling too tight or uncomfortable.",
    images: ["/review-1.png", "/review-2.png", "/review-1.png"],
  },
  ...["2026-05-10", "2026-04-22", "2026-03-15"].map((date, i) => ({
    id: `demo-${i + 2}`,
    title: "Perfect Fit and Stunning Quality!",
    rating: 4.5,
    reviewerName: "Khushi Gaur",
    createdAt: date,
    body: "I recently purchased a corset set from this shop, and I couldn't be more thrilled! The fit is absolutely perfect.",
    images: [],
  })),
];

const PAGE = 4;

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

export default function CustomerReviews({ reviews }: { reviews: Review[] }) {
  const [showAll, setShowAll] = useState(false);

  const list = reviews.length > 0 ? reviews : SHOW_DEMO_REVIEWS ? DEMO_REVIEWS : [];
  if (list.length === 0) return null;

  const isDemo = reviews.length === 0;
  const average = isDemo ? 4.5 : list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  const count = isDemo ? 20 : list.length;
  const visible = showAll ? list : list.slice(0, PAGE);

  return (
    <SectionWithContainer>

      <h2 className="text-4xl font-semibold">
        Customer reviews and ratings
      </h2>

      <div className="mt-6 flex flex-wrap items-center gap-8 border-b pb-6">

        <p className="text-lg">
          Average Rating Received
        </p>

        <div className="flex items-center gap-2">

          <span className="text-2xl font-bold">
            {average.toFixed(1)}
          </span>

          <span className="text-[#426340] text-2xl" aria-label={`${average.toFixed(1)} out of 5`}>
            {"★".repeat(Math.round(average))}
            <span className="text-[#C9C9C9]">{"★".repeat(5 - Math.round(average))}</span>
          </span>

        </div>

        <p className="text-2xl">
         <b> {count}</b> {count === 1 ? "Review" : "Reviews"} Received
        </p>

      </div>

      {visible.map((review) => (
        <ReviewCard
          key={review.id}
          title={review.title || "Verified purchase"}
          rating={review.rating}
          user={review.reviewerName}
          date={formatDate(review.createdAt)}
          review={review.body ?? ""}
          images={review.images}
        />
      ))}

      {list.length > PAGE && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-10 rounded border border-[#8D2F46] px-8 py-3 text-[#8D2F46] transition hover:bg-[#8D2F46] hover:text-white"
        >
          {showAll ? "Show Fewer Reviews" : "View All Reviews"}
        </button>
      )}

    </SectionWithContainer>
  );
}
