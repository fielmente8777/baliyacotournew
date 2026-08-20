import Image from 'next/image';

import type { Order } from '../pageData';

import OrderRating from './OrderRating';
import OrderReview from './OrderReview';
import OrderTimeline from './OrderTimeline';

interface Props {
  order: Order;
}

/**
 * Layout note: only the title/price/status row is indented beside the
 * thumbnail. The timeline, review box and photo strip are siblings of
 * that row, so they span the full card width and align to the image's
 * left edge — which is what Order History-1 and -5 show.
 */
export default function OrderCard({ order }: Props) {
  return (
    <article className="px-5 py-6  md:px-6">
      <div className="flex gap-4">
        <Image
          src={order.image}
          alt={order.productName}
          width={149}
          height={160}
          className=" shrink-0 object-cover"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-[15px] text-[#222]">{order.productName}</h3>
              <p className="mt-1 text-[15px] font-semibold text-[#222]">{order.price}</p>
            </div>

            <div className="sm:text-right">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-[#222] sm:justify-end">
                <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#4C7A4E]" />
                {order.statusTitle}
              </p>

              <p className="mt-1 text-[13px] text-[#6B6B6B]">{order.statusDescription}</p>
            </div>
          </div>

          {/* Stars sit beside the thumbnail, below the title block. */}
          {order.review && (
            <div className="mt-auto pt-5">
              <OrderRating rating={order.review.rating} action={order.review.action} />
            </div>
          )}
        </div>
      </div>

      {order.timeline && <OrderTimeline items={order.timeline} />}

      {order.review?.title && <OrderReview review={order.review} />}
    </article>
  );
}
