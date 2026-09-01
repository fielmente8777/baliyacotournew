"use client";

import Image from "next/image";
import Link from "next/link";
import CheckoutCard from "@/components/checkout/CheckoutCard";

import {
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/cartApi";
import type { CartItem as CartItemModel } from "@/@types/cart";
import { formatINR } from "@/lib/format";

interface Props {
  item: CartItemModel;
}

/**
 * The API populates suitDesignId; guard anyway so a failed populate renders a
 * degraded row instead of throwing.
 */
const designOf = (item: CartItemModel) =>
  typeof item.suitDesignId === "string" ? null : item.suitDesignId;

/**
 * Designs carry no image yet — the customization engine stores option ids, and
 * rendering a preview needs the garment artwork the product team has not
 * uploaded. Falls back to the placeholder until then.
 */
const PLACEHOLDER = "/Rectangle-23959.png";

export default function CartItem({ item }: Props) {
  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

  const design = designOf(item);
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <CheckoutCard className="p-4">
      <div className="flex gap-5">
        <Image
          src={PLACEHOLDER}
          alt={design?.name ?? "Your design"}
          width={120}
          height={145}
          className="rounded object-cover"
        />

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-medium">
              {design?.name || "Custom Design"}
            </h3>

            <button
              type="button"
              onClick={() => removeItem(item._id)}
              disabled={isRemoving}
              className="text-[#222] transition-colors hover:text-[#972E47] disabled:opacity-50"
            >
              {isRemoving ? "Removing…" : "Remove"}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-2xl font-semibold">{formatINR(lineTotal)}</span>

            {item.quantity > 1 && (
              <span className="text-[#777]">
                {formatINR(item.unitPrice)} each
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
                onClick={() =>
                  updateItem({ id: item._id, body: { quantity: item.quantity - 1 } })
                }
                className="h-9 w-9 text-lg disabled:opacity-40"
              >
                −
              </button>

              <span className="w-10 text-center text-sm">{item.quantity}</span>

              <button
                type="button"
                aria-label="Increase quantity"
                disabled={isUpdating}
                onClick={() =>
                  updateItem({ id: item._id, body: { quantity: item.quantity + 1 } })
                }
                className="h-9 w-9 text-lg disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {design && (
            <Link
              href={`/create-your-own-design?design=${design._id}`}
              className="mt-auto w-fit pt-3 font-medium text-[#972E47]"
            >
              View Customisation details
            </Link>
          )}
        </div>
      </div>
    </CheckoutCard>
  );
}
