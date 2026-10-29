"use client";

import LinkButton from "@/components/buttons/LinkButton";
import { Container, Section } from "@/components/sectionComponants";
import SwiperCarousel from "@/components/sliders/SwiperCarousel";
import { SectionHeading } from "@/components/typography";
import Image from "next/image";
import Link from "next/link";
import { Autoplay, Navigation } from "swiper/modules";

interface PreMadeDesignsProps {
  title: string;
  description: string;
  images: { src: string; alt: string; link?: string }[];
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
          slidesPerView={1.6}
          spaceBetween={16}
          /* Breathing room at both ends, so the first card isn't flush
             against the screen edge. */
          slidesOffsetBefore={16}
          slidesOffsetAfter={16}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            768: {
              slidesPerView: 2.6,
              spaceBetween: 24,
              slidesOffsetBefore: 32,
              slidesOffsetAfter: 32,
            },
            1024: {
              slidesPerView: 3.4,
              spaceBetween: 32,
              slidesOffsetBefore: 48,
              slidesOffsetAfter: 48,
            },
          }}
          modules={[Autoplay, Navigation]}
          navigation={{
            nextEl: ".button-next",
            prevEl: ".button-prev",
          }}
          renderSlide={(slide) => (
            <Link
              href={slide.link || button.link}
              className="group block w-full relative aspect-4/5.25 overflow-hidden"
            >
              <Image
                src={slide.src}
                alt={slide.alt || title}
                fill
                sizes="(max-width: 768px) 60vw, 30vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>
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
