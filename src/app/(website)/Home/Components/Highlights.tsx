import { CircleCheck, Layers, Ruler, Scissors } from "lucide-react";
import type { HomePageContent } from "../pagedata";
import { wrap } from "./ui";

/* One icon per position; the words are the admin's. */
const ICONS = [Scissors, Layers, CircleCheck, Ruler];

/** The four promises under the hero. */
export default function Highlights({ items }: HomePageContent["highlights"]) {
  if (!items.length) return null;

  return (
    <section aria-label="Why Baliye" className="border-b border-[#E8DFD3] bg-[#FAF7F2]">
      <ul className={`${wrap} grid grid-cols-2 gap-x-4 gap-y-6 py-6 md:py-7 lg:grid-cols-4 lg:gap-6`}>
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li key={i} className="flex items-start gap-3 md:gap-3.5">
              <Icon className="mt-0.5 size-6 shrink-0 text-secondary" strokeWidth={1.5} aria-hidden />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-dark md:text-[15px]">{item.title}</span>
                <span className="text-xs leading-snug text-[#6B6B6B] md:text-[13px]">{item.text}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
