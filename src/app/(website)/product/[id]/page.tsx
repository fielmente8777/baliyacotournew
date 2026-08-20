import { product } from "./pageData";

// import Breadcrumb from "./Components/Breadcrumb";
import DesignProcess from "./Components/DesignProcess";
import { homePageData } from "../../Home/pagedata";
import CustomerReviews from "./Components/CustomerReviews";
import ProductGallery from "./Components/ProductGallery";
import ProductInfo from "./Components/ProductInfo";
import RelatedProducts from "./Components/RelatedProducts";
import { Section } from "@/components/sectionComponants";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const productData = {
    ...product,
    id: Number(id),
  };

  return (
    <main className="bg-[#FAF7F2]">

      {/* Breadcrumb */}
      {/* <section className="container mx-auto px-4 pt-10">
        <Breadcrumb />
      </section> */}

      {/* Product */}
      <Section>

        <div className="grid gap-16 lg:grid-cols-2 max_width">

          <ProductGallery
            images={productData.images}
          />

          <ProductInfo
            product={productData}
          />

        </div>

        

      </Section>

      {/* How to Design */}
      <DesignProcess {...homePageData.designProcess} />

      {/* Reviews */}
      <CustomerReviews />

      {/* Related Products */}
      <RelatedProducts />

    </main>
  );
}