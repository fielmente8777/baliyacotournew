import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  /** Current page label — changes with the active filter (e.g. "Bestsellers"). */
  current?: string;
  /** Pages between Home and the current one, e.g. Pre-made Designs › Kurtis. */
  trail?: { label: string; href: string }[];
}

export default function Breadcrumb({ current = "Pre-made Designs", trail = [] }: Props) {
  const links = [{ label: "Home", href: "/" }, ...trail];

  return (
    /* A long trail scrolls sideways on phones rather than spilling off-screen. */
    <nav aria-label="Breadcrumb" className="scrollbar-none min-w-0 overflow-x-auto">
      <ol className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[13px] text-[#7B7B7B] md:text-sm">
        {links.map((link) => (
          <li key={link.href} className="flex shrink-0 items-center gap-1.5">
            <Link href={link.href} className="transition hover:text-secondary">
              {link.label}
            </Link>
            <ChevronRight size={13} aria-hidden className="text-[#B5ABA0]" />
          </li>
        ))}
        <li aria-current="page" className="max-w-[60vw] truncate font-medium text-dark md:max-w-none">
          {current}
        </li>
      </ol>
    </nav>
  );
}
