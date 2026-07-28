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
        <p className="text-light lg:max-w-7xl">{description}</p>
      </div>
      <div className="w-full aspect-4/3.5 md:aspect-16/6.5 relative">
        <Image src={image} alt={title} fill className="object-cover rounded-xl" />
      </div>
    </SectionWithContainer>
  );
};

export default FoundersMessage;
