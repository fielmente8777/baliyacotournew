import { SectionWithContainer } from "@/components/sectionComponants";
import Image from "next/image";
import { SectionHeading } from "@/components/typography";

interface StepsProps {
  title: string;
  description: string;
  image: string;
}

const Steps: React.FC<StepsProps> = ({ title, description, image }) => {
  return (
    <SectionWithContainer sectionClassName="bg-primary">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 items-center">
        <div className="space-y-4">
          <SectionHeading title={title} />
          <p className="text-light">{description}</p>
        </div>
        <div className="w-full aspect-4/2 relative">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      </div>
    </SectionWithContainer>
  );
};

export default Steps;
