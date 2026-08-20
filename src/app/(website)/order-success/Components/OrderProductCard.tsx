import Image from "next/image";
import { OrderProduct } from "../pageData";

interface Props {
  product: OrderProduct;
}

export default function OrderProductCard({
  product,
}: Props) {
  return (
    <div className="rounded bg-white p-4 shadow-sm">

      <div className="w-full aspect-4/4.5 relative">
        <Image
        src={product.image}
        alt={product.title}
        fill
        className="rounded"
      />
      </div>

      <h3 className="mt-4 font-semibold">
        {product.title}
      </h3>

      <p className="mt-2 text-sm text-[#666]">
        {product.delivery}
      </p>

    </div>
  );
}