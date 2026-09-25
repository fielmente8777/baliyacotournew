"use client";

import LinkButton from "@/components/buttons/LinkButton";
import { Container, Section } from "@/components/sectionComponants";
import SwiperCarousel from "@/components/sliders/SwiperCarousel";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";
import { Autoplay, Navigation } from "swiper/modules";

interface PreMadeDesignsProps {
  title: string;
  description: string;
  images: { src: string; alt: string }[];
  button: {
    label: string;
    link: string;
  };
}

const PreMadeDesigns: React.FC<PreMadeDesignsProps> = ({
  title,
  description,
  images,
  button,
}) => {
  return (
    <Section className="bg-dark flex flex-col lg:gap-14 gap-10">
      <Container>
        <SectionHeading title={title} textCenter titleColor="white" />
        <p className="text-white/50 text-center">{description}</p>
      </Container>
      <div className="xl:max-w-360 w-full ml-auto">
        <SwiperCarousel
          data={images}
          slidesPerView={2.5}
          spaceBetween={30}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            768: {
              slidesPerView: 3.5,
              spaceBetween: 40,
            },
            1024: {
              slidesPerView: 4.5,
              spaceBetween: 50,
            },
          }}
          modules={[Autoplay, Navigation]}
          navigation={{
            nextEl: ".button-next",
            prevEl: ".button-prev",
          }}
          renderSlide={(src) => (
            <div className="w-full relative aspect-4/5.25">
              <Image
                src={src.src}
                alt={src.alt}
                fill
                className="object-cover"
              />
            </div>
          )}
        />
      </div>
      <LinkButton
        href={button.link}
        label={button.label}
        arrowIcon
        className="rounded-full bg-dark gap-4 text-white self-center"
      />
    </Section>
  );
};

export default PreMadeDesigns;
