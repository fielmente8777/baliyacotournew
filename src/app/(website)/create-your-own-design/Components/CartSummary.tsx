interface Props {
  totalItems: number;
  totalPrice: string;
}

export default function CartSummary({
  totalItems,
  totalPrice,
}: Props) {
  return (
    <div className="mt-10">

      <p className="text-lg">
        {totalItems} item in your cart
      </p>

      <h2 className="mt-2 text-5xl font-bold">
        {totalPrice}
      </h2>

      <button
        className="
        mt-8
        h-14
        w-52
        rounded-md
        bg-[#972E47]
        text-white
      "
      >
        Buy Now
      </button>

    </div>
  );
}