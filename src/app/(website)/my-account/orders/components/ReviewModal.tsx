'use client';

/**
 * Write or edit a review, as a modal over Order History.
 *
 * Styling matches the existing cards — same greys, same maroon, same type
 * scale — so it reads as part of the page rather than a bolted-on dialog.
 */

import { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';

import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from '@/store/api/reviewApi';
import type { Review } from '@/@types/review';

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string;
  productId?: string;
  customDesignId?: string;
  productName: string;
  /** Present when editing; absent when writing the first one. */
  existing?: Review;
}

export default function ReviewModal({
  open,
  onClose,
  orderId,
  productId,
  customDesignId,
  productName,
  existing,
}: Props) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [error, setError] = useState<string | null>(null);

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const isSaving = isCreating || isUpdating;

  /* Reset when reopened for a different order, or the previous one's text
     would appear under the wrong product. */
  useEffect(() => {
    if (!open) return;
    setRating(existing?.rating ?? 0);
    setTitle(existing?.title ?? '');
    setBody(existing?.body ?? '');
    setError(null);
  }, [open, existing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    /* Stop the page behind scrolling while the dialog is open. */
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = async () => {
    if (rating === 0) return setError('Please choose a rating.');
    setError(null);

    try {
      if (existing) {
        await updateReview({
          id: existing._id,
          body: { rating, title: title.trim() || undefined, body: body.trim() || undefined },
        }).unwrap();
      } else {
        await createReview({
          orderId,
          productId,
          customDesignId,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        }).unwrap();
      }

      onClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'We could not save your review. Please try again.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Review ${productName}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-2xl bg-white sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#F2EEE8] px-5 py-4 md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-[#222]">
              {existing ? 'Edit your review' : 'Write a review'}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#8A8A8A]">{productName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#8A8A8A] transition-colors hover:text-[#222]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 md:px-6">
          <p className="text-[13px] font-medium text-[#222]">
            How was it? <span className="text-[#A52C45]">*</span>
          </p>

          <div className="mt-3 flex gap-2" onMouseLeave={() => setHovered(0)}>
            {Array.from({ length: 5 }, (_, i) => {
              const value = i + 1;
              const filled = value <= (hovered || rating);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHovered(value)}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={
                      filled
                        ? 'fill-[#D4A017] text-[#D4A017]'
                        : 'fill-none text-[#C9C9C9]'
                    }
                  />
                </button>
              );
            })}
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Give it a headline (optional)"
            className="mt-5 h-11 w-full rounded-md border border-[#EAE6DF] px-3 text-sm outline-none focus:border-[#A52C45]"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 2000))}
            rows={5}
            placeholder="Tell other customers about the fit, the fabric and the finish."
            className="mt-3 w-full rounded-md border border-[#EAE6DF] p-3 text-sm outline-none focus:border-[#A52C45]"
          />

          <p className="mt-1 text-right text-[11px] text-[#9A9A9A]">
            {body.length}/2000
          </p>

          {error && <p className="mt-3 text-sm text-[#A52C45]">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#F2EEE8] px-5 py-4 sm:flex-row sm:justify-end md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-[#EAE6DF] px-6 text-sm text-[#555]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 rounded-md bg-[#A52C45] px-8 text-sm font-medium text-white disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : existing ? 'Update review' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
}
