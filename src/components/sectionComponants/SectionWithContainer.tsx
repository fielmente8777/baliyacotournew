import Container from "./Container";
import Section from "./Section";

import React from "react";

interface SectionWithContainerProps {
  sectionId?: string;
  containerId?: string;
  sectionClassName?: string;
  containerClassName?: string;
  children: React.ReactNode;
  containerStyle?: React.CSSProperties;
  sectionStyle?: React.CSSProperties;
  defaultPadding?: boolean;
  sectionProps?: React.HTMLAttributes<HTMLElement>;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

const SectionWithContainer: React.FC<SectionWithContainerProps> = ({
  sectionId = "",
  containerId = "",
  sectionClassName = "",
  containerClassName = "",
  sectionStyle = {},
  containerStyle = {},
  children,
  defaultPadding = true,
  sectionProps = {},
  containerProps = {},
}) => {
  return (
    <Section
      id={sectionId}
      className={sectionClassName}
      style={sectionStyle}
      defaultPadding={defaultPadding}
      {...sectionProps}
    >
      <Container
        id={containerId}
        className={containerClassName}
        style={containerStyle}
        {...containerProps}
      >
        {children}
      </Container>
    </Section>
  );
};

export default SectionWithContainer;
