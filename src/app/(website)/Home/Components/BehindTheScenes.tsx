"use client";
import { SectionWithContainer } from "@/components/sectionComponants";
import SwiperCarousel from "@/components/sliders/SwiperCarousel";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";
import { Autoplay, EffectFade } from "swiper/modules";

interface BehindTheScenesProps {
  title: string;
  description: string;
  images: string[][];
}

const BehindTheScenes: React.FC<BehindTheScenesProps> = ({
  title,
  description,
  images,
}) => {
  const gridPattern = [
    "row-span-6",
    "row-span-3",
    "row-span-6",
    "row-span-2",
    "row-span-4",
    "row-span-3",
  ];

  return (
    <SectionWithContainer sectionClassName="bg-primary">
      <div className="text-center space-y-2">
        <SectionHeading title={title} />
        <p className="text-light">{description}</p>
      </div>
      <div className="mt-10">
        <SwiperCarousel
          data={images}
          slidesPerView={1}
          spaceBetween={30}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay, EffectFade]}
          effect="fade"
          renderSlide={(images) => (
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 grid-flow-row auto-rows-23 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`${
                    gridPattern[index % gridPattern.length]
                  } overflow-hidden relative aspect-auto`}
                >
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover rounded-sm"
                  />
                  {/* <div className="absolute inset-0 bg-black/40 z-10 text-white">{index}</div> */}
                </div>
              ))}
            </div>
          )}
        />
      </div>
    </SectionWithContainer>
  );
};

export default BehindTheScenes;
