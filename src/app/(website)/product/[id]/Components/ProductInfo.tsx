import Link from "next/link";
import { ProductDetail } from "../pageData";
import ProductDetails from "./ProductDetails";
import SizeSelector from "./SizeSelector";
import { IoIosStar } from "react-icons/io";

interface ProductInfoProps {
  product: ProductDetail;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div>
      <h1 className="text-5xl font-semibold">{product.name}</h1>

      <p className="mt-5 text-sm uppercase tracking-[2px] text-gray-500">
        Starting from
      </p>

      <h2 className="mt-2 text-4xl font-bold">{product.price}</h2>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-2 text-[#426340] py-1 px-2  rounded-lg bg-[#E0F1DC]">
            <span>4.5</span>
            <IoIosStar size={20} fill="currentColor" />
        </div>

        <span className="text-sm text-gray-500">
          10,559 ratings and 665 reviews
        </span>
      </div>

      <SizeSelector />

      <div className="mt-10 flex gap-4">
        <Link href="/create-your-own-design" className="flex-1 items-center justify-center text-center rounded-full bg-[#8D2F46] py-4 font-medium text-white">
          Customize
        </Link>

        <button className="flex-1 rounded-full bg-black py-4 font-medium text-white">
          Add to Cart
        </button>
      </div>

      <div className="mt-6 rounded bg-[#EAF6E8] py-3 text-center text-sm text-[#52734D]">
        Products are Tailored and Delivered in 3 weeks
      </div>

      <ProductDetails product={product} />
    </div>
  );
}
