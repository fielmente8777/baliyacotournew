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

export const websiteFooterData: WebsiteFooterData = {
  logo: "/logo.png",
  description: "Made-to-measure ethnic wear, designed by you and crafted by hand.",

  lists: [
    {
      title: "Quick Links",
      links: [
        { label: "Pre-made Designs", href: "/products" },
        { label: "Bestsellers", href: "/products?badge=bestseller" },
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
      ],
    },

    {
      title: "Contact Us",
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
          label: "Baliye@gmail.com",
          href: "mailto:Baliye@gmail.com",
        },
      ],
    },
  ],
};
