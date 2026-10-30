interface WebsiteFooterData {
  logo: string;
  description: string;

  /** Icons are picked from the address (instagram.com, facebook.com…); empty addresses are hidden. */
  socials: {
    label: string;
    href: string;
  }[];

  lists: {
    title?: string;
    links: {
      label: string;
      href: string;
    }[];
  }[];

  copyright: string;
  credit: string;
}

export const websiteFooterData: WebsiteFooterData = {
  logo: "/logo.png",
  description: "Made-to-measure ethnic wear, designed by you and crafted by hand.",

  socials: [
    /* Placeholders until the brand's own pages are set in Admin → Footer. */
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
  ],

  lists: [
    {
      title: "Shop",
      links: [
        { label: "Pre-made Designs", href: "/products" },
        { label: "Bestsellers", href: "/products?badge=bestseller" },
        { label: "The Bridal Edit", href: "/products?tag=bridal" },
        { label: "Design Your Dress", href: "/create-your-own-design" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Our story", href: "/#founders" },
        { label: "Behind the scenes", href: "/#story" },
        { label: "Terms & Conditions", href: "/terms-and-conditions" },
      ],
    },
    {
      title: "Contact",
      links: [
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

  copyright: "© Baliye Couture. All rights reserved.",
  credit: "Powered by Fielmente",
};
