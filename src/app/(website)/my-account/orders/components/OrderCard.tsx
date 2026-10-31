'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { shortDate, type OrderLineView } from '../orderView';

import OrderRating from './OrderRating';
import OrderReview from './OrderReview';
import OrderTimeline from './OrderTimeline';
import ReviewModal from './ReviewModal';
import StatusPill from './StatusPill';

interface Props {
  order: OrderLineView;
}

/**
 * One order line as a self-contained card: a slim strip with when it was
 * placed, then the product beside its status, then the production timeline.
 * The timeline, review box and photo strip span the full card width.
 */
export default function OrderCard({ order }: Props) {
  const [isReviewOpen, setReviewOpen] = useState(false);

  return (
    <article className="overflow-hidden rounded-lg border border-[#E8DFD3] bg-white transition-shadow duration-300 hover:shadow-[0_8px_24px_-14px_rgba(34,34,34,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#F2EEE8] bg-[#FAF8F4] px-4 py-2.5 text-xs text-[#6B6B6B] sm:px-5">
        <p>
          Placed on <span className="font-medium text-dark">{shortDate(order.placedAt)}</span>
        </p>
        <p className="uppercase tracking-wider text-[#8A8A8A]">
          {order.source === 'custom' ? 'Custom design' : 'Ready to wear'}
        </p>
      </div>

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex gap-3 sm:gap-4">
          <Link href={order.detailHref} className="group shrink-0 overflow-hidden rounded" aria-label={`View order for ${order.productName}`}>
            <Image
              src={order.image}
              alt={order.productName}
              width={120}
              height={150}
              sizes="(min-width: 640px) 120px, 88px"
              className="h-[112px] w-[88px] object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[150px] sm:w-[120px]"
            />
          </Link>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h3 className="break-words text-sm text-[#222] sm:text-[15px]">
                  <Link href={order.detailHref} className="transition-colors hover:text-secondary">
                    {order.productName}
                  </Link>
                </h3>
                <p className="mt-1 text-[15px] font-semibold text-[#222]">{order.price}</p>
              </div>

              <div className="shrink-0">
                <StatusPill stage={order.stage} label={order.statusTitle} />
              </div>
            </div>

            <p className="mt-2 break-words text-[12px] leading-relaxed text-[#6B6B6B] sm:text-[13px]">{order.statusDescription}</p>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
              {/* Offered only once delivered — /api/reviews rejects anything
                  earlier. One review per item: once written, the stars just show it. */}
              {order.review || order.canReview ? (
                <OrderRating
                  rating={order.review?.rating ?? 0}
                  action={order.review ? undefined : 'Add a review'}
                  onAction={() => setReviewOpen(true)}
                />
              ) : (
                <span />
              )}

              <Link
                href={order.detailHref}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-secondary px-4 text-[13px] font-medium text-secondary transition hover:bg-secondary hover:text-white"
              >
                {order.stage === 'active' ? 'Track order' : 'View details'}
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {order.timeline.length > 0 && <OrderTimeline items={order.timeline} />}

        {order.review?.title && (
          <OrderReview
            review={{
              rating: order.review.rating,
              action: '',
              title: order.review.title,
              description: order.review.body ?? '',
              images: order.review.images,
            }}
          />
        )}
      </div>

      {isReviewOpen && order.canReview && !order.review && (
        <ReviewModal
          open
          onClose={() => setReviewOpen(false)}
          orderId={order.orderId}
          orderNumber={order.orderNumber}
          productId={order.productId}
          productName={order.productName}
          productImage={order.image}
        />
      )}
    </article>
  );
}
