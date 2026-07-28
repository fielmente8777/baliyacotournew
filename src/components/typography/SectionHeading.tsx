import Image from "next/image";
import Headings from "./Headings";

interface SectionHeadingDescProps {
  title?: string;
  subTitle?: string;

  level?: 1 | 2 | 3 | 4 | 5 | 6; // base level (title)
  subLevel?: 2 | 3 | 4 | 5 | 6; // optional override

  textCenter?: boolean;
  mdTextCenter?: boolean;
  smTextCenter?: boolean;
  titleColor?: string;
  subTitleColor?: string;
  wrapperClassName?: string;
  titleClassName?: string;
  subTitleClassName?: string;
  line?: boolean;
  logo?: boolean;
  fontPrimary?: boolean;
  titleStyle?: React.CSSProperties;
}

const SectionHeading: React.FC<SectionHeadingDescProps> = ({
  title,
  subTitle,
  line = false,
  textCenter = line ? true : false,
  titleColor,
  subTitleColor,
  smTextCenter = false,
  mdTextCenter = false,
  wrapperClassName = "",
  titleClassName = "",
  subTitleClassName = "",
  logo = false,
  level,
  subLevel,
  fontPrimary = false,
  titleStyle,
}) => {
  const titleLevel = level ?? 2;
  const subTitleLevel = subLevel ?? Math.min(titleLevel + 1, 6);

  return (
    <div className={`flex flex-col gap-2 line ${wrapperClassName}`}>
      {logo && (
        <div className="flex justify-center">
          <Image src={"/logo3.png"} alt="logo" width={130} height={130} />
        </div>
      )}
      <div className={`${line && "lg:flex items-center gap-4 mx-auto"}`}>
        {line && (
          <span className="lg:block hidden">
            <LineRight />
          </span>
        )}
        {title && (
          <Headings
            level={titleLevel}
            heading={title}
            className={`${titleClassName} ${
              mdTextCenter ? "md:text-center" : ""
            } ${textCenter ? "text-center" : ""} ${
              smTextCenter ? "max-md:text-center" : ""
            } ${
              titleColor ? `text-${titleColor}` : "text-p2"
            } md:text-5xl/tight text-[2rem]/tight  font-primary `}
            style={titleStyle}
          />
        )}

        {line && (
          <span className="lg:block hidden">
            <LineLeft />
          </span>
        )}
        {line && (
          <span className="lg:hidden block mx-auto mt-2 w-fit">
            <BottomLine />
          </span>
        )}
      </div>
      {subTitle && (
        <Headings
          level={subTitleLevel}
          className={`text-[1.063rem] uppercase ${fontPrimary ? "primary-font" : "secondary-font"} ${subTitleClassName} ${subTitleColor ? `text-${subTitleColor}` : "text-primary"} ${
            mdTextCenter ? "md:text-center" : ""
          } ${textCenter ? "text-center mx-auto" : ""} ${
            smTextCenter ? "max-md:text-center" : ""
          }`}
          heading={subTitle}
        />
      )}
    </div>
  );
};

export default SectionHeading;

export const LineRight = () => (
  <svg
    width={84}
    height={11}
    viewBox="0 0 84 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect y="0.5" width={60} height={2} fill="#E8B716" />
    <rect x={24} y="8.5" width={60} height={2} fill="#E8B716" />
  </svg>
);

export const LineLeft = () => (
  <svg
    width={84}
    height={11}
    viewBox="0 0 84 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x={24} y="0.5" width={60} height={2} fill="#E8B716" />
    <rect y="8.5" width={60} height={2} fill="#E8B716" />
  </svg>
);

export const BottomLine = () => (
  <svg
    width={180}
    height={11}
    viewBox="0 0 180 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect y={1} width={180} height={2} fill="#E8B716" />
    <rect x={52} y={9} width={76} height={2} fill="#E8B716" />
  </svg>
);
