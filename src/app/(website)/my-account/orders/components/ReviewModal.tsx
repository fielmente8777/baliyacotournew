'use client';

/**
 * Mounted only while open (see OrderCard), so every opening starts with an
 * empty form.
 *
 * "Add review" popup over Order History — offered once a Shopify item is
 * delivered. The review is saved to Shopify (a Product Review metaobject)
 * through /api/reviews, which re-checks the delivery server-side.
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CirclePlus, Star, X } from 'lucide-react';

import { useCreateReviewMutation } from '@/store/api/reviewApi';
import { fileToResizedBase64 } from '@/lib/imageResize';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Shopify Order GID. */
  orderId: string;
  /** "#1001" */
  orderNumber?: string;
  /** Shopify Product GID. */
  productId?: string;
  productName: string;
  productImage: string;
}

const PHOTO_SLOTS = 2;
/** Long edge for uploaded review photos — sharp on a phone, small to send. */
const PHOTO_MAX_PX = 1600;

export default function ReviewModal({ open, onClose, orderId, orderNumber, productId, productName, productImage }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<(string | null)[]>(Array(PHOTO_SLOTS).fill(null));
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [createReview, { isLoading: isSaving }] = useCreateReviewMutation();

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

  const pickPhoto = async (slot: number, file: File) => {
    setError(null);
    try {
      const base64 = await fileToResizedBase64(file, PHOTO_MAX_PX);
      setPhotos((cur) => cur.map((p, i) => (i === slot ? base64 : p)));
    } catch {
      setError('We could not read that photo. Please try another one.');
    }
  };

  const handleSave = async () => {
    if (!productId) return setError('This item cannot be reviewed.');
    if (rating === 0) return setError('Please choose a star rating.');
    /* Review Body is a required field on the Shopify definition. */
    if (!body.trim()) return setError('Please write a few words about the product.');
    setError(null);

    try {
      await createReview({
        orderId,
        productId,
        rating,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        images: photos.filter((p): p is string => Boolean(p)),
      }).unwrap();
      onClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } }).data?.message;
      setError(message ?? 'We could not save your review. Please try again.');
    }
  };

  /* Rendered into <body>: the account page's fade-in animates `transform`,
     which turns its wrapper into the containing block for position:fixed —
     inside it the popup was placed at the bottom of the list, cut off. */
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Add review for ${productName}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-[22rem] overflow-y-auto rounded-t-2xl bg-white px-5 py-6 sm:max-w-sm sm:rounded-lg sm:px-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold text-[#222]">Add review</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#444] transition-colors hover:text-[#222]">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 flex items-start gap-3">
          <Image
            src={productImage}
            alt={productName}
            width={52}
            height={56}
            className="h-14 w-[52px] shrink-0 rounded-sm object-cover"
          />
          <div className="min-w-0">
            {orderNumber && <p className="text-[11px] text-[#6B6B6B]">{orderNumber}</p>}
            <p className="mt-0.5 break-words text-[13px] text-[#222]">{productName}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-1.5" onMouseLeave={() => setHovered(0)} role="radiogroup" aria-label="Rating">
          {Array.from({ length: 5 }, (_, i) => {
            const value = i + 1;
            const filled = value <= (hovered || rating);
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
                className="transition-transform hover:scale-110"
              >
                <Star size={26} className={filled ? 'fill-[#D4A017] text-[#D4A017]' : 'fill-none text-[#C9C9C9]'} />
              </button>
            );
          })}
          {rating > 0 && <span className="ml-2 text-[12px] text-[#6B6B6B]">{rating}/5</span>}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Enter your review in brief"
          className="mt-4 h-10 w-full rounded-md border border-[#E3E3E3] px-3 text-[13px] outline-none placeholder:text-[#9A9A9A] focus:border-[#A52C45]"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, 2000))}
          rows={5}
          placeholder="Enter your review in detail"
          className="mt-4 w-full resize-none rounded-md border border-[#E3E3E3] p-3 text-[13px] outline-none placeholder:text-[#9A9A9A] focus:border-[#A52C45]"
        />

        <h3 className="mt-5 text-[17px] font-medium text-[#222]">Upload product photos</h3>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {photos.map((photo, slot) => (
            <div key={slot} className="relative">
              <button
                type="button"
                onClick={() => fileRefs.current[slot]?.click()}
                aria-label={photo ? `Replace photo ${slot + 1}` : `Add photo ${slot + 1}`}
                className="flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-sm border border-dashed border-[#D5D5D5] text-[#444] transition-colors hover:border-[#A52C45]"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`data:image/jpeg;base64,${photo}`} alt={`Photo ${slot + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <CirclePlus size={20} strokeWidth={1.5} />
                )}
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhotos((cur) => cur.map((p, i) => (i === slot ? null : p)))}
                  aria-label={`Remove photo ${slot + 1}`}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-[#444] shadow"
                >
                  <X size={12} />
                </button>
              )}
              <input
                ref={(el) => {
                  fileRefs.current[slot] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) pickPhoto(slot, file);
                  e.target.value = '';
                }}
              />
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-[13px] text-[#A52C45]">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-5 h-10 w-full rounded-md bg-[#A52C45] text-[13px] font-medium text-white transition-opacity disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save Review'}
        </button>
      </div>
    </div>,
    document.body,
  );
}
