'use client';

/**
 * What a customer can DO with an order, below the order details:
 *
 *   CancelSection          — before production (custom) / before dispatch (Shopify)
 *   ShopifyReturnSection   — ready-to-wear: request a replacement or refund
 *   ReplacementSection     — custom designs: request an alteration or remake
 *
 * The backend decides eligibility (canCancel, canRequestReturn,
 * canRequestReplacement); these only render when it says yes, and show the
 * server's own message when a request is refused.
 */

import { useState } from 'react';
import { ImagePlus, RefreshCcw, Undo2, X } from 'lucide-react';

import type {
  ReplacementReason,
  ReplacementRequest,
  ReplacementType,
  ShopifyOrder,
  ShopifyReturnReason,
} from '@/@types/order';
import { fileToResizedBase64 } from '@/lib/imageResize';
import {
  apiErrorMessage,
  useGetOrderReplacementsQuery,
  useRequestReplacementMutation,
  useRequestShopifyReturnMutation,
} from '@/store/api/orderApi';
import { shortDate } from '../../app/(website)/my-account/orders/orderView';

const fieldClass =
  'w-full rounded-md border border-[#DDD6CC] bg-white px-3 py-2 text-sm text-[#222] outline-none transition focus:border-[#A52C45]';
const primaryClass =
  'h-10 rounded-md bg-[#A52C45] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60';
const secondaryClass =
  'h-10 rounded-md border border-[#DDD6CC] px-5 text-sm text-[#444] transition hover:bg-white';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-[#E9E4DC] px-4 py-5 sm:px-6">{children}</div>;
}

function Success({ title, message }: { title: string; message: string }) {
  return (
    <div className="animate-fade-in rounded-lg bg-[#E8F1E8] p-4 text-sm text-[#2F5E31]">
      <p className="font-semibold">{title}</p>
      <p className="mt-0.5">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ cancel */

interface CancelProps {
  /** One line under the button: what cancelling does. */
  note: string;
  onCancel: (reason: string) => Promise<unknown>;
  busy: boolean;
  error: unknown;
}

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Found a better price',
  'Delivery is taking too long',
  'Want to change size or design',
  'Other',
];

export function CancelSection({ note, onCancel, busy, error }: CancelProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);

  return (
    <Wrapper>
      {!open ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-[#9B1C14] underline underline-offset-2"
          >
            Cancel this order
          </button>
          <p className="mt-1 text-xs text-[#8A8A8A]">{note}</p>
        </>
      ) : (
        <div className="animate-slide-down rounded-lg border border-[#F1D4D2] bg-[#FDF6F5] p-4">
          <p className="text-sm font-medium text-[#222]">Why are you cancelling?</p>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${fieldClass} mt-2 max-w-sm`}>
            {CANCEL_REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <p className="mt-3 text-sm text-[#555]">{note} This can&apos;t be undone.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                try {
                  await onCancel(reason);
                  setOpen(false);
                } catch {
                  /* shown below */
                }
              }}
              className="h-9 rounded-md bg-[#9B1C14] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? 'Cancelling…' : 'Yes, cancel order'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-md border border-[#DDD6CC] px-4 text-sm text-[#444]">
              Keep order
            </button>
          </div>
          {Boolean(error) && (
            <p className="mt-2 text-sm text-[#9B1C14]">
              {apiErrorMessage(error, "We couldn't cancel this order. Please try again.")}
            </p>
          )}
        </div>
      )}
    </Wrapper>
  );
}

/* ------------------------------------------------- Shopify return / replace */

const SHOPIFY_REASONS: { value: ShopifyReturnReason; label: string }[] = [
  { value: 'SIZE_TOO_SMALL', label: 'Too small' },
  { value: 'SIZE_TOO_LARGE', label: 'Too large' },
  { value: 'DEFECTIVE', label: 'Damaged or defective' },
  { value: 'WRONG_ITEM', label: 'Received the wrong item' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not as described' },
  { value: 'COLOR', label: 'Colour not as expected' },
  { value: 'STYLE', label: "Style doesn't suit me" },
  { value: 'UNWANTED', label: 'No longer needed' },
  { value: 'OTHER', label: 'Other' },
];

const RETURN_STATUS: Record<string, string> = {
  REQUESTED: 'Requested — awaiting approval',
  OPEN: 'Approved — send the item back',
  CLOSED: 'Completed',
  DECLINED: 'Declined',
  CANCELED: 'Withdrawn',
};

export function ShopifyReturnSection({ order }: { order: ShopifyOrder }) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState<'replacement' | 'refund'>('replacement');
  const [reason, setReason] = useState<ShopifyReturnReason>('SIZE_TOO_SMALL');
  const [note, setNote] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [request, { isLoading, error, data: created }] = useRequestShopifyReturnMutation();

  const returnable = order.items.filter((i) => i.returnableQuantity > 0);
  const chosen = Object.entries(quantities).filter(([, q]) => q > 0);

  const existing = order.returns.length > 0 && (
    <ul className="mb-4 space-y-1 text-sm">
      {order.returns.map((r) => (
        <li key={r.name} className="flex justify-between gap-3 rounded-md bg-[#FAF8F4] px-3 py-2">
          <span className="font-medium text-[#222]">Return {r.name}</span>
          <span className="text-[#6B6B6B]">{RETURN_STATUS[r.status] ?? r.status}</span>
        </li>
      ))}
    </ul>
  );

  if (created) {
    return (
      <Wrapper>
        <Success
          title={`Request ${created.name} sent`}
          message={`We'll review it within 1–2 working days and email you the next steps for your ${resolution}.`}
        />
      </Wrapper>
    );
  }

  if (!order.canRequestReturn) return existing ? <Wrapper>{existing}</Wrapper> : null;

  return (
    <Wrapper>
      {existing}
      {!open ? (
        <>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm font-medium text-[#A52C45]">
            <RefreshCcw size={15} aria-hidden="true" />
            Request a replacement or return
          </button>
          {order.returnWindowEndsAt && (
            <p className="mt-1 text-xs text-[#8A8A8A]">Available until {shortDate(order.returnWindowEndsAt)}.</p>
          )}
        </>
      ) : (
        <form
          className="animate-slide-down space-y-4 rounded-lg border border-[#EFEAE2] p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await request({
                orderId: order.id,
                body: {
                  resolution,
                  reason,
                  note: note.trim() || undefined,
                  items: chosen.map(([lineItemId, quantity]) => ({ lineItemId, quantity })),
                },
              }).unwrap();
            } catch {
              /* shown below */
            }
          }}
        >
          <fieldset>
            <legend className="text-sm font-medium text-[#222]">What would you like?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['replacement', 'refund'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                    resolution === r ? 'border-[#A52C45] bg-[#FBEFF2] text-[#A52C45]' : 'border-[#DDD6CC] text-[#444]'
                  }`}
                >
                  <input type="radio" name="resolution" className="sr-only" checked={resolution === r} onChange={() => setResolution(r)} />
                  {r === 'replacement' ? <RefreshCcw size={14} aria-hidden="true" /> : <Undo2 size={14} aria-hidden="true" />}
                  {r === 'replacement' ? 'Replacement (same item, new size)' : 'Refund'}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-[#222]">Which items?</legend>
            <ul className="mt-2 space-y-2">
              {returnable.map((item) => (
                <li key={item.lineItemId} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-[#444]">
                    {item.title}
                    {item.variantTitle && item.variantTitle !== 'Default Title' ? ` · ${item.variantTitle}` : ''}
                  </span>
                  <select
                    aria-label={`Quantity of ${item.title} to return`}
                    value={quantities[item.lineItemId] ?? 0}
                    onChange={(e) => setQuantities((q) => ({ ...q, [item.lineItemId]: Number(e.target.value) }))}
                    className={`${fieldClass} w-20`}
                  >
                    {Array.from({ length: item.returnableQuantity + 1 }).map((_, n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-[#222]">Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value as ShopifyReturnReason)} className={`${fieldClass} mt-2`}>
              {SHOPIFY_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#222]">
              {resolution === 'replacement' ? 'Which size or variant should we send?' : 'Anything else we should know?'}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={250}
              rows={3}
              placeholder={resolution === 'replacement' ? 'e.g. Please send size M instead of S' : 'Optional'}
              className={`${fieldClass} mt-2`}
            />
          </label>

          {Boolean(error) && (
            <p className="text-sm text-[#9B1C14]">{apiErrorMessage(error, "We couldn't send your request. Please try again.")}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={isLoading || chosen.length === 0} className={primaryClass}>
              {isLoading ? 'Sending…' : 'Send request'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className={secondaryClass}>
              Not now
            </button>
          </div>
        </form>
      )}
    </Wrapper>
  );
}

/* ------------------------------------------- custom-design replacement */

const CUSTOM_REASONS: { value: ReplacementReason; label: string }[] = [
  { value: 'fit_issue', label: "Doesn't fit well" },
  { value: 'not_as_designed', label: 'Not what I designed' },
  { value: 'defect', label: 'Stitching or embroidery defect' },
  { value: 'damaged', label: 'Arrived damaged' },
  { value: 'wrong_item', label: 'Received the wrong item' },
  { value: 'other', label: 'Other' },
];

const REQUEST_STATUS: Record<ReplacementRequest['status'], string> = {
  requested: 'Received — under review',
  approved: 'Approved',
  in_progress: 'In the workshop',
  completed: 'Completed',
  rejected: 'Not approved',
};

interface ReplacementProps {
  orderId: string;
  items: { name: string }[];
  canRequest: boolean;
  windowEndsAt?: string | null;
}

export function ReplacementSection({ orderId, items, canRequest, windowEndsAt }: ReplacementProps) {
  const { data: requests = [] } = useGetOrderReplacementsQuery(orderId);
  const [request, { isLoading, error }] = useRequestReplacementMutation();

  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [type, setType] = useState<ReplacementType>('alteration');
  const [reason, setReason] = useState<ReplacementReason>('fit_issue');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState('');

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setPhotoError('');
    try {
      const next = await Promise.all(Array.from(files).slice(0, 4 - photos.length).map((f) => fileToResizedBase64(f, 1200)));
      setPhotos((p) => [...p, ...next].slice(0, 4));
    } catch {
      setPhotoError("One of those photos couldn't be read — try a JPG or PNG.");
    }
  };

  if (!canRequest && requests.length === 0) return null;

  return (
    <Wrapper>
      {requests.length > 0 && (
        <ul className="mb-4 space-y-2 text-sm">
          {requests.map((r) => (
            <li key={r._id} className="rounded-md bg-[#FAF8F4] px-3 py-2">
              <div className="flex justify-between gap-3">
                <span className="font-medium text-[#222]">
                  {r.type === 'alteration' ? 'Alteration' : 'Replacement'} · {r.itemName}
                </span>
                <span className="shrink-0 text-[#6B6B6B]">{REQUEST_STATUS[r.status]}</span>
              </div>
              {r.adminNote && <p className="mt-1 text-[13px] text-[#555]">{r.adminNote}</p>}
            </li>
          ))}
        </ul>
      )}

      {sent ? (
        <Success title={`Request ${sent} received`} message="Our tailoring team will review it and contact you within 1–2 working days." />
      ) : canRequest && !open ? (
        <>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 text-sm font-medium text-[#A52C45]">
            <RefreshCcw size={15} aria-hidden="true" />
            Request an alteration or replacement
          </button>
          {windowEndsAt && <p className="mt-1 text-xs text-[#8A8A8A]">Available until {shortDate(windowEndsAt)}.</p>}
        </>
      ) : canRequest ? (
        <form
          className="animate-slide-down space-y-4 rounded-lg border border-[#EFEAE2] p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const created = await request({
                orderId,
                body: { itemIndex, type, reason, description: description.trim(), photos },
              }).unwrap();
              setSent(created.requestNumber);
              setOpen(false);
            } catch {
              /* shown below */
            }
          }}
        >
          {items.length > 1 && (
            <label className="block">
              <span className="text-sm font-medium text-[#222]">Which item?</span>
              <select value={itemIndex} onChange={(e) => setItemIndex(Number(e.target.value))} className={`${fieldClass} mt-2`}>
                {items.map((item, i) => (
                  <option key={i} value={i}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <fieldset>
            <legend className="text-sm font-medium text-[#222]">What do you need?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['alteration', 'replacement'] as const).map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                    type === t ? 'border-[#A52C45] bg-[#FBEFF2] text-[#A52C45]' : 'border-[#DDD6CC] text-[#444]'
                  }`}
                >
                  <input type="radio" name="type" className="sr-only" checked={type === t} onChange={() => setType(t)} />
                  {t === 'alteration' ? 'Alteration — adjust this garment' : 'Replacement — remake it'}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-sm font-medium text-[#222]">Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value as ReplacementReason)} className={`${fieldClass} mt-2`}>
              {CUSTOM_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#222]">Tell us what&apos;s wrong</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={1000}
              rows={4}
              required
              placeholder="e.g. The waist is about 1 inch loose and the sleeves are slightly long"
              className={`${fieldClass} mt-2`}
            />
          </label>

          <div>
            <p className="text-sm font-medium text-[#222]">Photos (optional, up to 4)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-md border border-[#EFEAE2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.startsWith('data:') ? p : `data:image/png;base64,${p}`} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((all) => all.filter((_, n) => n !== i))}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-[#444]"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-md border border-dashed border-[#DDD6CC] text-[#8A8A8A] hover:border-[#A52C45]">
                  <ImagePlus size={20} aria-hidden="true" />
                  <span className="sr-only">Add photos</span>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
                </label>
              )}
            </div>
            {photoError && <p className="mt-1 text-sm text-[#9B1C14]">{photoError}</p>}
          </div>

          {Boolean(error) && (
            <p className="text-sm text-[#9B1C14]">{apiErrorMessage(error, "We couldn't send your request. Please try again.")}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={isLoading || description.trim().length < 10} className={primaryClass}>
              {isLoading ? 'Sending…' : 'Send request'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className={secondaryClass}>
              Not now
            </button>
          </div>
        </form>
      ) : null}
    </Wrapper>
  );
}
