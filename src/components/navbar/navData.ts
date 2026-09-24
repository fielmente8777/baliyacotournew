/**
 * Top-level navigation. Both entries open the same /products listing; the
 * query string picks the filter, so a filtered view is linkable and the
 * filter chips on /products stay in sync with the URL.
 */
import { Shirt, Star } from "lucide-react";

export const navData = [
  {
    name: "Pre-made Collections",
    href: "/products",
    icon: Shirt,
  },
  {
    name: "Bestsellers",
    href: "/products?badge=bestseller",
    icon: Star,
  },
];
