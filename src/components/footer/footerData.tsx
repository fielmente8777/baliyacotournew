import { FacebookIcon, InstagramIcon, TwitterIcon } from "@/utils/icon";
import { JSX } from "react/jsx-runtime";

interface WebsiteFooterData {
  logo: string;
  description: string;

  lists: {
    title?: string;
    links: {
      label: string;
      href: string;
    }[];
  }[];
}

export const socialData: { icon: JSX.Element; href: string; label: string }[] = [
  {
    icon: <InstagramIcon />,
    href: "",
    label: "Instagram",
  },
  {
    icon: <TwitterIcon />,
    href: "",
    label: "Twitter",
  },
  {
    icon: <FacebookIcon />,
    href: "",
    label: "Facebook",
  },
];

export const websiteFooterData: WebsiteFooterData = {
  logo: "/logo.png",
  description: "We Customise Product for your happiness",

  lists: [
    {
      title: "QUICK LINKS",
      links: [
        { label: "Pre-made Designs", href: "/products" },
        { label: "Bestsellers", href: "/products?badge=bestseller" },
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
      ],
    },

    {
      title: "Contact",
      links: [
        // {
        //   label: "Address: " + contact.address,
        //   href: contact.addressLink,
        //   icon: <FillLocationIcon />,
        // },
        {
          label: "+1xx xxx xxxx",
          href: "tel:+1xx xxx xxxx",
        },
        {
          label: "Blaiye@gmail.com",
          href: "Blaiye@gmail.com",
        },
      ],
    },
  ],
};
