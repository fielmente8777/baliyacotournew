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
      <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-8">
        {steps.map((step, index) => (
          <StepsCards {...step} key={index} />
        ))}
      </div>
    </SectionWithContainer>
  );
};

export default DesignProcess;

const StepsCards: React.FC<DesignProcessProps["steps"][0]> = ({
  title,
  description,
  image,
}) => {
  return (
    <div className="flex flex-col space-y-3 border border-dark p-6 box-shadow">
      <div className="w-10 aspect-square relative">
        <Image src={image} alt="" fill className="object-cover" />
      </div>
      <h3 className="text-lg font-semibold first-letter:uppercase">{title}</h3>
      <p>{description}</p>
    </div>
  );
};
