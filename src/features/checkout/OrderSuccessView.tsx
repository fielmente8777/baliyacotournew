"use client";

/**
 * Order confirmation. Reads ?order=<id> and fetches the real order, so a
 * refresh or a shared link still shows the right thing.
 */

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import PrimaryButton from "@/components/checkout/PrimaryButton";
import SecondaryButton from "@/components/checkout/SecondaryButton";
import { useGetMyOrdersQuery, useGetOrderByIdQuery } from "@/store/api/orderApi";
import { formatINR } from "@/lib/format";

import SuccessHeader from "../../app/(website)/order-success/Components/SuccessHeader";

/** Designs carry no artwork yet — see the note in CartItem. */
const PLACEHOLDER = "/Rectangle-23959.png";

export default function OrderSuccessView() {
  const param = useSearchParams().get("order");
  /* A missing push leaves "undefined" in the URL, which is not a valid id. */
  const orderId = param && param !== "undefined" ? param : null;

  const { data: fetched, isLoading, isError } = useGetOrderByIdQuery(
    orderId as string,
    { skip: !orderId },
  );

  /**
   * Fall back to the newest order.
   *
   * The customer has just paid; showing them "we couldn't find that order"
   * because a query parameter went missing is the worst possible moment to be
   * unhelpful. Their most recent order is almost certainly the one they want.
   */
  const { data: recent = [] } = useGetMyOrdersQuery(
    { limit: 1 },
    { skip: Boolean(orderId) && !isError },
  );

  const order = fetched ?? recent[0];

  return (
    <main className="min-h-screen bg-[#F8F6EF]">
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <SuccessHeader orderNumber={order?.orderNumber ?? "…"} />

        <div className="my-12 flex items-center gap-6">
          <div className="h-px flex-1 bg-[#DDD]" />
          <span className="rounded-full bg-[#DFF1DA] px-5 py-2 text-sm text-[#4E6F4A]">
            Your Orders
          </span>
          <div className="h-px flex-1 bg-[#DDD]" />
        </div>

        {isLoading && <p className="text-center text-[#777]">Loading your order…</p>}

        {!isLoading && !order && (
          <p className="text-center text-[#777]">
            We couldn&apos;t find that order. Check your order history for the latest status.
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {order?.items.map((item, index) => {
            /* itemSnapshot is frozen at placement — safe for historical orders. */
            const snapshot = item.itemSnapshot;

            return (
              <div key={index} className="rounded bg-white p-4 shadow-sm">
                <div className="relative aspect-4/4.5 w-full">
                  <Image
                    src={PLACEHOLDER}
                    alt={snapshot?.name ?? "Your order"}
                    fill
                    className="rounded object-cover"
                  />
                </div>

                <h3 className="mt-4 font-semibold">
                  {snapshot?.name || "Custom Design"}
                </h3>

                <p className="mt-1 text-sm text-[#666]">
                  {formatINR(item.subtotal / 100)}
                  {item.quantity > 1 && ` · Qty ${item.quantity}`}
                </p>

                <p className="mt-2 text-sm text-[#666]">
                  Tailored to {item.measurementSnapshot.profileName}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col justify-center gap-5 md:flex-row">
          <Link href="/collections">
            <SecondaryButton className="w-[260px]">Continue Shopping</SecondaryButton>
          </Link>

          <Link href="/my-account/orders">
            <PrimaryButton fullWidth={false} className="w-[260px]">
              View Order Status
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </main>
  );
}
