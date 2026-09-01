'use client';

/**
 * Product detail page.
 *
 * Two CTAs, decided by the product's own configuration (§3):
 *   customizable → "Customize" opens the design page seeded from this product,
 *                  so the customer never picks a garment type.
 *   pre-designed → "Add to Cart" only.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IoIosStar } from 'react-icons/io';

import { Section } from '@/components/sectionComponants';
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from '@/store/api/productApi';
import { isCustomizable } from '@/@types/product';
import { formatINR } from '@/lib/format';

import ProductGallery from '../../app/(website)/products/[slug]/Components/ProductGallery';
import { homePageData } from '../../app/(website)/Home/pagedata';
import DesignProcess from '../../app/(website)/products/[slug]/Components/DesignProcess';
import CustomerReviews from '../../app/(website)/products/[slug]/Components/CustomerReviews';
import ProductGrid from './ProductGrid';
import AddToCartButton from './AddToCartButton';

export default function ProductDetailView({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug);
  const { data: related = [] } = useGetRelatedProductsQuery(slug, { skip: !product });

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

            <div className="mt-10 flex gap-4">
              {canCustomize && (
                <Link
                  href={`/create-your-own-design?product=${product._id}`}
                  className="flex-1 items-center justify-center rounded-full bg-[#8D2F46] py-4 text-center font-medium text-white"
                >
                  Customize
                </Link>
              )}

              <AddToCartButton product={product} />
            </div>

            <div className="mt-6 rounded bg-[#EAF6E8] py-3 text-center text-sm text-[#52734D]">
              Products are Tailored and Delivered in{' '}
              {Math.ceil(product.leadTimeDays / 7)} weeks
            </div>

            {product.description && (
              <section className="mt-10 border-t border-[#E5E5E5] pt-8">
                <h3 className="mb-6 text-lg font-semibold uppercase tracking-wide">
                  Product Detail
                </h3>

                <div className="space-y-4 text-[15px] leading-7 text-[#555] whitespace-pre-line">
                  {product.description}
                </div>

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
