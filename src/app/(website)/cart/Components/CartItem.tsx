"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import CheckoutCard from "@/components/checkout/CheckoutCard";

import {
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/cartApi";
import { useCart, type MergedCartItem } from "@/hooks/useCart";
import { formatINR } from "@/lib/format";

interface Props {
  item: MergedCartItem;
  /** Position in the list — staggers the entrance animation. */
  index?: number;
}

/**
 * One cart line. `item.source` decides which mutations to call —
 * Shopify lines go through useCart's updateQuantity/remove (Storefront
 * Cart API), design lines go through the existing baliye-node mutations
 * directly, same as before this file changed.
 */
export default function CartItem({ item, index = 0 }: Props) {
  const { updateQuantity: updateShopifyQuantity, remove: removeShopifyItem } = useCart();

  const [updateDesignItem, { isLoading: isUpdatingDesign }] = useUpdateCartItemMutation();
  const [removeDesignItem, { isLoading: isRemovingDesign }] = useRemoveCartItemMutation();

  const isShopify = item.source === "shopify";
  const [isUpdatingShopify, setIsUpdatingShopify] = useState(false);
  const [isRemovingShopify, setIsRemovingShopify] = useState(false);

  const isUpdating = isShopify ? isUpdatingShopify : isUpdatingDesign;
  const isRemoving = isShopify ? isRemovingShopify : isRemovingDesign;

  const lineTotal = item.unitPrice * item.quantity;

  const handleQuantityChange = async (nextQuantity: number) => {
    if (nextQuantity < 1) return;

    if (isShopify) {
      setIsUpdatingShopify(true);
      try {
        await updateShopifyQuantity(item, nextQuantity);
      } finally {
        setIsUpdatingShopify(false);
      }
      return;
    }

    updateDesignItem({ id: item.id, body: { quantity: nextQuantity } });
  };

  /* The card slides out first, then the line is removed; if removing fails
     it slides back in. */
  const [isLeaving, setIsLeaving] = useState(false);

  const handleRemove = async () => {
    setIsLeaving(true);
    await new Promise((resolve) => setTimeout(resolve, 280));
    try {
      await removeLine();
    } catch {
      setIsLeaving(false);
    }
  };

  const removeLine = async () => {
    if (isShopify) {
      setIsRemovingShopify(true);
      try {
        await removeShopifyItem(item);
      } finally {
        setIsRemovingShopify(false);
      }
      return;
    }

    await removeDesignItem(item.id).unwrap();
  };

  return (
    <div
      className={isLeaving ? "animate-collapse-out" : "animate-rise-in"}
      style={isLeaving ? undefined : { animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
    <CheckoutCard className={`relative p-3 transition-shadow duration-300 hover:shadow-[0_8px_24px_-14px_rgba(34,34,34,0.3)] sm:p-4 ${isUpdating ? "opacity-80" : ""}`}>
      <div className="flex gap-3 sm:gap-5">
        {item.slug ? (
          <Link href={`/products/${item.slug}`} className="group shrink-0 overflow-hidden rounded">
            <Image
              src={item.image}
              alt={item.title}
              width={120}
              height={150}
              className="h-[124px] w-[96px] object-cover transition-transform duration-500 group-hover:scale-105 sm:h-[150px] sm:w-[120px]"
            />
          </Link>
        ) : (
          <Image
            src={item.image}
            alt={item.title}
            width={120}
            height={150}
            className="h-[124px] w-[96px] shrink-0 rounded object-cover sm:h-[150px] sm:w-[120px]"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-[#222] sm:text-lg">
                {item.slug ? (
                  <Link href={`/products/${item.slug}`} className="transition-colors hover:text-[#972E47]">
                    {item.title}
                  </Link>
                ) : (
                  item.title
                )}
              </h3>

              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="inline-block rounded-full bg-[#F2EEE8] px-2.5 py-0.5 text-[11px] text-[#6B6B6B]">
                  {item.kind === "design" ? "Customised" : "Ready to wear"}
                </span>

                {item.availableForSale === false && (
                  <span className="inline-block rounded-full bg-[#FBEAEA] px-2.5 py-0.5 text-[11px] font-medium text-[#972E47]">
                    Out of stock
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving || isLeaving}
              aria-label={`Remove ${item.title} from bag`}
              title="Remove"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8A8A8A] transition-colors hover:bg-[#FBEAEA] hover:text-[#972E47] disabled:opacity-50"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>

          {item.selections && item.selections.length > 0 && (
            <dl className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-0.5 text-[13px] text-[#666] sm:grid-cols-2 xl:grid-cols-3">
              {item.selections.map((selection) => (
                <div key={selection.groupLabel} className="flex min-w-0 gap-1.5">
                  <dt className="shrink-0 text-[#999]">{selection.groupLabel}:</dt>
                  <dd className="truncate text-dark">{selection.optionLabel}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
            <div className="flex h-9 items-center overflow-hidden rounded-md border border-[#E4E0D8]" role="group" aria-label="Quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={isUpdating || item.quantity <= 1}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="flex h-full w-9 items-center justify-center text-[#444] transition-colors hover:bg-[#F8F6EF] active:scale-90 disabled:opacity-35 disabled:hover:bg-transparent"
              >
                <Minus size={14} />
              </button>

              <span key={item.quantity} className="w-9 animate-check-pop text-center text-sm font-medium" aria-live="polite">
                {item.quantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                disabled={isUpdating}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="flex h-full w-9 items-center justify-center text-[#444] transition-colors hover:bg-[#F8F6EF] active:scale-90 disabled:opacity-35"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="text-right">
              <p key={lineTotal} className="animate-fade-in text-lg font-semibold text-[#222] sm:text-xl">
                {formatINR(lineTotal / 100)}
              </p>
              {item.quantity > 1 && (
                <p className="text-xs text-[#8A8A8A]">{formatINR(item.unitPrice / 100)} each</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </CheckoutCard>
    </div>
  );
}
