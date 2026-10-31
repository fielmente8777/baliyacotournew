"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ChevronRight, LogOut } from "lucide-react";

import { useLogoutConfirm } from "@/features/auth/LogoutConfirm";
import { useGetProfileQuery } from "@/store/api/profileApi";
import { useCreditsEnabled } from "@/store/api/settingsApi";
import { cn } from "@/lib/format";
import { formatPhone } from "@/lib/phone";

import { accountMenu, initialsOf, isMenuItemActive, type AccountMenuItem } from "./accountMenu";
import { useAccountCounts } from "./useAccountCounts";

function CountBadge({ value, active, className }: { value?: number; active: boolean; className?: string }) {
  if (!value) return null;
  return (
    <span
      className={cn(
        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
        active ? "bg-secondary text-white" : "bg-secondary/10 text-secondary",
        className
      )}
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
 * Phones and tablets: one swipeable row of pill tabs under the title, so the
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
    <nav aria-label="My account" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:-mx-10 md:px-10 lg:hidden [&::-webkit-scrollbar]:hidden">
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
                className={cn(
                  "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-secondary bg-secondary text-white"
                    : "border-[#E0D6C8] bg-white text-dark hover:border-secondary hover:text-secondary"
                )}
              >
                <Icon size={15} aria-hidden="true" />
                {item.title}
                {!!count && (
                  <span
                    className={cn(
                      "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                      isActive ? "bg-white text-secondary" : "bg-secondary/10 text-secondary"
                    )}
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
      className={cn(
        "group flex min-h-11 items-center gap-3 rounded-full px-3 text-sm transition-colors duration-200",
        isActive ? "bg-[#FAF7F2] font-semibold text-secondary" : "text-[#555] hover:bg-[#FAF7F2] hover:text-dark"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
          isActive ? "bg-secondary text-white" : "bg-[#F1EDE6] text-[#8B6E54] group-hover:text-secondary"
        )}
      >
        <Icon size={15} aria-hidden="true" />
      </span>
      {item.title}
      <CountBadge value={count} active={isActive} className="ml-auto" />
    </Link>
  );
}

/** Whoever is signed in, useful when several people share a device. */
function ProfileCard() {
  const { data: profile } = useGetProfileQuery();
  return (
    <div className="flex items-center gap-3.5 border-b border-[#F1EBE2] p-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-[15px] font-semibold tracking-wide text-white">
        {initialsOf(profile?.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-dark">{profile?.name || "Welcome"}</p>
        <p className="truncate text-xs text-[#8A8A8A]">{formatPhone(profile?.phone) || profile?.email || ""}</p>
        <Link
          href="/my-account/personal-details"
          className="group mt-1 inline-flex items-center gap-0.5 text-xs font-semibold text-secondary"
        >
          Edit profile
          <ChevronRight size={13} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default function AccountSidebar() {
  const { askToLogOut, logoutDialog } = useLogoutConfirm();
  const counts = useAccountCounts();
  const groups = useVisibleMenu();

  return (
    <>
      <MobileAccountNav counts={counts} />

      <aside className="hidden self-start overflow-hidden rounded-md border border-[#E8DFD3] bg-white lg:sticky lg:top-6 lg:block">
        <ProfileCard />

        {groups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? "border-t border-[#F1EBE2]" : ""}>
            <h3 className="px-5 pt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8B6E54]">
              {group.title}
            </h3>
            <nav className="space-y-0.5 px-2 py-2" aria-label={group.title}>
              {group.items.map((item) => (
                <DesktopLink key={item.href} item={item} count={item.badge ? counts[item.badge] : undefined} />
              ))}
            </nav>
          </div>
        ))}

        <div className="border-t border-[#F1EBE2] p-2">
          <button
            type="button"
            onClick={askToLogOut}
            className="group flex min-h-11 w-full items-center gap-3 rounded-full px-3 text-sm text-[#555] transition-colors hover:bg-[#FBEAEA] hover:text-secondary"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#F1EDE6] text-[#8B6E54] transition-colors group-hover:bg-white group-hover:text-secondary">
              <LogOut size={15} aria-hidden="true" />
            </span>
            Log out
          </button>
        </div>
      </aside>

      {logoutDialog}
    </>
  );
}
