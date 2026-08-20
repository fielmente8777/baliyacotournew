import { SlidersHorizontal } from "lucide-react";

import PrimaryButton from "../../components/PrimaryButton";

interface Props {
  onFilterClick?: () => void;
}

export default function OrdersHeader({
  onFilterClick,
}: Props) {
  return (
    <div className="flex min-h-[58px] items-center justify-between border-b border-[#E9E4DC] px-5 md:px-6">
      <h2 className="text-base font-semibold text-[#202020]">
        All Orders
      </h2>

      <PrimaryButton
        type="button"
        onClick={onFilterClick}
        className="h-9 gap-2 px-5"
      >
        <SlidersHorizontal size={14} />
        Filter
      </PrimaryButton>
    </div>
  );
}