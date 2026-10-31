import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/format";

const TONES = {
  warning: { box: "border-[#F1D9A8] bg-[#FDF7EA] text-[#7A5A1E]", Icon: AlertTriangle },
  error: { box: "border-[#F0CFD6] bg-[#FBEAEA] text-secondary", Icon: AlertCircle },
} as const;

interface Props {
  tone?: keyof typeof TONES;
  children: ReactNode;
  /** "alert" for messages that follow an action, so screen readers announce them. */
  role?: "alert";
  className?: string;
}

/** A coloured message box: mixed-cart warnings, out of stock, checkout errors. */
export default function Notice({ tone = "warning", children, role, className }: Props) {
  const { box, Icon } = TONES[tone];
  return (
    <div role={role} className={cn("flex gap-3 rounded-md border px-4 py-3.5 text-sm leading-relaxed", box, className)}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
