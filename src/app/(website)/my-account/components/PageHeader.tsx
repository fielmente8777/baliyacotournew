import type { ReactNode } from "react";

interface Props {
  title: string;
  /** A line under the title, e.g. "3 saved". */
  subtitle?: ReactNode;
  action?: ReactNode;
}

/** The heading row at the top of a section's panel. */
export default function PageHeader({
  title,
  subtitle,
  action,
}: Props) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 border-b border-[#F1EBE2] px-5 py-4 md:px-6">
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold text-dark md:text-lg">
          {title}
        </h2>
        {subtitle && <div className="mt-0.5 text-[13px] text-[#6B6B6B]">{subtitle}</div>}
      </div>

      {action}
    </div>
  );
}
