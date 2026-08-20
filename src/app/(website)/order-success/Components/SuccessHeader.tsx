import { Check } from "lucide-react";

interface Props {
  orderNumber: string;
}

export default function SuccessHeader({
  orderNumber,
}: Props) {
  return (
    <div className="text-center">

      <div
        className="
        mx-auto
        flex
        h-24
        w-24
        items-center
        justify-center
        rounded-full
        bg-[#496E45]
      "
      >
        <Check
          size={48}
          className="text-white"
          strokeWidth={3}
        />
      </div>

      <h1 className="mt-8 text-4xl font-semibold text-[#222]">
        Your Order Was Placed Successfully
      </h1>

      <p className="mt-4 text-[#777]">
        Order Number {orderNumber}
      </p>

    </div>
  );
}