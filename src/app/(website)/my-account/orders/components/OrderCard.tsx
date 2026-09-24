'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import type { OrderLineView } from '../orderView';

import OrderRating from './OrderRating';
import OrderReview from './OrderReview';
import OrderTimeline from './OrderTimeline';
import ReviewModal from './ReviewModal';

interface Props {
  order: OrderLineView;
}

/**
 * Layout note: only the title/price/status row is indented beside the
 * thumbnail. The timeline, review box and photo strip are siblings of
 * that row, so they span the full card width and align to the image's
 * left edge — which is what Order History-1 and -5 show.
 */
const STAGE_DOT: Record<OrderLineView['stage'], string> = {
  active: 'bg-[#C98A2B]',
  delivered: 'bg-[#4C7A4E]',
  cancelled: 'bg-[#B3261E]',
};

export default function OrderCard({ order }: Props) {
  const [isReviewOpen, setReviewOpen] = useState(false);

  return (
    <article className="px-4 py-5 transition-colors duration-300 hover:bg-[#FDFCFA] sm:px-5 sm:py-6 md:px-6">
      <div className="flex gap-3 sm:gap-4">
        <Link href={order.detailHref} className="group shrink-0 overflow-hidden" aria-label={`View order for ${order.productName}`}>
        <Image
          src={order.image}
          alt={order.productName}
          width={149}
          height={160}
          sizes="(min-width: 640px) 149px, 96px"
          className="h-[128px] w-24 shrink-0 object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[160px] sm:w-[149px]"
        />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="break-words text-sm text-[#222] sm:text-[15px]">
                <Link href={order.detailHref} className="transition-colors hover:text-[#A52C45]">
                  {order.productName}
                </Link>
              </h3>
              <p className="mt-1 text-[15px] font-semibold text-[#222]">{order.price}</p>
            </div>

            <div className="sm:text-right">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-[#222] sm:justify-end">
                <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${STAGE_DOT[order.stage]}`} />
                {order.statusTitle}
              </p>

              <p className="mt-1 break-words text-[12px] leading-relaxed text-[#6B6B6B] sm:text-[13px]">{order.statusDescription}</p>

              <Link
                href={order.detailHref}
                className="mt-2 inline-flex items-center gap-0.5 text-[13px] font-medium text-[#A52C45] transition-[gap] duration-300 hover:gap-1.5"
              >
                View details
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Stars sit beside the thumbnail, below the title block. Offered
              only once delivered — the API rejects anything earlier. */}
          {order.isDelivered && (
            <div className="mt-auto pt-5">
              <OrderRating
                rating={order.review?.rating ?? 0}
                action={order.review ? 'Edit a review' : 'Add a review'}
                onAction={() => setReviewOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {order.timeline.length > 0 && <OrderTimeline items={order.timeline} />}

      {order.review?.title && (
        <OrderReview
          review={{
            rating: order.review.rating,
            action: 'Edit a review',
            title: order.review.title,
            description: order.review.body,
            images: order.review.images,
          }}
        />
      )}

      <ReviewModal
        open={isReviewOpen}
        onClose={() => setReviewOpen(false)}
        orderId={order.orderId}
        productId={order.productId}
        customDesignId={order.customDesignId}
        productName={order.productName}
        existing={order.review}
      />
    </article>
  );
}
