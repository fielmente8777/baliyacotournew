import ProductCard from "@/app/(website)/collections/Components/ProductCard";
import { products } from "@/app/(website)/collections/pageData";
import { Container, Section } from "@/components/sectionComponants";

export default function RelatedProducts() {
  return (
    <Section className="px-4">
      <Container className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-4xl">You might be interested in</h2>

          <p className="mt-3 text-[#666]">
            Celebrate the magic of the Holiday Season through exceptional
          </p>
        </div>

        <button className="rounded-lg bg-[#8D2F46] px-10 py-3 text-white">
          Explore More Designs !!
        </button>
      </Container>

      <div className="mt-10 grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 5).map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </Section>
  );
}
