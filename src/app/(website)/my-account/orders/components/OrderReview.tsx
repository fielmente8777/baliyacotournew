import OrderGallery from './OrderGallery';
import type { OrderReview as Review } from '../pageData';

interface Props {
  review: Review;
}

/**
 * The written review + photo strip. Rendered at card level (not inside
 * the text column) so its left edge lines up with the product image,
 * as in Order History-1.
 */
export default function OrderReview({ review }: Props) {
  return (
    <div className="mt-5">
      <div className="bg-[#9BA1B01A] px-5 py-4">
        <h4 className="text-[13px] font-semibold text-[#222]">{review.title}</h4>

        <p className="mt-1.5 max-w-4xl text-[13px] leading-6 text-[#6B6B6B]">
          {review.description}
        </p>
      </div>

      <OrderGallery images={review.images} />
    </div>
  );
}
