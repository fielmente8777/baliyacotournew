import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutCard from "@/components/checkout/CheckoutCard";
import DeliveryBanner from "@/components/checkout/DeliveryBanner";
import PriceSummary from "@/components/checkout/PriceSummary";
import PrimaryButton from "@/components/checkout/PrimaryButton";
import SecondaryButton from "@/components/checkout/SecondaryButton";

import AddressType from "./Components/AddressType";
import { states } from "./pageData";

export default function AddAddressPage() {
  return (
    <main className="min-h-screen bg-[#F8F6EF]">

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

            <div className="border-b p-6">

              <h2 className="text-2xl font-semibold">
                Saved Addresses
              </h2>

            </div>

            <form className="space-y-5 p-6">

              <input
                type="text"
                placeholder="Full Name*"
                className="h-12 w-full rounded border px-4"
              />

              <input
                type="text"
                placeholder="Street Address*"
                className="h-12 w-full rounded border px-4"
              />

              <div className="grid gap-4 md:grid-cols-2">

                <input
                  type="text"
                  placeholder="City"
                  className="h-12 rounded border px-4"
                />

                <select
                  className="h-12 rounded border px-4"
                  defaultValue=""
                >
                  <option value="" disabled>
                    State
                  </option>

                  {states.map((state) => (
                    <option
                      key={state}
                      value={state}
                    >
                      {state}
                    </option>
                  ))}
                </select>

              </div>

              <input
                type="text"
                placeholder="Pincode*"
                className="h-12 w-full rounded border px-4"
              />

              <AddressType />

              <div className="flex items-center justify-between pt-8">

                <SecondaryButton>
                  Cancel
                </SecondaryButton>

                <PrimaryButton
                  fullWidth={false}
                  className="px-12"
                >
                  Save Address
                </PrimaryButton>

              </div>

            </form>

          </CheckoutCard>

          <div>

            <PriceSummary
              buttonText=""
            />

            <DeliveryBanner />

          </div>

        </div>

      </section>

    </main>
  );
}