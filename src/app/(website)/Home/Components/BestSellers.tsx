import { SectionWithContainer } from "@/components/sectionComponants";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";

interface BestSellersProps {
  title: string;
  description: string;
  products: {
    name: string;
    image: string;
  }[];
}

const BestSellers: React.FC<BestSellersProps> = ({
  title,
  description,
  products,
}) => {
  return (
    <SectionWithContainer sectionClassName="">
      <div className="text-center space-y-4">
        <SectionHeading title={title} />
        <p className="text-light">{description}</p>
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-8 mt-8">
        {products.map((product, index) => (
          <div key={index} className="aspect-4/5.25 relative">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </SectionWithContainer>
  );
};

export default BestSellers;
