import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Small pieces every home section shares, so the page reads as one design:
 * the page width, the small heading above a title, a title with its accent
 * words in burgundy, and the pill buttons.
 */

/** Page width and side margins, the same as the Pre-made Designs page. */
export const wrap = "mx-auto w-full max-w-320 px-4 md:px-10";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B6E54] md:text-xs", className)}>
      {children}
    </p>
  );
}

/** "Find your" + "shape": the accent words show in the brand burgundy. */
export function AccentTitle({
  title,
  accent,
  as: Tag = "h2",
  className,
  accentClassName = "text-secondary",
}: {
  title: string;
  accent?: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  accentClassName?: string;
}) {
  return (
    <Tag className={cn("font-medium leading-[1.06] text-dark", className)}>
      {title}
      {accent && (
        <>
          {" "}
          <span className={accentClassName}>{accent}</span>
        </>
      )}
    </Tag>
  );
}

/** Eyebrow, title and description on the left, an optional link or control on the right. */
export function SectionHead({
  eyebrow,
  title,
  accent,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex flex-col gap-2.5">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <AccentTitle title={title} accent={accent} className="text-[32px] md:text-5xl" />
        {description && <p className="text-[15px] leading-relaxed text-light">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const pill = {
  primary: "bg-secondary text-white hover:opacity-90",
  outline: "border border-dark text-dark hover:bg-dark hover:text-white",
  light: "bg-[#FAF7F2] text-dark hover:bg-white",
  outlineLight: "border border-white/70 text-white hover:bg-white hover:text-dark",
} as const;

export function PillLink({
  href,
  label,
  variant = "primary",
  arrow,
  className,
}: {
  href: string;
  label: string;
  variant?: keyof typeof pill;
  arrow?: boolean;
  className?: string;
}) {
  if (!label) return null;
  return (
    <Link
      href={href || "#"}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-[15px] font-medium transition-colors md:min-h-13",
        pill[variant],
        className
      )}
    >
      {label}
      {arrow && <ArrowRight size={18} aria-hidden />}
    </Link>
  );
}
