import { SectionWithContainer } from "@/components/sectionComponants";
import ReviewCard from "./ReviewCard";

export default function CustomerReviews() {
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
            4.5
          </span>

          <span className="text-[#426340] text-2xl">
            ★★★★★
          </span>

        </div>

        <p className="text-2xl">
         <b> 20</b> Reviews Received
        </p>

      </div>

      <ReviewCard
        title="Perfect Fit and Stunning Quality!"
        rating={4.5}
        user="Khushi Gaur"
        date="9 June 2026"
        review="I recently purchased a corset set from this shop, and I couldn't be more thrilled! The fit is absolutely perfect hugging my curves in all the right places without feeling too tight or uncomfortable."
        images={[
          "/review-1.png",
          "/review-2.png",
          "/review-1.png",
        ]}
      />

      <ReviewCard
        title="Perfect Fit and Stunning Quality!"
        rating={4.5}
        user="Khushi Gaur"
        date="10 May 2026"
        review="I recently purchased a corset set from this shop, and I couldn't be more thrilled! The fit is absolutely perfect."
      />

      <ReviewCard
        title="Perfect Fit and Stunning Quality!"
        rating={4.5}
        user="Khushi Gaur"
        date="22 April 2026"
        review="I recently purchased a corset set from this shop, and I couldn't be more thrilled! The fit is absolutely perfect."
      />

      <ReviewCard
        title="Perfect Fit and Stunning Quality!"
        rating={4.5}
        user="Khushi Gaur"
        date="15 March 2026"
        review="I recently purchased a corset set from this shop, and I couldn't be more thrilled! The fit is absolutely perfect."
      />

      <button className="mt-10 rounded border border-[#8D2F46] px-8 py-3 text-[#8D2F46] transition hover:bg-[#8D2F46] hover:text-white">
        View All Reviews
      </button>

    </SectionWithContainer>
  );
}