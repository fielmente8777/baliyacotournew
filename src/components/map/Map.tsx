import { SectionWithContainer } from "../sectionComponants";
import LazyLoadedMap from "./LazyLoadedMap";

const Map = ({
  src = "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1776.2743961609372!2d73.40126478780162!3d18.976873397073337!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7f9e618a24665%3A0x1e379db0ec186143!2sKamal%20Farms%20Karjat!5e1!3m2!1sen!2sus!4v1734930961269!5m2!1sen!2sus",
}: {
  src: string;
}) => {
  return (
    <SectionWithContainer>
      <div className="relative aspect-square md:aspect-[4/1.35] border-2 border-[#29422C] w-screen max-w-[1224px] lg:mx-auto max-md:w-full">
        <LazyLoadedMap src={src} />
      </div>
      {/* <div className="flex flex-col items-center justify-center mt-4">
        <Button
          label="Get Directions"
          href="https://maps.app.goo.gl/3JkEJeHHYXydK9Nq8"
          newTabe
          className="w-fit"
        />
      </div> */}
    </SectionWithContainer>
  );
};

export default Map;
