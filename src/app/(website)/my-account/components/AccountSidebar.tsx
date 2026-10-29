"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LogOut } from "lucide-react";

import { useLogoutConfirm } from "@/features/auth/LogoutConfirm";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { useCreditsEnabled } from "@/store/api/settingsApi";

import { accountMenu, initialsOf, isMenuItemActive, type AccountMenuItem } from "./accountMenu";
import { useAccountCounts } from "./useAccountCounts";
import { formatPhone } from "@/lib/phone";

function CountBadge({ value, active }: { value?: number; active: boolean }) {
  if (!value) return null;
  return (
    <span
      className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
        active ? "bg-[#A52C45] text-white" : "bg-[#F5ECEE] text-[#A52C45]"
      }`}
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}

function useVisibleMenu() {
  const creditsEnabled = useCreditsEnabled();
  return accountMenu
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.requiresCredits || creditsEnabled),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * Phones and tablets: one swipeable row of tabs under the title, so the
 * page content starts right away instead of below a long stacked menu.
 */
function MobileAccountNav({ counts }: { counts: ReturnType<typeof useAccountCounts> }) {
  const pathname = usePathname();
  const items = useVisibleMenu().flatMap((group) => group.items);
  const activeRef = useRef<HTMLAnchorElement>(null);

  /* Keep the current tab in view after navigating from a link elsewhere. */
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <nav aria-label="My account" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:-mx-6 md:px-6 lg:hidden [&::-webkit-scrollbar]:hidden">
      <ul className="flex w-max gap-2 pb-1">
        {items.map((item) => {
          const isActive = isMenuItemActive(item, pathname);
          const Icon = item.icon;
          const count = item.badge ? counts[item.badge] : undefined;
          return (
            <li key={item.href}>
              <Link
                ref={isActive ? activeRef : undefined}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors ${
                  isActive
                    ? "border-[#A52C45] bg-[#A52C45] font-medium text-white"
                    : "border-[#EAE6DF] bg-white text-[#555] hover:border-[#A52C45] hover:text-[#A52C45]"
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {item.title}
                {!!count && (
                  <span
                    className={`flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                      isActive ? "bg-white text-[#A52C45]" : "bg-[#F5ECEE] text-[#A52C45]"
                    }`}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DesktopLink({ item, count }: { item: AccountMenuItem; count?: number }) {
  const pathname = usePathname();
  const isActive = isMenuItemActive(item, pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={`relative mx-2 flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors duration-200 ${
        isActive
          ? "bg-[#FBF6F7] font-medium text-[#A52C45] before:absolute before:inset-y-2 before:-left-2 before:w-[3px] before:rounded-r-full before:bg-[#A52C45] before:content-['']"
          : "text-[#555] hover:bg-[#FAF8F4] hover:text-[#A52C45]"
      }`}
    >
      <Icon size={17} aria-hidden="true" className="shrink-0" />
      {item.title}
      <CountBadge value={count} active={isActive} />
    </Link>
  );
}

export default function AccountSidebar() {
  const { askToLogOut, logoutDialog } = useLogoutConfirm();
  const { data: profile } = useGetProfileQuery();
  const counts = useAccountCounts();
  const groups = useVisibleMenu();

  return (
    <>
      <MobileAccountNav counts={counts} />

      <aside className="hidden self-start overflow-hidden rounded-lg border border-[#EAE6DF] bg-white lg:sticky lg:top-6 lg:block">
        {/* Whoever is signed in — useful when several people share a device. */}
        <div className="flex items-center gap-3 border-b border-[#EAE6DF] bg-[#FBF6F7] px-4 py-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A52C45] text-sm font-semibold tracking-wide text-white">
            {initialsOf(profile?.name)}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-[#8A8A8A]">Hello,</p>
            <p className="truncate text-sm font-semibold text-[#222]">{profile?.name || "Welcome"}</p>
            <p className="truncate text-xs text-[#8A8A8A]">{formatPhone(profile?.phone) || profile?.email || ""}</p>
          </div>
        </div>

        {groups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? "border-t border-[#F2EEE8]" : ""}>
            <h3 className="px-5 pt-4 text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
              {group.title}
            </h3>
            <nav className="space-y-0.5 py-2" aria-label={group.title}>
              {group.items.map((item) => (
                <DesktopLink key={item.href} item={item} count={item.badge ? counts[item.badge] : undefined} />
              ))}
            </nav>
          </div>
        ))}

        <div className="border-t border-[#EAE6DF] p-2">
          <button
            type="button"
            onClick={askToLogOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-[#555] transition-colors hover:bg-[#FBF6F7] hover:text-[#A52C45]"
          >
            <LogOut size={17} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>

      {logoutDialog}
    </>
  );
}
