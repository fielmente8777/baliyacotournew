"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import CheckoutCard from "@/components/checkout/CheckoutCard";
import {
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/cartApi";
import { useCart, type MergedCartItem } from "@/hooks/useCart";
import { cn, formatINR } from "@/lib/format";

import DesignSelections from "./DesignSelections";
import QuantityStepper from "./QuantityStepper";

interface Props {
  item: MergedCartItem;
  /** Position in the list — staggers the entrance animation. */
  index?: number;
}

/** The photo, linked to the product when there is one. */
function Thumb({ item }: { item: MergedCartItem }) {
  const image = (
    <Image
      src={item.image}
      alt={item.title}
      width={132}
      height={176}
      className="h-32 w-24 object-cover transition-transform duration-500 group-hover:scale-105 sm:h-44 sm:w-33"
    />
  );
  return item.slug ? (
    <Link href={`/products/${item.slug}`} className="group block shrink-0 self-start overflow-hidden rounded-sm bg-[#F1EDE6]">
      {image}
    </Link>
  ) : (
    <div className="shrink-0 self-start overflow-hidden rounded-sm bg-[#F1EDE6]">{image}</div>
  );
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
  const outOfStock = item.availableForSale === false;

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
    <li
      className={isLeaving ? "animate-collapse-out" : "animate-rise-in"}
      style={isLeaving ? undefined : { animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <CheckoutCard
        className={cn(
          "p-3 transition-shadow duration-300 hover:shadow-[0_10px_28px_-16px_rgba(34,34,34,0.3)] sm:p-5",
          isUpdating && "opacity-80"
        )}
      >
        <div className="flex gap-4 sm:gap-6">
          <Thumb item={item} />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Phones: price under the title. Wider: price top right. */}
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B6E54] sm:text-[11px]">
                  {item.kind === "design" ? "Custom design" : "Ready to wear"}
                </p>
                <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-dark sm:text-lg">
                  {item.slug ? (
                    <Link href={`/products/${item.slug}`} className="transition-colors hover:text-secondary">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                {outOfStock && (
                  <span className="mt-1.5 inline-block rounded-sm bg-[#FBEAEA] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                    Out of stock
                  </span>
                )}
              </div>

              <div className="flex shrink-0 items-baseline gap-2 sm:block sm:text-right">
                <p key={lineTotal} className="animate-fade-in text-base font-semibold text-dark sm:text-xl">
                  {formatINR(lineTotal / 100)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-[#8A8A8A]">{formatINR(item.unitPrice / 100)} each</p>
                )}
              </div>
            </div>

            {item.selections && <DesignSelections selections={item.selections} />}

            <div className="mt-auto flex items-center gap-1 pt-4 sm:gap-3">
              <QuantityStepper quantity={item.quantity} disabled={isUpdating} onChange={handleQuantityChange} />

              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving || isLeaving}
                aria-label={`Remove ${item.title} from bag`}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#6B6B6B] transition-colors hover:bg-[#FBEAEA] hover:text-secondary disabled:opacity-50"
              >
                <Trash2 size={15} aria-hidden="true" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      </CheckoutCard>
    </li>
  );
}
