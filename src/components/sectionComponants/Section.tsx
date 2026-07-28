interface SectionProps {
  className?: string;
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  defaultPadding?: boolean;
}

const Section: React.FC<SectionProps> = ({
  className = "",
  id,
  children,
  defaultPadding = true,
  style = {},
  ...props
}) => {
  return (
    <section
      className={`max_screen_width overflow-x-clip ${defaultPadding ? "py-12 md:py-16" : ""} ${className}`}
      id={id}
      style={style}
      {...props}
    >
      {children}
    </section>
  );
};

export default Section;
