"use client";

import { usePathname } from "next/navigation";

import Breadcrumb from "@/features/catalog/Breadcrumb";

import { AccentTitle, Eyebrow } from "../../Home/Components/ui";
import { accountMenu, isMenuItemActive } from "./accountMenu";

const ITEMS = accountMenu.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })));

/**
 * The top of every My Account page, in the home and product pages' style:
 * breadcrumb (Home › My account › section), the menu group as the small
 * heading, and the title with its accent word. The title stays "My account"
 * on every section so it doesn't jump while moving between them; the
 * breadcrumb names the section.
 */
export default function AccountHeader() {
  const pathname = usePathname();

  const item = ITEMS.find((i) => isMenuItemActive(i, pathname));
  const isOverview = !item || item.exact;
  /* A page below a section (an order's detail) links back to the section. */
  const isNested = !!item && !item.exact && pathname !== item.href;

  const trail = [
    ...(isOverview ? [] : [{ label: "My account", href: "/my-account" }]),
    ...(isNested ? [{ label: item.title, href: item.href }] : []),
  ];
  const current = isOverview ? "My account" : isNested ? "Order details" : item.title;

  return (
    <header className="pt-5 md:pt-8">
      <Breadcrumb current={current} trail={trail} />

      <div className="mt-6 flex flex-col gap-2.5 border-b border-[#E8DFD3] pb-6 md:mt-8 md:pb-8">
        <Eyebrow>{isOverview ? "Baliye Couture" : item.group}</Eyebrow>
        <AccentTitle as="h1" title="My" accent="account" className="text-[32px] md:text-5xl" />
      </div>
    </header>
  );
}
