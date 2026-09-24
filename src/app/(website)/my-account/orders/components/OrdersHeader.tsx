import { SlidersHorizontal } from "lucide-react";

import PrimaryButton from "../../components/PrimaryButton";

interface Props {
  onFilterClick?: () => void;
  /** Number of filters currently applied — shown as a badge on the button. */
  activeCount?: number;
  isFilterOpen?: boolean;
  /** Orders shown after filtering, e.g. "3 orders". Hidden while loading. */
  resultCount?: number;
}

export default function OrdersHeader({
  onFilterClick,
  activeCount = 0,
  isFilterOpen = false,
  resultCount,
}: Props) {
  return (
    <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#E9E4DC] px-4 sm:px-5 md:px-6">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-[#202020]">All Orders</h2>
        {resultCount !== undefined && (
          <p className="text-xs text-[#8A8A8A]">
            {resultCount} {resultCount === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      <PrimaryButton
        type="button"
        onClick={onFilterClick}
        aria-expanded={isFilterOpen}
        aria-controls="orders-filter-panel"
        className="h-9 shrink-0 gap-2 px-4 sm:px-5"
      >
        <SlidersHorizontal size={14} />
        Filter
        {activeCount > 0 && (
          <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold text-[#A52C45]">
            {activeCount}
          </span>
        )}
      </PrimaryButton>
    </div>
  );
}
