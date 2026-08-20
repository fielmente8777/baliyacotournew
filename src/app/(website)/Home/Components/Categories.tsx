import LinkButton from "@/components/buttons/LinkButton";
import { Section } from "@/components/sectionComponants";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";

interface CategoriesProps {
  title: string;
  description: string;
  items: {
    title: string;
    image: string;
    link: string;
  }[];
  types: string[];
  cta: {
    label: string;
    link: string;
  };
}
const Categories: React.FC<CategoriesProps> = ({
  title,
  description,
  items,
  types,
  cta,
}) => {
  return (
    <Section defaultPadding={false} className="bg-secondary max-xl:px-4 max-lg:py-10">
      <div className="max-w-[1440px] ml-auto items-center grid lg:grid-cols-2 grid-cols-1 gap-6">
        <div className="flex flex-col gap-4">
          <SectionHeading title={title} titleColor="white" />
          <p className="text-white">{description}</p>
          <LinkButton
            href={cta.link}
            label={cta.label}
            arrowIcon
            className="lg:my-16 rounded-full bg-dark gap-4 text-white border-secondary"
          />
          <p className="flex flex-wrap uppercase">
            {types.map((type, index) => (
              <span key={index} className="flex items-center text-white">
                {type}

                {index !== types.length - 1 && <span className="w-2 bg-white inline-flex rounded-full aspect-square mx-2"/>}
              </span>
            ))}
          </p>
        </div>
        <div className="w-full relative aspect-4/5 ">
          <Image
            src={items[0].image}
            alt={items[0].title}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
};

export default Categories;
