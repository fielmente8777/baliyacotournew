import Link from "next/link";

import PrimaryButton from "@/components/checkout/PrimaryButton";
import SecondaryButton from "@/components/checkout/SecondaryButton";

import SuccessHeader from "./Components/SuccessHeader";
import OrderProductCard from "./Components/OrderProductCard";

import {
  orderNumber,
  products,
} from "./pageData";

export default function OrderSuccessPage() {
  return (
    <main className="bg-[#F8F6EF] min-h-screen">

      <section className="container mx-auto max-w-6xl px-4 py-20">

        <SuccessHeader
          orderNumber={orderNumber}
        />

        <div className="my-12 flex items-center gap-6">

          <div className="h-px flex-1 bg-[#DDD]" />

          <span
            className="
            rounded-full
            bg-[#DFF1DA]
            px-5
            py-2
            text-sm
            text-[#4E6F4A]
          "
          >
            Your Orders
          </span>

          <div className="h-px flex-1 bg-[#DDD]" />

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          {products.map((item) => (
            <OrderProductCard
              key={item.id}
              product={item}
            />
          ))}

        </div>

        <div className="mt-14 flex flex-col justify-center gap-5 md:flex-row">

          <Link href="/collections">
            <SecondaryButton className="w-[260px]">
              Continue Shopping
            </SecondaryButton>
          </Link>

          <Link href="/profile/orders">
            <PrimaryButton
              fullWidth={false}
              className="w-[260px]"
            >
              View Order Status
            </PrimaryButton>
          </Link>

        </div>

      </section>

    </main>
  );
}