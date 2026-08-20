import Image from "next/image";
import Link from "next/link";
import { Product } from "../pageData";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-white">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="
            object-cover
            duration-500
            group-hover:scale-105
          "
          />
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="
          text-[15px]
          font-medium
          text-[#262626]
        "
          >
            {product.title}
          </h3>
          {product.isEditorsPick && (
            <span
              className="
           rounded-full
            bg-secondary
            px-3
            py-1
            text-[10px]
            uppercase
            tracking-[2px]
            text-white
          "
            >
              {"Editor's Pick"}
            </span>
          )}
        </div>
        <p
          className="
          mt-2
          text-sm
          text-[#8B6E54]
        "
        >
          {product.price}
        </p>
      </div>
    </Link>
  );
}
