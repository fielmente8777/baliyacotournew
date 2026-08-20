"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { accountMenu } from "./accountMenu";

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-white">
      {accountMenu.map((group, groupIndex) => (
        <div
          key={group.title}
          className={
            groupIndex > 0
              ? "border-t border-[#EAE6DF]"
              : ""
          }
        >
          <h3 className="px-4 pt-5 text-sm font-semibold text-[#222]">
            {group.title}
          </h3>

          <nav className="py-3">
            {group.items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block
                    px-4
                    py-1.5
                    text-sm
                    transition-colors
                    ${
                      isActive
                        ? "font-medium text-[#A52C45]"
                        : "text-[#666] hover:text-[#A52C45]"
                    }
                  `}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}