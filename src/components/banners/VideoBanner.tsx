import { Container, Section } from "@/components/sectionComponants";
import { LazyLoadedVideo } from "@/components/Video";

interface VideoBannerProps {
  title?: string;
  description?: string;
  image?: string;
  video: {
    src: string;
    poster: string;
  };
}

const VideoBanner: React.FC<VideoBannerProps> = ({
  video,
  title,
  description,
  image,
}) => {
  return (
    <Section
      defaultPadding={false}
      className="relative w-full lg:aspect-[16/7.7] aspect-[4/3.7] overflow-hidden"
    >
      <LazyLoadedVideo src={video.src} poster={video.poster} />
      <div className="absolute inset-0 z-10 bg-black/60" />
      <div className="absolute inset-0 z-20 bg-linear-to-r from-teansparent to-[#382218]/80" />

      <div className="absolute inset-0  z-30 flex items-center text-center justify-center">
        <Container>
          <h1 className="font-primary text-4xl md:text-6xl/tight text-white lg:max-w-6xl mx-auto">
            {title}
          </h1>
          <p className="text-white/50 lg:max-w-6xl mx-auto">{description}</p>
        </Container>
      </div>
    </Section>
  );
};

export default VideoBanner;
