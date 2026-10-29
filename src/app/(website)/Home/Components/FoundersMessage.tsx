import { SectionWithContainer } from "@/components/sectionComponants";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";

interface FoundersMessageProps {
  title: string;
  description: string;
  image: string;
}
const FoundersMessage: React.FC<FoundersMessageProps> = ({
  title,
  description,
  image,
}) => {
  return (
    <SectionWithContainer sectionClassName="" containerClassName="md:space-y-14 space-y-10">
      <div className="text-center space-y-4">
        <SectionHeading title={title} />
        <p className="text-light mx-auto max-w-3xl text-base md:text-lg leading-relaxed">{description}</p>
      </div>
      <div className="w-full aspect-4/3.5 md:aspect-16/6.5 relative overflow-hidden rounded-xl">
        <Image src={image} alt="The founders of Baliye Couture" fill sizes="(max-width: 1280px) 100vw, 1140px" className="object-cover" />
      </div>
    </SectionWithContainer>
  );
};

export default FoundersMessage;
