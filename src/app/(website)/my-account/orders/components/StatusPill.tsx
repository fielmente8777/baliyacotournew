import type { OrderStage } from '../orderView';

const STYLES: Record<OrderStage, string> = {
  active: 'bg-[#FBF3E6] text-[#9A6413]',
  delivered: 'bg-[#EAF2EA] text-[#3B6A3D]',
  cancelled: 'bg-[#FBECEB] text-[#B3261E]',
};

const DOT: Record<OrderStage, string> = {
  active: 'bg-[#C98A2B]',
  delivered: 'bg-[#4C7A4E]',
  cancelled: 'bg-[#B3261E]',
};

/** Status as a tinted chip — readable at a glance in a list of orders. */
export default function StatusPill({ stage, label }: { stage: OrderStage; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${STYLES[stage]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[stage]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
