import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import PriceSummary from "@/components/checkout/PriceSummary";

import CartItem from "./Components/CartItem";
import { cartItems } from "./pageData";

export default function CartPage() {
  return (
    <main className="bg-[#F8F6EF] min-h-screen">

      <section className="container mx-auto px-4 py-12">

        <h1 className="text-4xl font-semibold">
          My Cart
        </h1>

        <p className="mt-2 text-[#777]">
          {cartItems.length} Items
        </p>

        <div className="mt-8">

          <CheckoutStepper
            step={1}
          />

        </div>

        <div
          className="
          mt-10
          grid
          gap-8

          lg:grid-cols-[2fr_380px]
        "
        >

          <div className="space-y-6">

            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
              />
            ))}

          </div>

          <div>

            <PriceSummary
              buttonText="Continue"
            />

            <DeliveryBanner />

          </div>

        </div>

      </section>

    </main>
  );
}