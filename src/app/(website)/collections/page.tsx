import { Section } from "@/components/sectionComponants";
import Breadcrumb from "./Components/Breadcrumb";
import ProductGrid from "./Components/ProductGrid";
import SortButton from "./Components/SortButton";
import { products } from "./pageData";

export default function CollectionsPage() {
  return (
    <main className="">
      <Section className="md:px-10 px-4">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center mb-8">
          <Breadcrumb />
          <SortButton />
        </div>
        {/* <div className="mt-8">
          <h1
            className="
            text-4xl
            font-semibold
            text-[#222]
          "
          >
            Pre-designed Collection
          </h1>

          <p
            className="
            mt-3
            max-w-2xl
            text-[#666]
          "
          >
            Discover timeless elegance with our curated collection of
            handcrafted ethnic wear.
          </p>
        </div>

        <div
          className="
          mt-10
          flex
          flex-col
          gap-4

          md:flex-row
          md:items-center
          md:justify-between
        "
        >
          <p
            className="
            text-sm
            text-[#666]
          "
          >
            Showing <span className="font-semibold">{products.length}</span>{" "}
            Products
          </p>

          
        </div> */}

        <ProductGrid products={products} />
      </Section>
    </main>
  );
}
