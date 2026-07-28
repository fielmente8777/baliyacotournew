import Image from "next/image";
import LandingNavbar from "../navbar/LandingNavbar";
import { Section } from "../sectionComponants";
// import Form1 from "../forms/Form1";
// import { FillLocationIcon } from "@/utils/icons";

interface ImageBannerProps {
  tag: string;
  title: string;
  description: string;
  image: string;
  benefits: string;
}
const ImageBanner: React.FC<ImageBannerProps> = ({
  title,
  image,
  tag,
  description,
  benefits,
}) => {
  return (
    <Section
      defaultPadding={false}
      className="relative w-full lg:aspect-16/8 aspect-[4/5.2] overflow-hidden"
    >
      <div className="inset-x-0 absolute z-30 ">
        <LandingNavbar />
      </div>
      <Image src={image} alt={title} fill className="object-cover" />
      <div className="absolute inset-0 z-10 bg-black/40 " />

      {/* <div className="absolute inset-0  z-20 flex items-end pb-10 justify-center">
        <Container>
          <div className="flex flex-col items-center  gap-6 max-md:gap-30">
            <div className="space-y-2 text-center md:max-w-xl w-full mx-auto">
              <p className="flex items-center gap-2 text-sm text-white w-fit mx-auto border border-primary py-1.5 px-3 rounded-full uppercase tracking-widest">
                <span>
                  <FillLocationIcon />
                </span>
                {tag}
              </p>
              <h1
                className="font-primary text-4xl md:text-6xl/tight text-white lg:max-w-6xl"
                dangerouslySetInnerHTML={{ __html: title }}
              ></h1>
              <p className="text-[#FAF6F2A6] max-w-3xl mt-4">{description}</p>
            </div>
            <div
              className="bg-white/40 border max-lg:hidden border-white/10 backdrop-blur-xs py-6 px-1.5 rounded-[20px] mt-8 flex flex-col gap-5"
              id="form"
            >
              <Form1 />
              <p
                className="text-sm text-white tracking-widest text-center"
                dangerouslySetInnerHTML={{ __html: benefits }}
              />
            </div>
          </div>
        </Container>
      </div> */}
    </Section>
  );
};

export default ImageBanner;
