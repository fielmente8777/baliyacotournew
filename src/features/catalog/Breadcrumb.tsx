import Link from "next/link";

interface Props {
  /** Current page label — changes with the active filter (e.g. "Bestsellers"). */
  current?: string;
}

export default function Breadcrumb({ current = "Pre-made Designs" }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-[#7B7B7B]">
      <Link href="/" className="shrink-0 transition hover:text-black">
        Home
      </Link>
      <span aria-hidden="true">{">"}</span>
      <span className="truncate font-medium text-black">{current}</span>
    </nav>
  );
}
