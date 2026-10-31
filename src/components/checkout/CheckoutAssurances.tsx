import { Hand, Truck } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Tailored and delivered in 3 weeks", text: "Made with care, then sent to your door." },
  { icon: Hand, title: "Handcrafted", text: "Cut and finished by our artisans." },
];

/** What every order comes with, in the product page's style. Sits under the price summary. */
export default function CheckoutAssurances() {
  return (
    <ul className="mt-4 grid gap-4 rounded-md border border-[#E8DFD3] bg-white p-4 sm:p-5">
      {ITEMS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary">
            <Icon size={17} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-dark">{title}</span>
            <span className="block text-[13px] leading-snug text-[#6B6B6B]">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
