import { JSX } from "react";
interface HeadingsProps {
  level: number;
  heading: string;
  className?: string;
  style?: React.CSSProperties;
}

const Headings: React.FC<HeadingsProps> = ({
  heading,
  level,
  className,
  style,
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={`${className}`}
      dangerouslySetInnerHTML={{ __html: heading }}
      style={style}
    />
  );
};

export default Headings;
