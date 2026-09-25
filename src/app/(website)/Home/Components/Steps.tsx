import LinkButton from "@/components/buttons/LinkButton";
import LineWithFlower from "@/components/LineWithFlower";
import { Container, Section } from "@/components/sectionComponants";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";

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
    <Section className="bg-primary space-y-8 lg:space-y-12">
      <LineWithFlower />
      <Container className="grid lg:grid-cols-2 grid-cols-1 gap-6 items-center">
        <div className="space-y-6">
          <SectionHeading title={title} />
          <p className="text-light">{description}</p>
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
      </Container>
      <LineWithFlower />
    </Section>
  );
};

export default Steps;
