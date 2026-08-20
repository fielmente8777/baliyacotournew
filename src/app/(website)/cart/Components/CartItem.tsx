import Image from "next/image";
import CheckoutCard from "@/components/checkout/CheckoutCard";

import { CartItemType } from "../pageData";

interface Props {
  item: CartItemType;
}

export default function CartItem({
  item,
}: Props) {
  return (
    <CheckoutCard className="p-4">

      <div className="flex gap-5">

        <Image
          src={item.image}
          alt={item.title}
          width={120}
          height={145}
          className="rounded object-cover"
        />

        <div className="flex flex-1 flex-col">

          <div className="flex items-start justify-between">

            <h3 className="text-xl font-medium">
              {item.title}
            </h3>

            <button
              className="
              text-[#222]
              hover:text-[#972E47]
            "
            >
              Remove
            </button>

          </div>

          <div className="mt-4 flex items-center gap-3">

            <span className="text-2xl font-semibold">
              ${item.price}
            </span>

            <span className="text-[#B0B0B0] line-through">
              ${item.originalPrice}
            </span>

            <span className="text-[#972E47]">
              {item.discount}
            </span>

          </div>

          <button
            className="
            mt-auto
            w-fit
            text-[#972E47]
            font-medium
          "
          >
            View Customisation details
          </button>

        </div>

      </div>

    </CheckoutCard>
  );
}