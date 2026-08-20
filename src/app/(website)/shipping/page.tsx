import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import PriceSummary from "@/components/checkout/PriceSummary";
import PrimaryButton from "@/components/checkout/PrimaryButton";

import AddressCard from "./Components/AddressCard";
import { addresses } from "./pageData";

export default function ShippingPage() {
  return (
    <main className="bg-[#F8F6EF] min-h-screen">

      <section className="container mx-auto px-4 py-12">

        <h1 className="text-4xl font-semibold">
          My Cart
        </h1>

        <p className="mt-2 text-[#777]">
          3 Items
        </p>

        <div className="mt-8">
          <CheckoutStepper step={2} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_380px]">

          <CheckoutCard>

            <div className="flex items-center justify-between border-b p-6">

              <h2 className="text-2xl font-semibold">
                Saved Addresses
              </h2>

              <PrimaryButton
                fullWidth={false}
                className="px-8"
              >
                Add New Address
              </PrimaryButton>

            </div>

            <div className="px-6">

              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                />
              ))}

            </div>

          </CheckoutCard>

          <div>

            <PriceSummary
              buttonText="Proceed To Buy"
            />

            <DeliveryBanner />

          </div>

        </div>

      </section>

    </main>
  );
}