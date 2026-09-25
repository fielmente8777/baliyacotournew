"use client";

import { Container, Section } from "@/components/sectionComponants";
import { SectionHeading } from "@/components/typography";
import ProductCard from "@/features/catalog/ProductCard";
import { useGetProductsQuery } from "@/store/api/productApi";

interface BestSellersProps {
  title: string;
  description: string;
}

/**
 * Live bestsellers, replacing the hardcoded four. `badge=bestseller` is the
 * curated flag the product team sets — not a computed sales ranking, which
 * would leave a new store with an empty homepage.
 */
const BestSellers: React.FC<BestSellersProps> = ({ title, description }) => {
  const { data, isLoading } = useGetProductsQuery({
    badge: "bestseller",
    limit: 8,
  });

  const products = data?.items ?? [];

  /* Nothing flagged yet — hide the section rather than show an empty grid. */
  if (!isLoading && products.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="space-y-4 text-center">
          <SectionHeading title={title} />
          <p className="text-light">{description}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-4/5.25 animate-pulse bg-black/5" />
            ))}

          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default BestSellers;
