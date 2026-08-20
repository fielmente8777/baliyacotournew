import CheckoutCard from "./CheckoutCard";
import PrimaryButton from "./PrimaryButton";

interface Props {
  buttonText: string;
}

export default function PriceSummary({
  buttonText,
}: Props) {
  return (
    <div className="sticky top-24">

      <CheckoutCard className="p-6">

        <h3 className="text-xl font-semibold">
          Price Summary
        </h3>

        <div className="mt-8 space-y-5">

          <div className="flex justify-between">
            <span>Cart total</span>
            <strong>$260</strong>
          </div>

          <div className="flex justify-between">
            <span>Shipping cost</span>
            <strong>FREE</strong>
          </div>

          <div className="flex justify-between">
            <span>Discount</span>
            <strong className="text-green-600">
              $10
            </strong>
          </div>

        </div>

        <div className="my-6 border-t" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total Payable</span>
          <span>$250</span>
        </div>

      </CheckoutCard>

      {buttonText && <PrimaryButton className="mt-6">
        {buttonText}
      </PrimaryButton>}

    </div>
  );
}