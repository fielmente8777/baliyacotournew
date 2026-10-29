import { Truck } from "lucide-react";

export default function DeliveryBanner() {
  return (
    <div className="mt-4 flex items-center justify-center gap-2.5 rounded-md bg-[#E8F7E7] px-4 py-3 text-sm text-[#54724D]">
      <Truck size={18} aria-hidden="true" className="shrink-0" />
      Tailored and Delivered in 3 weeks
    </div>
  );
}
