import type { ReactNode } from "react";

import Breadcrumb from "@/features/catalog/Breadcrumb";
import { AccentTitle, Eyebrow } from "@/app/(website)/Home/Components/ui";

import CheckoutStepper from "./CheckoutStepper";

interface Props {
  step: 1 | 2;
  /** Breadcrumb label for this page. */
  crumb: string;
  /** Pages between Home and this one. */
  trail?: { label: string; href: string }[];
  title: string;
  /** Words of the title shown in burgundy, as on the home page. */
  accent?: string;
  /** A line under the title, e.g. the item count. */
  meta?: ReactNode;
}

/**
 * The top of every checkout page: breadcrumb, the small "Step 1 of 3"
 * heading, the title with its accent words, and the progress stepper.
 * Same pieces as the home and product pages, so checkout reads as the
 * same shop.
 */
export default function CheckoutHeader({ step, crumb, trail, title, accent, meta }: Props) {
  return (
    <header className="pt-5 md:pt-8">
      <Breadcrumb current={crumb} trail={trail} />

      <div className="mt-6 flex flex-col gap-6 border-b border-[#E8DFD3] pb-7 md:mt-8 md:pb-9 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2.5">
          <Eyebrow>Step {step} of 3</Eyebrow>
          <AccentTitle as="h1" title={title} accent={accent} className="text-[32px] md:text-5xl" />
          {meta && <div className="text-[15px] text-[#6B6B6B]">{meta}</div>}
        </div>

        <CheckoutStepper step={step} />
      </div>
    </header>
  );
}
