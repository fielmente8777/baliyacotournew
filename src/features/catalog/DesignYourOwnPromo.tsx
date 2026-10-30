import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/format';

/** The three design steps beside the call to action. */
const STEPS = [
  { step: '01', title: 'Choose your fabric and colour', description: 'New fabrics every season. Choose from over 10 fabrics and colours.' },
  { step: '02', title: 'Choose your embroidery', description: 'Try every embroidery style on your design before you decide.' },
  { step: '03', title: 'Choose your details', description: 'Neckline, sleeves and fit: make your clothing exactly the way you want it.' },
];

/**
 * The burgundy "design it yourself" block, with the three design steps.
 * Closes the listing and the product page.
 *
 * `href` defaults to a blank design; the product page passes its own
 * builder link so "Start designing" starts from that product.
 */
export default function DesignYourOwnPromo({
  eyebrow = 'Made for you',
  title = "Didn't find the one?",
  accent = 'Design it from scratch.',
  text = "Pick a garment and we'll walk you through the rest, from the first thread to the final stitch.",
  cta = 'Start designing',
  href = '/create-your-own-design',
}: {
  eyebrow?: string;
  title?: string;
  accent?: string;
  text?: string;
  cta?: string;
  href?: string;
}) {
  return (
    <section className="mx-auto max-w-320 px-4 pb-20 md:px-10 md:pb-24">
      <div className="grid items-center gap-8 rounded-md bg-secondary px-5 py-10 text-white md:gap-10 md:px-12 md:py-14 lg:grid-cols-2 lg:gap-14 lg:p-16">
        <div className="flex flex-col items-start gap-5">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#F3D9A4]">
            {eyebrow}
          </p>
          <h2 className="text-[26px] font-medium leading-tight md:text-[42px]">
            {title} <span className="text-[#F8E7CF]">{accent}</span>
          </h2>
          <p className="max-w-md leading-relaxed text-white/85">{text}</p>
          <Link
            href={href}
            className="group inline-flex min-h-13 items-center gap-3 rounded-full bg-[#FAF7F2] px-7 text-[15px] font-semibold text-secondary transition-transform hover:scale-[1.02]"
          >
            {cta}
            <ArrowRight size={18} aria-hidden className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ol className="flex flex-col">
          {STEPS.map((step, i, steps) => (
            <li key={step.step} className={cn('flex gap-4 py-4 md:gap-6 md:py-5', i < steps.length - 1 && 'border-b border-white/20')}>
              <span className="min-w-8 text-xl font-semibold text-[#F3D9A4] md:min-w-9 md:text-2xl">{step.step}</span>
              <div>
                <p className="text-[15px] font-semibold first-letter:uppercase md:text-[17px]">{step.title}</p>
                <p className="mt-1 text-sm text-white/80">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
