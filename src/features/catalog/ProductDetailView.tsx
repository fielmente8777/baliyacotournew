'use client';

/**
 * Product detail page.
 *
 * Two CTAs, decided by the product's own configuration (§3):
 *   customizable → "Customize" opens the design page seeded from this product,
 *                  so the customer never picks a garment type.
 *   pre-designed → "Add to Cart" only.
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoIosStar } from 'react-icons/io';

import { Section } from '@/components/sectionComponants';
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from '@/store/api/productApi';
import { isCustomizable } from '@/@types/product';
import type { ProductVariant } from '@/@types/product';
import { formatINR } from '@/lib/format';

import ProductGallery from '../../app/(website)/products/[slug]/Components/ProductGallery';
import { homePageData } from '../../app/(website)/Home/pagedata';
import DesignProcess from '../../app/(website)/products/[slug]/Components/DesignProcess';
import CustomerReviews from '../../app/(website)/products/[slug]/Components/CustomerReviews';
import ProductGrid from './ProductGrid';
import AddToCartButton from './AddToCartButton';
import VariantSelector from './VariantSelector';
import ProductSpecs from './ProductSpecs';

export default function ProductDetailView({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug);
  const { data: related = [] } = useGetRelatedProductsQuery(slug, { skip: !product });
  /* Declared before the early returns below — React's rules of hooks don't
     allow a conditional useState. Defaults to null while `product` is
     still loading; resolved to a real variant just below once it's in. */
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  if (isLoading) {
    return (
      <main className="bg-[#FAF7F2]">
        <Section className="px-4 md:px-10">
          <div className="grid animate-pulse gap-12 lg:grid-cols-2">
            <div className="aspect-[3/4] rounded-xl bg-black/5" />
            <div className="space-y-4">
              <div className="h-10 w-2/3 rounded bg-black/5" />
              <div className="h-8 w-1/3 rounded bg-black/5" />
              <div className="h-24 w-full rounded bg-black/5" />
            </div>
          </div>
        </Section>
      </main>
    );
  }

  /* A missing or unpublished product is a 404, not an error page. */
  if (isError || !product) notFound();

  const price = product.salePrice ?? product.basePrice;
  const canCustomize = isCustomizable(product);
  /* Falls back to the first variant (e.g. the two Bridal items, which have
     no real options and just one "Default Title" variant) until the
     customer picks one explicitly. */
  const activeVariant = selectedVariant ?? product.variants[0] ?? null;

  const galleryImages =
    product.images.length > 0
      ? [...product.images]
          .sort((a, b) => a.position - b.position)
          .map((image) => ({ src: image.url, alt: image.alt ?? product.name }))
      : [{ src: '/Rectangle-23959.png', alt: product.name }];

  return (
    <main className="bg-[#FAF7F2]">
      <Section className="px-4 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <ProductGallery images={galleryImages} />

          <div>
            <h1 className="text-5xl font-semibold">{product.name}</h1>

            <p className="mt-5 text-sm uppercase tracking-[2px] text-gray-500">
              {canCustomize ? 'Starting from' : 'Price'}
            </p>

            <h2 className="mt-2 text-4xl font-bold">{formatINR(price / 100)}</h2>

            {product.ratingCount > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-[#E0F1DC] px-2 py-1 text-[#426340]">
                  <span>{product.ratingAverage.toFixed(1)}</span>
                  <IoIosStar size={20} fill="currentColor" />
                </div>

                <span className="text-sm text-gray-500">
                  {product.ratingCount.toLocaleString('en-IN')} ratings
                </span>
              </div>
            )}

            {product.shortDescription && (
              <p className="mt-6 leading-7 text-[#555]">{product.shortDescription}</p>
            )}

            <VariantSelector
              product={product}
              selectedVariant={activeVariant}
              onSelect={setSelectedVariant}
            />

            <div className="mt-10 flex gap-4">
              {canCustomize && (
                <Link
                  href={`/create-your-own-design?product=${product._id}`}
                  className="flex-1 items-center justify-center rounded-full bg-[#8D2F46] py-4 text-center font-medium text-white"
                >
                  Customize
                </Link>
              )}

              <AddToCartButton product={product} variant={activeVariant} />
            </div>

            {/* TODO(Sachin): leadTimeDays was a Mongo-backend field with no
                Shopify equivalent yet. Decide: (a) add a `custom.lead_time_days`
                metafield in Shopify for made-to-order products and read it here,
                or (b) drop this banner. Only rendering for made-to-order items
                in the meantime — pre-made stock items showing "tailored and
                delivered" language didn't make sense anyway. */}
            {product.isMadeToOrder && (
              <div className="mt-6 rounded bg-[#EAF6E8] py-3 text-center text-sm text-[#52734D]">
                This product is made-to-order.
              </div>
            )}

            {product.description && (
              <section className="mt-10 border-t border-[#E5E5E5] pt-8">
                <h3 className="mb-6 text-lg font-semibold uppercase tracking-wide">
                  Product Detail
                </h3>

                <div
                  className="space-y-4 text-[15px] leading-7 text-[#555] [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />

                <ProductSpecs specs={product.specs} />

                {product.sku && (
                  <p className="mt-6 text-sm text-[#888]">SKU: {product.sku}</p>
                )}
              </section>
            )}
          </div>
        </div>
      </Section>

      {/* Static marketing content, shared with the homepage. */}
      <DesignProcess {...homePageData.designProcess} />

      <CustomerReviews />

      {related.length > 0 && (
        <Section className="px-4 md:px-10">
          <h2 className="text-3xl font-semibold">You may also like</h2>
          <ProductGrid products={related} />
        </Section>
      )}
    </main>
  );
}
