import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  children,
  className = "",
}: Props) {
  return (
    <section
      className={`
        overflow-hidden
        border
        border-[#ECE6DE]
        bg-white
        ${className}
      `}
    >
      {children}
    </section>
  );
}