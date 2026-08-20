import { Product } from "../pageData";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({
  products,
}: ProductGridProps) {
  return (
    <section className="mt-10">

      <div
        className="
        grid
        grid-cols-2
        gap-x-5
        gap-y-12

        md:grid-cols-3

        lg:grid-cols-4

        xl:grid-cols-5
      "
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </section>
  );
}