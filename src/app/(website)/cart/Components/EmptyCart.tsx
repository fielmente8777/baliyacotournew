import { EmptyBagIllustration } from "@/components/illustrations";

import { AccentTitle, Eyebrow, PillLink } from "../../Home/Components/ui";

/** An empty bag: two ways forward, a ready design or one of their own. */
export default function EmptyCart() {
  return (
    <div className="mt-8 flex animate-rise-in flex-col items-center rounded-md border border-[#E8DFD3] bg-white px-5 py-14 text-center md:py-20">
      <EmptyBagIllustration className="w-36 md:w-44" />
      <Eyebrow className="mt-6">Your bag is empty</Eyebrow>
      <AccentTitle title="Find the one," accent="or make it." className="mt-3 text-[28px] md:text-[40px]" />
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#6B6B6B]">
        Pick a ready-made design, or create one that&apos;s entirely yours.
      </p>
      <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <PillLink href="/products" label="Shop designs" arrow />
        <PillLink href="/create-your-own-design" label="Start designing" variant="outline" />
      </div>
    </div>
  );
}
