import Link from "next/link";
import { LostThreadIllustration } from "@/components/illustrations";

/** Shown for any URL that doesn't exist, and for products that were removed. */
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] animate-page-in flex-col items-center justify-center px-5 py-16 text-center">
      <LostThreadIllustration className="w-56 sm:w-64" />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[3px] text-secondary">Page not found</p>
      <h1 className="mt-2 text-2xl font-medium text-[#222] sm:text-3xl">We lost the thread on this one</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#777]">
        The page you&apos;re looking for has moved or no longer exists.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-md bg-secondary px-6 text-sm font-medium text-white transition hover:opacity-90"
        >
          Shop designs
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-md border border-secondary px-6 text-sm font-medium text-secondary transition hover:bg-secondary hover:text-white"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
