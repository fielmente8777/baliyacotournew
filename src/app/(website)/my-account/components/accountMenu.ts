import { Bell, Coins, Heart, LayoutGrid, MapPin, Package, Ruler, UserRound, type LucideIcon } from "lucide-react";

/** Which live count, if any, a menu item shows as a badge. */
export type AccountBadge = "orders" | "wishlist" | "notifications";

export interface AccountMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Shown only while the admin's "Design credits" switch is on. */
  requiresCredits?: boolean;
  badge?: AccountBadge;
  /** Highlight only on this exact path (the overview would otherwise match every page). */
  exact?: boolean;
}

export interface AccountMenuGroup {
  title: string;
  items: AccountMenuItem[];
}

export const accountMenu: AccountMenuGroup[] = [
  {
    title: "Account",
    items: [{ title: "Overview", href: "/my-account", icon: LayoutGrid, exact: true }],
  },
  {
    title: "Orders",
    items: [
      { title: "My Orders", href: "/my-account/orders", icon: Package, badge: "orders" },
      { title: "Wishlist", href: "/my-account/wishlist", icon: Heart, badge: "wishlist" },
      { title: "Notifications", href: "/my-account/notifications", icon: Bell, badge: "notifications" },
    ],
  },
  {
    title: "Profile",
    items: [
      { title: "Personal Details", href: "/my-account/personal-details", icon: UserRound },
      { title: "Saved Measurements", href: "/my-account/saved-measurements", icon: Ruler },
      { title: "Saved Addresses", href: "/my-account/saved-addresses", icon: MapPin },
      { title: "Design Credits", href: "/my-account/credits", icon: Coins, requiresCredits: true },
    ],
  },
];

export const isMenuItemActive = (item: AccountMenuItem, pathname: string) =>
  item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

/** "Priya Sharma" → "PS"; falls back to a neutral glyph. */
export const initialsOf = (name?: string) =>
  (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "B";
