import type { ReactNode } from "react";

interface Props {
  title: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  action,
}: Props) {
  return (
    <div className="flex min-h-[58px] items-center justify-between border-b border-[#EAE6DF] px-5 md:px-6">
      <h2 className="text-base font-semibold text-[#222]">
        {title}
      </h2>

      {action}
    </div>
  );
}