import Link from "next/link";
import { Check } from "lucide-react";

interface Props {
  step: 1 | 2;
}

/* Payment happens on Shopify's hosted checkout, so it's shown as the step
   that comes next rather than a page of our own. */
const STEPS = [
  { label: "Bag", href: "/cart" },
  { label: "Address", href: "/shipping" },
  { label: "Payment", href: null },
] as const;

export default function CheckoutStepper({ step }: Props) {
  return (
    <ol className="flex w-full max-w-md items-center" aria-label="Checkout progress">
      {STEPS.map((item, index) => {
        const number = index + 1;
        const isDone = number < step;
        const isCurrent = number === step;

        const circle = (
          <span
            className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500 ${
              isDone
                ? "bg-[#6D8C54] text-white"
                : isCurrent
                  ? "bg-[#972E47] text-white shadow-[0_0_0_5px_rgba(151,46,71,0.14)]"
                  : "border border-[#D9D3C8] bg-white text-[#9A9A9A]"
            }`}
          >
            {isDone ? <Check size={14} strokeWidth={3} className="animate-check-pop" aria-hidden="true" /> : number}
          </span>
        );

        const label = (
          <span
            className={`text-sm transition-colors ${
              isCurrent ? "font-semibold text-[#222]" : isDone ? "font-medium text-[#4E6B3C]" : "text-[#9A9A9A]"
            }`}
          >
            {item.label}
          </span>
        );

        return (
          <li key={item.label} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
            {isDone && item.href ? (
              <Link href={item.href} className="flex items-center gap-2 hover:opacity-80">
                {circle}
                {label}
              </Link>
            ) : (
              <span className="flex items-center gap-2" aria-current={isCurrent ? "step" : undefined}>
                {circle}
                {label}
              </span>
            )}

            {index < STEPS.length - 1 && (
              <span className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-[#E4DED4]" aria-hidden="true">
                <span
                  className={`block h-full origin-left rounded-full bg-[#6D8C54] transition-transform duration-700 ease-out ${
                    isDone ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
