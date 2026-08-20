import { SectionWithContainer } from "@/components/sectionComponants";
import Image from "next/image";
import { SectionHeading } from "@/components/typography";
import LinkButton from "@/components/buttons/LinkButton";

interface StepsProps {
  title: string;
  description: string;
  image: string;
  cta: {
    label: string;
    link: string;
  };
}

const Steps: React.FC<StepsProps> = ({ title, description, image, cta }) => {
  return (
    <SectionWithContainer sectionClassName="bg-secondary">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 items-center">
        <div className="space-y-4">
          <SectionHeading title={title} titleColor="white" />
          <p className="text-white">{description}</p>
          <LinkButton
            href={cta.link}
            label={cta.label}
            arrowIcon
            className="rounded-full bg-dark gap-4 text-white border-secondary"
          />
        </div>
        <div className="w-full aspect-4/2 relative">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      </div>
    </SectionWithContainer>
  );
};

export default Steps;
