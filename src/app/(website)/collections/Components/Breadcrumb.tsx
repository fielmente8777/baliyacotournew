import Link from "next/link";

export default function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-sm text-[#7B7B7B]">

      <Link
        href="/"
        className="transition hover:text-black"
      >
        Home
      </Link>

      {">"}

      <span className="font-medium text-black">
        Pre-designed Collection
      </span>

    </div>
  );
}