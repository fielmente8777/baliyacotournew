import { Bell, Heart, MapPin, Package, Ruler, UserRound, type LucideIcon } from "lucide-react";

export interface AccountMenuItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface AccountMenuGroup {
  title: string;
  items: AccountMenuItem[];
}

export const accountMenu: AccountMenuGroup[] = [
  {
    title: "Profile",
    items: [
      { title: "Personal Details", href: "/my-account/personal-details", icon: UserRound },
      { title: "Saved Measurements", href: "/my-account/saved-measurements", icon: Ruler },
      { title: "Saved Addresses", href: "/my-account/saved-addresses", icon: MapPin },
    ],
  },
  {
    title: "Order Details",
    items: [
      { title: "All Orders", href: "/my-account/orders", icon: Package },
      { title: "Wishlist", href: "/my-account/wishlist", icon: Heart },
      { title: "Notifications", href: "/my-account/notifications", icon: Bell },
    ],
  },
];
