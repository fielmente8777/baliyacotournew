import type { Metadata } from "next";
import ProductDetailView from "@/features/catalog/ProductDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Slug-based, matching GET /products/:slug. The old /product/[id] route used a
 * numeric id the API has no concept of.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  /* Readable title from the slug without a server-side fetch; the page itself
     loads the product client-side through RTK Query. */
  const name = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${name} | Baliye Couture`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}
