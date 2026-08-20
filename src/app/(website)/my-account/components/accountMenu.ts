export interface AccountMenuItem {
  title: string;
  href: string;
}

export interface AccountMenuGroup {
  title: string;
  items: AccountMenuItem[];
}

export const accountMenu: AccountMenuGroup[] = [
  {
    title: "Profile",
    items: [
      {
        title: "Personal Details",
        href: "/my-account/personal-details",
      },
      {
        title: "Saved Measurements",
        href: "/my-account/saved-measurements",
      },
      {
        title: "Saved Addresses",
        href: "/my-account/saved-addresses",
      },
    ],
  },
  {
    title: "Order Details",
    items: [
      {
        title: "All Orders",
        href: "/my-account/orders",
      },
    ],
  },
];