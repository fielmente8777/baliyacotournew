import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/features/catalog/ProductDetailView";
import {
  SITE_NAME,
  SITE_URL,
  getSeoProduct,
  jsonLdString,
  toMetaDescription,
} from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Readable fallback title from the slug, used only if Shopify can't be reached. */
const titleFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getSeoProduct(slug);
  const url = `/products/${slug}`;

  if (!product) {
    return {
      title: `${titleFromSlug(slug)} | ${SITE_NAME}`,
      alternates: { canonical: url },
    };
  }

  /* Shopify's own "Search engine listing" fields win when the team fills them in. */
  const title = product.seoTitle || product.title;
  const description = toMetaDescription(product.seoDescription || product.description || title);
  const images = product.images.slice(0, 4).map((img) => ({
    url: img.url,
    width: img.width ?? undefined,
    height: img.height ?? undefined,
    alt: img.altText ?? product.title,
  }));

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((img) => img.url),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getSeoProduct(slug);

  /* Only a confirmed "no such product" becomes a 404. If Shopify was simply
     unreachable (undefined), render the page and let the client retry. */
  if (product === null) notFound();

  const jsonLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: toMetaDescription(product.description || product.title, 5000),
    image: product.images.map((img) => img.url),
    url: `${SITE_URL}/products/${product.handle}`,
    sku: product.variants.find((v) => v.sku)?.sku ?? undefined,
    brand: { "@type": "Brand", name: product.vendor || SITE_NAME },
    category: product.productType || undefined,
    offers:
      product.minPrice.amount === product.maxPrice.amount
        ? {
            "@type": "Offer",
            url: `${SITE_URL}/products/${product.handle}`,
            price: product.minPrice.amount,
            priceCurrency: product.minPrice.currencyCode,
            availability: product.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          }
        : {
            "@type": "AggregateOffer",
            url: `${SITE_URL}/products/${product.handle}`,
            lowPrice: product.minPrice.amount,
            highPrice: product.maxPrice.amount,
            priceCurrency: product.minPrice.currencyCode,
            offerCount: product.variants.length,
            availability: product.availableForSale
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
  };

  const breadcrumbLd = product && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: product.title, item: `${SITE_URL}/products/${product.handle}` },
    ],
  };

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      )}
      {breadcrumbLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbLd) }} />
      )}
      <ProductDetailView slug={slug} />
    </>
  );
}
