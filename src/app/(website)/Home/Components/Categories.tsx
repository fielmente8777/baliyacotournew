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
    <Section defaultPadding={false} className="bg-secondary">
      <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
        {/* Text keeps the same side margin as the other sections; the photo
            runs to the edge. On phones the photo comes first, so the section
            doesn't open with a long block of text. */}
        <div className="flex flex-col justify-center gap-5 px-4 py-10 md:px-10 lg:py-16 lg:pl-16 lg:pr-12 xl:pl-24">
          <SectionHeading title={title} titleColor="white" />
          <p className="text-white leading-relaxed">{description}</p>
          <LinkButton
            href={cta.link}
            label={cta.label}
            arrowIcon
            className="mt-2 rounded-full bg-dark gap-4 text-white border-secondary"
          />
          <p className="flex flex-wrap uppercase tracking-wider text-sm">
            {types.map((type, index) => (
              <span key={index} className="flex items-center text-white">
                {type}

                {index !== types.length - 1 && <span className="w-2 bg-white inline-flex rounded-full aspect-square mx-2"/>}
              </span>
            ))}
          </p>
        </div>
        <div className="relative aspect-4/3 w-full max-lg:order-first lg:aspect-auto lg:min-h-[560px]">
          <Image
            src={items[0].image}
            alt={items[0].title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>
      </div>
    </Section>
  );
};

export default Categories;
