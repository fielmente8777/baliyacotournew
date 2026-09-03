"use client";

import Image from "next/image";
import Link from "next/link";
import CheckoutCard from "@/components/checkout/CheckoutCard";

import {
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/store/api/cartApi";
import {
  cartDesign,
  cartProduct,
  type CartItem as CartItemModel,
} from "@/@types/cart";
import { primaryImage } from "@/@types/product";
import { formatINR } from "@/lib/format";

interface Props {
  item: CartItemModel;
}

/**
 * Designs carry no artwork — the engine stores option ids, and rendering a
 * preview needs garment images the product team hasn't uploaded.
 */
const PLACEHOLDER = "/Rectangle-23959.png";

export default function CartItem({ item }: Props) {
  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();

  const product = cartProduct(item);
  const design = cartDesign(item);

  const title = product?.name ?? design?.name ?? "Custom Design";
  const image = product ? primaryImage(product) : PLACEHOLDER;
  const lineTotal = item.unitPrice * item.quantity;

  /* A design's chosen options, shown so the customer can confirm the build. */
  const selections = design?.selections ?? [];

  return (
    <CheckoutCard className="p-4">
      <div className="flex gap-5">
        <Image
          src={image}
          alt={title}
          width={120}
          height={145}
          className="h-[145px] w-[120px] rounded object-cover"
        />

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-medium">{title}</h3>

              <span className="mt-1 inline-block rounded-full bg-[#F2EEE8] px-2.5 py-0.5 text-xs text-[#6B6B6B]">
                {item.kind === "design" ? "Customised" : "Ready to wear"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item._id)}
              disabled={isRemoving}
              className="text-[#222] transition-colors hover:text-[#972E47] disabled:opacity-50"
            >
              {isRemoving ? "Removing…" : "Remove"}
            </button>
          </div>

          {selections.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-[#666] sm:grid-cols-3">
              {selections.map((selection) => (
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

          {product && (
            <Link
          
              href={`/products/${product.slug}`}
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
