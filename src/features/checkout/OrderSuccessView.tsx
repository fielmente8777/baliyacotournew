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
import { useGetOrderByIdQuery } from "@/store/api/orderApi";
import { formatINR } from "@/lib/format";

import SuccessHeader from "../../app/(website)/order-success/Components/SuccessHeader";

/** Designs carry no artwork yet — see the note in CartItem. */
const PLACEHOLDER = "/Rectangle-23959.png";

export default function OrderSuccessView() {
  const orderId = useSearchParams().get("order");

  const { data: order, isLoading } = useGetOrderByIdQuery(orderId as string, {
    skip: !orderId,
  });

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
            const design =
              typeof item.suitDesignId === "string" ? null : item.suitDesignId;

            return (
              <div key={index} className="rounded bg-white p-4 shadow-sm">
                <div className="relative aspect-4/4.5 w-full">
                  <Image
                    src={PLACEHOLDER}
                    alt={design?.name ?? "Your design"}
                    fill
                    className="rounded object-cover"
                  />
                </div>

                <h3 className="mt-4 font-semibold">
                  {design?.name || "Custom Design"}
                </h3>

                <p className="mt-1 text-sm text-[#666]">
                  {formatINR(item.subtotal)}
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
