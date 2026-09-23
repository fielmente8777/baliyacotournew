"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CheckoutCard from "@/components/checkout/CheckoutCard";

import {
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/cartApi";
import { useCart, type MergedCartItem } from "@/hooks/useCart";
import { formatINR } from "@/lib/format";

interface Props {
  item: MergedCartItem;
}

/**
 * One cart line. `item.source` decides which mutations to call —
 * Shopify lines go through useCart's updateQuantity/remove (Storefront
 * Cart API), design lines go through the existing baliye-node mutations
 * directly, same as before this file changed.
 */
export default function CartItem({ item }: Props) {
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

  const handleRemove = async () => {
    if (isShopify) {
      setIsRemovingShopify(true);
      try {
        await removeShopifyItem(item);
      } finally {
        setIsRemovingShopify(false);
      }
      return;
    }

    removeDesignItem(item.id);
  };

  return (
    <CheckoutCard className="p-4">
      <div className="flex gap-5">
        <Image
          src={item.image}
          alt={item.title}
          width={120}
          height={145}
          className="h-[145px] w-[120px] rounded object-cover"
        />

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium">{item.title}</h3>

              <span className="mt-1 inline-block rounded-full bg-[#F2EEE8] px-2.5 py-0.5 text-xs text-[#6B6B6B]">
                {item.kind === "design" ? "Customised" : "Ready to wear"}
              </span>

              {item.availableForSale === false && (
                <span className="mt-1 ml-2 inline-block rounded-full bg-[#FBEAEA] px-2.5 py-0.5 text-xs text-[#972E47]">
                  Out of stock
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-[#222] transition-colors hover:text-[#972E47] disabled:opacity-50"
            >
              {isRemoving ? "Removing…" : "Remove"}
            </button>
          </div>

          {item.selections && item.selections.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#666] sm:grid-cols-3">
              {item.selections.map((selection) => (
                <div key={selection.groupLabel} className="flex gap-1.5">
                  <dt className="text-[#999]">{selection.groupLabel}:</dt>
                  <dd className="text-[#333]">{selection.optionLabel}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold">
              {formatINR(lineTotal / 100)}
            </span>

            {item.quantity > 1 && (
              <span className="text-[#777]">
                {formatINR(item.unitPrice / 100)} each
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-[#777]">Qty</span>

            <div className="flex items-center rounded border border-[#E4E0D8]">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={isUpdating || item.quantity <= 1}
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="h-9 w-9 text-lg disabled:opacity-40"
              >
                −
              </button>

              <span className="w-10 text-center text-sm">{item.quantity}</span>

              <button
                type="button"
                aria-label="Increase quantity"
                disabled={isUpdating}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="h-9 w-9 text-lg disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {item.slug && (
            <Link
              href={`/products/${item.slug}`}
              className="mt-auto w-fit pt-3 font-medium text-[#972E47]"
            >
              View product
            </Link>
          )}
        </div>
      </div>
    </CheckoutCard>
  );
}
