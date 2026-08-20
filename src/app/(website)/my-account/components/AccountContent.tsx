import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function AccountContent({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`overflow-hidden bg-white ${className}`}
    >
      {children}
    </div>
  );
}