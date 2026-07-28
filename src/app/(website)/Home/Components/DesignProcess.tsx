import { SectionWithContainer } from "@/components/sectionComponants";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";

export interface DesignProcessProps {
  title: string;
  steps: {
    step: string;
    title: string;
    description: string;
    image: string;
  }[];
}

const DesignProcess: React.FC<DesignProcessProps> = ({ title, steps }) => {
  return (
    <SectionWithContainer containerClassName="md:space-y-14 space-y-10">
      <SectionHeading title={title} textCenter />
      <div className="flex flex-wrap gap-8 w-full items-center justify-center">
        {steps.map((step, index) => (
          <StepsCards {...step} key={index} />
        ))}
      </div>
    </SectionWithContainer>
  );
};

export default DesignProcess;

export const StepsCards: React.FC<DesignProcessProps["steps"][0]> = ({
  title,
  description,
  image,
}) => {
  return (
    <div className="flex flex-col space-y-4 border border-dark p-6 box-shadow w-90">
      <div className="w-10 aspect-square relative">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      <p className="text-xl uppercase">{title}</p>
      <p className="">{description}</p>
    </div>
  );
};
