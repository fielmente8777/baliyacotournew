'use client';

import { Star } from 'lucide-react';

interface Props {
  rating: number;
  /** "Edit a review" once one exists, "Add a review" when it doesn't. */
  action: string;
  onAction?: () => void;
}

export default function OrderRating({ rating, action, onAction }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-1.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={17}
            className={i < rating ? 'fill-[#D4A017] text-[#D4A017]' : 'fill-none text-[#C9C9C9]'}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAction}
        className="text-[13px] font-medium text-[#A52C45] hover:underline"
      >
        {action}
      </button>
    </div>
  );
}
