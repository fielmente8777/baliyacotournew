import type { ReactNode } from "react";

/** Input classes shared by every My Account form. */
export const accountInputClass =
  "h-12 w-full rounded-md border border-[#EAE6DF] bg-white px-4 text-sm outline-none transition-colors focus:border-[#A52C45]";

/** A small uppercase label above a field, the way every My Account form lays them out. */
export default function FormField({
  label,
  optional,
  className = "",
  children,
}: {
  label: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#8A8A8A]">
        {label}
        {optional && <span className="ml-1 normal-case tracking-normal text-[#AFAFAF]">(optional)</span>}
      </p>
      {children}
    </div>
  );
}
