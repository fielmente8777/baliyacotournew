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
            className={`relative flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500 ${
              isDone
                ? "bg-dark text-white"
                : isCurrent
                  ? "bg-secondary text-white shadow-[0_0_0_5px_rgba(155,44,64,0.14)]"
                  : "border border-[#D9CFC2] bg-white text-[#9A9A9A]"
            }`}
          >
            {isDone ? <Check size={14} strokeWidth={3} className="animate-check-pop" aria-hidden="true" /> : number}
          </span>
        );

        const label = (
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors md:text-xs ${
              isCurrent ? "text-dark" : isDone ? "text-[#8B6E54]" : "text-[#A9A9A9]"
            }`}
          >
            {item.label}
          </span>
        );

        return (
          <li key={item.label} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
            {isDone && item.href ? (
              <Link href={item.href} className="flex min-h-11 items-center gap-2 hover:opacity-80">
                {circle}
                {label}
              </Link>
            ) : (
              <span className="flex min-h-11 items-center gap-2" aria-current={isCurrent ? "step" : undefined}>
                {circle}
                {label}
              </span>
            )}

            {index < STEPS.length - 1 && (
              <span className="mx-3 h-px flex-1 overflow-hidden bg-[#E0D6C8]" aria-hidden="true">
                <span
                  className={`block h-full origin-left bg-dark transition-transform duration-700 ease-out ${
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
