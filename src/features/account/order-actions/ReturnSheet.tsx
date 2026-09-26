'use client';

/**
 * Return or exchange a ready-to-wear (Shopify) order — the Myntra flow:
 *
 *   1. Which items      picture, size, price; quantity when more than one
 *   2. Why              reason list; a size reason pre-selects Exchange
 *   3. Exchange/refund  Exchange shows the sizes actually in stock;
 *                       Refund shows the amount and where it goes
 *
 * The request lands in Shopify admin → the order → Returns, where the
 * client approves it and arranges the pickup.
 */

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Minus, Plus, RefreshCcw, Undo2 } from 'lucide-react';

import type { ShopifyOrder, ShopifyOrderItem, ShopifyReturnReason } from '@/@types/order';
import { apiErrorMessage, useRequestShopifyReturnMutation } from '@/store/api/orderApi';
import { useGetProductBySlugQuery } from '@/store/api/productApi';
import { formatMoney, shortDate } from '../../../app/(website)/my-account/orders/orderView';
import Sheet from './Sheet';
import { ChoiceCard, InfoNote, SectionLabel, SuccessView, btnPrimary, btnSecondary, textArea } from './ui';

const PLACEHOLDER = '/Rectangle-23959.png';

const REASONS: { value: ShopifyReturnReason; label: string; sizeIssue?: boolean }[] = [
  { value: 'SIZE_TOO_SMALL', label: 'Size is too small', sizeIssue: true },
  { value: 'SIZE_TOO_LARGE', label: 'Size is too large', sizeIssue: true },
  { value: 'DEFECTIVE', label: 'Received a damaged or defective item' },
  { value: 'WRONG_ITEM', label: 'Received a different item' },
  { value: 'NOT_AS_DESCRIBED', label: 'Quality is not as expected' },
  { value: 'COLOR', label: 'Colour looks different from the photos' },
  { value: 'STYLE', label: "Don't like the style or fit" },
  { value: 'UNWANTED', label: 'No longer need it' },
  { value: 'OTHER', label: 'Other' },
];

const variantLabel = (item: ShopifyOrderItem) =>
  item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : '';

/** Which option an exchange changes — "Size" when there is one. */
const sizeOptionName = (item: ShopifyOrderItem) =>
  item.selectedOptions.find((o) => /size/i.test(o.name))?.name ?? item.selectedOptions[0]?.name;

/** Sizes of the same product in the same colour/fabric, with stock. */
function ExchangeSizes({
  item,
  value,
  onChange,
}: {
  item: ShopifyOrderItem;
  value: string;
  onChange: (v: string) => void;
}) {
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(item.productHandle ?? '', {
    skip: !item.productHandle,
  });
  const optionName = sizeOptionName(item);
  const current = item.selectedOptions.find((o) => o.name === optionName)?.value;

  const sizes = useMemo(() => {
    if (!product || !optionName) return [];
    const others = item.selectedOptions.filter((o) => o.name !== optionName);
    return product.variants
      .filter((v) => others.every((o) => v.selectedOptions.some((s) => s.name === o.name && s.value === o.value)))
      .map((v) => ({
        value: v.selectedOptions.find((s) => s.name === optionName)?.value ?? v.title,
        inStock: v.availableForSale,
      }));
  }, [product, optionName, item.selectedOptions]);

  if (!item.productHandle || isError || (!isLoading && sizes.length === 0)) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={60}
        placeholder="Which size should we send? e.g. M"
        className={textArea}
      />
    );
  }

  if (isLoading) {
    return <div className="flex gap-2">{[0, 1, 2, 3].map((i) => <span key={i} className="h-10 w-14 animate-pulse rounded-lg bg-black/5" />)}</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Choose a new ${optionName?.toLowerCase()}`}>
        {sizes.map((s) => {
          const isCurrent = s.value === current;
          const selected = value === `${optionName}: ${s.value}`;
          const disabled = isCurrent || !s.inStock;
          return (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(`${optionName}: ${s.value}`)}
              className={`relative h-10 min-w-[3.25rem] rounded-lg border px-3 text-sm font-medium transition ${
                selected
                  ? 'border-[#A52C45] bg-[#A52C45] text-white'
                  : disabled
                    ? 'cursor-not-allowed border-[#EEE9E2] text-[#BDB5AA]'
                    : 'border-[#DDD6CC] text-[#333] hover:border-[#A52C45]'
              } ${!s.inStock && !isCurrent ? 'line-through' : ''}`}
            >
              {s.value}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#8A8A8A]">
        {current ? `You have ${current}. ` : ''}Crossed-out sizes are out of stock.
      </p>
    </div>
  );
}

export default function ReturnSheet({ order, open, onClose }: { order: ShopifyOrder; open: boolean; onClose: () => void }) {
  const returnable = order.items.filter((i) => i.returnableQuantity > 0);

  const [step, setStep] = useState(1);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    returnable.length === 1 ? { [returnable[0].lineItemId]: 1 } : {},
  );
  const [reason, setReason] = useState<ShopifyReturnReason | ''>('');
  const [comment, setComment] = useState('');
  const [resolution, setResolution] = useState<'replacement' | 'refund' | ''>('');
  const [exchangeFor, setExchangeFor] = useState('');
  const [request, { isLoading, error, data: created, reset }] = useRequestShopifyReturnMutation();

  const chosen = returnable.filter((i) => (qty[i.lineItemId] ?? 0) > 0);
  const refundAmount = chosen.reduce((sum, i) => sum + i.unitPrice * (qty[i.lineItemId] ?? 0), 0);
  const singleExchangeItem = chosen.length === 1 ? chosen[0] : null;

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setReason('');
      setComment('');
      setResolution('');
      setExchangeFor('');
      reset();
    }, 200);
  };

  const pickReason = (r: (typeof REASONS)[number]) => {
    setReason(r.value);
    /* A size problem is almost always solved by the next size up/down. */
    if (r.sizeIssue && !resolution) setResolution('replacement');
  };

  const canContinue =
    step === 1
      ? chosen.length > 0
      : step === 2
        ? reason !== '' && (reason !== 'OTHER' || comment.trim().length >= 3)
        : resolution === 'refund' || (resolution === 'replacement' && exchangeFor.trim().length > 0);

  const submit = async () => {
    try {
      await request({
        orderId: order.id,
        body: {
          resolution: resolution as 'replacement' | 'refund',
          reason: reason as ShopifyReturnReason,
          note: comment.trim() || undefined,
          exchangeFor: resolution === 'replacement' ? exchangeFor.trim() : undefined,
          items: chosen.map((i) => ({ lineItemId: i.lineItemId, quantity: qty[i.lineItemId] })),
        },
      }).unwrap();
    } catch {
      /* shown in the sheet */
    }
  };

  if (created) {
    const isExchange = resolution === 'replacement';
    return (
      <Sheet open={open} onClose={close} title={isExchange ? 'Exchange requested' : 'Return requested'} footer={<button type="button" onClick={close} className={btnPrimary}>Done</button>}>
        <SuccessView
          title={isExchange ? 'Your exchange request is in' : 'Your return request is in'}
          reference={created.name}
          steps={[
            'Request received',
            'We confirm and schedule a pickup — within 1–2 working days',
            'Item is picked up and checked',
            isExchange
              ? `New ${exchangeFor.replace(/^[^:]+:\s*/, '') || 'item'} is dispatched`
              : `${formatMoney(refundAmount, order.currencyCode)} refunded to your original payment method`,
          ]}
          note="We'll email you at each step. Please keep the item unused, with its tags on, until pickup."
        />
      </Sheet>
    );
  }

  const footer = (
    <>
      {step > 1 ? (
        <button type="button" onClick={() => setStep(step - 1)} className={btnSecondary}>
          Back
        </button>
      ) : (
        <button type="button" onClick={close} className={btnSecondary}>
          Cancel
        </button>
      )}
      {step < 3 ? (
        <button type="button" disabled={!canContinue} onClick={() => setStep(step + 1)} className={btnPrimary}>
          Continue
        </button>
      ) : (
        <button type="button" disabled={!canContinue || isLoading} onClick={submit} className={btnPrimary}>
          {isLoading ? 'Submitting…' : resolution === 'replacement' ? 'Request exchange' : 'Request return'}
        </button>
      )}
    </>
  );

  return (
    <Sheet
      open={open}
      onClose={close}
      title={['Select items', 'Tell us why', 'Exchange or refund'][step - 1]}
      step={{ current: step, total: 3 }}
      footer={footer}
    >
      {step === 1 && (
        <div className="space-y-2.5">
          {returnable.map((item) => {
            const n = qty[item.lineItemId] ?? 0;
            const checked = n > 0;
            return (
              <ChoiceCard
                key={item.lineItemId}
                type="checkbox"
                checked={checked}
                onChange={() => setQty((q) => ({ ...q, [item.lineItemId]: checked ? 0 : 1 }))}
                title={item.title}
                description={
                  <>
                    {variantLabel(item) && <span className="block">{variantLabel(item)}</span>}
                    <span className="block font-medium text-[#222]">{formatMoney(item.unitPrice, order.currencyCode)}</span>
                  </>
                }
                aside={
                  checked && item.returnableQuantity > 1 ? (
                    <span className="flex items-center self-center rounded-lg border border-[#DDD6CC]" onClick={(e) => e.preventDefault()}>
                      <button
                        type="button"
                        aria-label="One fewer"
                        onClick={() => setQty((q) => ({ ...q, [item.lineItemId]: Math.max(1, n - 1) }))}
                        className="p-2 text-[#444] disabled:opacity-30"
                        disabled={n <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm">{n}</span>
                      <button
                        type="button"
                        aria-label="One more"
                        onClick={() => setQty((q) => ({ ...q, [item.lineItemId]: Math.min(item.returnableQuantity, n + 1) }))}
                        className="p-2 text-[#444] disabled:opacity-30"
                        disabled={n >= item.returnableQuantity}
                      >
                        <Plus size={14} />
                      </button>
                    </span>
                  ) : undefined
                }
              >
                <Image
                  src={item.image || PLACEHOLDER}
                  alt=""
                  width={56}
                  height={70}
                  className="h-[70px] w-[56px] shrink-0 rounded-md object-cover"
                />
              </ChoiceCard>
            );
          })}
          {order.returnWindowEndsAt && (
            <p className="pt-1 text-xs text-[#8A8A8A]">Return window closes on {shortDate(order.returnWindowEndsAt)}.</p>
          )}
        </div>
      )}

      {step === 2 && (
        <>
          <SectionLabel>What&apos;s the reason?</SectionLabel>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <ChoiceCard key={r.value} name="return-reason" checked={reason === r.value} onChange={() => pickReason(r)} title={r.label} />
            ))}
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-[#222]">
              Comments {reason === 'OTHER' ? '' : <span className="font-normal text-[#8A8A8A]">(optional)</span>}
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={250}
              rows={3}
              placeholder="Anything that helps us understand the issue"
              className={textArea}
            />
          </label>
        </>
      )}

      {step === 3 && (
        <>
          <div className="space-y-2.5">
            <ChoiceCard
              name="resolution"
              checked={resolution === 'replacement'}
              onChange={() => setResolution('replacement')}
              title={
                <span className="inline-flex items-center gap-2">
                  <RefreshCcw size={15} className="text-[#A52C45]" aria-hidden="true" />
                  Exchange for another size
                </span>
              }
              description="Same item, different size. No extra charge."
            />
            <ChoiceCard
              name="resolution"
              checked={resolution === 'refund'}
              onChange={() => setResolution('refund')}
              title={
                <span className="inline-flex items-center gap-2">
                  <Undo2 size={15} className="text-[#A52C45]" aria-hidden="true" />
                  Return for a refund
                </span>
              }
              description={`${formatMoney(refundAmount, order.currencyCode)} back to your original payment method.`}
            />
          </div>

          {resolution === 'replacement' && (
            <div className="mt-5 animate-slide-down">
              <SectionLabel>
                {singleExchangeItem ? `Choose your new ${(sizeOptionName(singleExchangeItem) ?? 'size').toLowerCase()}` : 'Which sizes should we send?'}
              </SectionLabel>
              {singleExchangeItem ? (
                <ExchangeSizes item={singleExchangeItem} value={exchangeFor} onChange={setExchangeFor} />
              ) : (
                <input
                  value={exchangeFor}
                  onChange={(e) => setExchangeFor(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Anarkali in M, Kurta in L"
                  className={textArea}
                />
              )}
            </div>
          )}

          {resolution === 'refund' && (
            <div className="mt-5 animate-slide-down">
              <InfoNote tone="good">
                Refund of <strong>{formatMoney(refundAmount, order.currencyCode)}</strong> to your original payment method,
                usually within 5–7 working days of the item passing its quality check. Shipping charges are not refunded.
              </InfoNote>
            </div>
          )}

          {resolution && (
            <div className="mt-3">
              <InfoNote>Please keep the item unused and unwashed, with all tags attached, until it&apos;s picked up.</InfoNote>
            </div>
          )}

          {Boolean(error) && (
            <p role="alert" className="mt-4 text-sm text-[#9B1C14]">
              {apiErrorMessage(error, "We couldn't submit your request. Please try again.")}
            </p>
          )}
        </>
      )}
    </Sheet>
  );
}
