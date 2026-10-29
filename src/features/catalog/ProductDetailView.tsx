'use client';

/**
 * Product detail page, in the listing's style.
 *
 *   breadcrumb    Home › Pre-made Designs › <type> › <name>
 *   gallery       sticky on desktop; swipe on phones
 *   info          type, name, rating, price, variants, actions, assurances,
 *                 then Description and Specifications as fold-outs
 *   promo         "make it yours" → the builder, seeded with this product
 *   reviews       real ones only (Shopify)
 *   related       same type first, never this product
 *
 * Two CTAs, decided by the product's own configuration (§3):
 *   customizable → "Customise" opens the design page seeded from this product,
 *                  so the customer never picks a garment type.
 *   pre-designed → "Add to Cart" only.
 */

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ChevronDown, Hand, Ruler, Scissors, ShieldCheck, Star } from 'lucide-react';

import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from '@/store/api/productApi';
import { useGetReviewsQuery } from '@/store/api/reviewApi';
import { isCustomizable } from '@/@types/product';
import type { ProductVariant } from '@/@types/product';
import { cn, formatINR } from '@/lib/format';

import ProductGallery from '../../app/(website)/products/[slug]/Components/ProductGallery';
import CustomerReviews, { StarRating, reviewsToShow } from '../../app/(website)/products/[slug]/Components/CustomerReviews';
import Breadcrumb from './Breadcrumb';
import DesignYourOwnPromo from './DesignYourOwnPromo';
import ProductGrid from './ProductGrid';
import AddToCartButton from './AddToCartButton';
import VariantSelector from './VariantSelector';
import ProductSpecs from './ProductSpecs';
import WishlistButton from '@/features/wishlist/WishlistButton';

const badge = 'inline-flex items-center gap-1 rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-sm';

/** "Kurti" → "Kurtis"; already-plural stays. */
const plural = (type: string) => (/s$/i.test(type) ? type : `${type}s`);

/** A fold-out section of the info column. */
function Fold({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b border-[#E8DFD3]">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-dark [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown size={18} aria-hidden className="shrink-0 text-[#8B6E54] transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

function DetailSkeleton() {
  return (
    <main className="bg-[#FAF7F2]">
      <div className="mx-auto max-w-320 animate-pulse px-4 py-8 md:px-10">
        <div className="h-4 w-64 rounded bg-black/5" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="aspect-3/4 rounded-sm bg-black/5" />
          <div className="space-y-4">
            <div className="h-3 w-24 rounded bg-black/5" />
            <div className="h-10 w-3/4 rounded bg-black/5" />
            <div className="h-8 w-1/3 rounded bg-black/5" />
            <div className="h-24 w-full rounded bg-black/5" />
            <div className="h-14 w-full rounded-full bg-black/5" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetailView({ slug }: { slug: string }) {
  const { data: product, isLoading, isError } = useGetProductBySlugQuery(slug);
  const { data: related = [] } = useGetRelatedProductsQuery(slug, { skip: !product });
  /* Declared before the early returns below — React's rules of hooks don't
     allow a conditional useState. Defaults to null while `product` is
     still loading; resolved to a real variant just below once it's in. */
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  /* Reviews come from Shopify. Always fresh on opening a product: a review
     written moments ago on Order History must not be hidden behind a cached
     (empty) list. */
  const { data: allReviews = [] } = useGetReviewsQuery(undefined, { refetchOnMountOrArgChange: true });

  if (isLoading) return <DetailSkeleton />;

  /* A missing or unpublished product is a 404, not an error page. */
  if (isError || !product) notFound();

  const canCustomize = isCustomizable(product);
  const customiseHref = `/create-your-own-design?product=${product._id}`;
  /* Falls back to the first variant (e.g. the two Bridal items, which have
     no real options and just one "Default Title" variant) until the
     customer picks one explicitly. */
  const activeVariant = selectedVariant ?? product.variants[0] ?? null;

  /* Variants can be priced differently (e.g. a colour costs more): once the
     customer picks one, show its price. Until then, the product's lowest. */
  const price = selectedVariant ? selectedVariant.price : (product.salePrice ?? product.basePrice);
  const hasDiscount = !selectedVariant && product.salePrice !== undefined && product.salePrice < product.basePrice;
  const savePercent = hasDiscount ? Math.round((1 - product.salePrice! / product.basePrice) * 100) : 0;

  const reviews = allReviews.filter((r) => r.productId === product._id);
  /* Same list as the reviews section — demos stand in until real ones exist. */
  const shownReviews = reviewsToShow(reviews);
  const ratingCount = shownReviews.length;
  const ratingAverage = ratingCount ? shownReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;

  const galleryImages =
    product.images.length > 0
      ? [...product.images]
          .sort((a, b) => a.position - b.position)
          .map((image) => ({ src: image.url, alt: image.alt ?? product.name }))
      : [{ src: '/Rectangle-23959.png', alt: product.name }];

  /* A variant photo that isn't in the product's own images is added, so
     selecting it still shows it. */
  const variantImage = activeVariant?.image;
  if (variantImage && !galleryImages.some((img) => img.src === variantImage)) {
    galleryImages.push({ src: variantImage, alt: `${product.name}, ${activeVariant.title}` });
  }

  const type = product.productType;
  const assurances = [
    product.isMadeToOrder && { icon: Scissors, title: 'Made to order', text: 'Stitched for you after you place your order.' },
    canCustomize && { icon: Ruler, title: 'Make it yours', text: 'Choose the fabric, colour and embroidery.' },
    { icon: Hand, title: 'Handcrafted', text: 'Cut and finished by our artisans.' },
    { icon: ShieldCheck, title: 'Secure checkout', text: 'Pay safely through our checkout.' },
  ].filter(Boolean) as { icon: typeof Scissors; title: string; text: string }[];

  return (
    /* pb-28 on phones: room for the sticky price bar at the bottom. */
    <main className="bg-[#FAF7F2] pb-28 lg:pb-0">
      <div className="mx-auto max-w-320 px-4 pb-14 pt-5 md:px-10 md:pb-20 md:pt-8">
        <Breadcrumb
          current={product.name}
          trail={[
            { label: 'Pre-made Designs', href: '/products' },
            ...(type ? [{ label: plural(type), href: `/products?type=${encodeURIComponent(type)}` }] : []),
          ]}
        />

        {/* Tablets get two columns too — one column made the photo a
            whole screen tall before any details. */}
        <div className="mt-4 grid gap-6 md:mt-7 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
          {/* z-20: sticky makes this column its own layer — without a z-index
              the details column painted over the zoom pop-up (the colour
              swatches showed through it). */}
          <div className="md:sticky md:top-6 md:z-20 md:self-start">
            <ProductGallery
              images={galleryImages}
              activeSrc={selectedVariant?.image}
              overlay={
                <>
                  {canCustomize && (
                    <span className={`${badge} bg-[#FAF7F2] text-dark`}>
                      <Scissors size={10} aria-hidden /> Customisable
                    </span>
                  )}
                  {product.isEditorsPick && (
                    <span className={`${badge} bg-secondary text-white`}>
                      <Star size={10} fill="currentColor" aria-hidden /> Editor&apos;s Pick
                    </span>
                  )}
                  {product.isBestseller && <span className={`${badge} bg-dark text-white`}>Bestseller</span>}
                </>
              }
            />
          </div>

          <div className="flex min-w-0 flex-col">
            {type && (
              <Link
                href={`/products?type=${encodeURIComponent(type)}`}
                className="flex w-fit items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B6E54] hover:text-secondary md:text-xs"
              >
                {type}
              </Link>
            )}

            <h1 className="mt-2.5 text-[26px] font-medium leading-[1.15] text-dark md:text-3xl lg:text-4xl xl:text-[44px]">{product.name}</h1>

            {ratingCount > 0 && (
              <a href="#reviews" className="mt-3 flex w-fit items-center gap-2 text-sm text-[#6B6B6B] hover:text-secondary">
                <StarRating value={ratingAverage} className="text-base" />
                <span className="font-semibold text-dark">{ratingAverage.toFixed(1)}</span>·
                <span className="underline underline-offset-4">
                  {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
                </span>
              </a>
            )}

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[13px] text-[#6B6B6B]">{canCustomize ? 'Starting from' : 'Price'}</span>
              <span className="text-[28px] font-semibold text-dark lg:text-[34px]">{formatINR(price / 100)}</span>
              {hasDiscount && (
                <>
                  <span className="text-base text-[#A9A9A9] line-through">{formatINR(product.basePrice / 100)}</span>
                  <span className="rounded-sm bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">Save {savePercent}%</span>
                </>
              )}
            </div>

            {/* The short description is cut from the full one, so show it only
                when there is no full description below — not both. */}
            {product.shortDescription && !product.description && (
              <p className="mt-4 leading-7 text-[#555]">{product.shortDescription}</p>
            )}

            {product.options.length > 0 && (
              <div className="mt-6 border-t border-[#E8DFD3] pt-6">
                <VariantSelector product={product} selectedVariant={activeVariant} onSelect={setSelectedVariant} />
              </div>
            )}

            {/* Actions: Customise leads when it's offered; Add to Cart and the
                wishlist share the row beneath. */}
            <div className="mt-7 flex flex-col gap-3">
              {canCustomize && (
                <Link
                  href={customiseHref}
                  className="group flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-secondary px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(155,44,64,0.7)] transition-transform hover:scale-[1.01]"
                >
                  <Scissors size={17} aria-hidden />
                  Customise this design
                  <ArrowRight size={17} aria-hidden className="transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <div className="flex items-start gap-3">
                <AddToCartButton product={product} variant={activeVariant} />
                <WishlistButton product={product} variant="inline" />
              </div>
            </div>

            {/* What every order comes with. */}
            <ul className="mt-7 grid gap-x-5 gap-y-4 rounded-md border border-[#E8DFD3] bg-white p-4 sm:grid-cols-2 sm:p-5 md:grid-cols-1 xl:grid-cols-2">
              {assurances.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary">
                    <Icon size={17} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-dark">{title}</span>
                    <span className="block text-[13px] leading-snug text-[#6B6B6B]">{text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-[#E8DFD3]">
              {product.description && (
                <Fold title="Description" open>
                  <div
                    className="space-y-4 text-[15px] leading-7 text-[#555] [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </Fold>
              )}
              {(product.specs.length > 0 || product.sku) && (
                <Fold title="Specifications" open={!product.description}>
                  <ProductSpecs specs={product.specs} sku={product.sku} />
                </Fold>
              )}
            </div>
          </div>
        </div>
      </div>

      <DesignYourOwnPromo
        eyebrow={canCustomize ? 'Make it yours' : 'Made for you'}
        title={canCustomize ? 'Love the cut?' : "Didn't find the one?"}
        accent={canCustomize ? 'Change the fabric, colour and embroidery.' : 'Design it from scratch.'}
        text={
          canCustomize
            ? 'Start from this design and change any detail. We stitch it to your measurements.'
            : "Pick a garment and we'll walk you through the rest, from the first thread to the final stitch."
        }
        cta={canCustomize ? 'Customise this design' : 'Start designing'}
        href={canCustomize ? customiseHref : '/create-your-own-design'}
      />

      <div id="reviews" className="scroll-mt-6">
        <CustomerReviews reviews={reviews} />
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-320 px-4 pb-16 md:px-10 md:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B6E54] md:text-xs">
                More to explore
              </p>
              <h2 className="mt-2 text-2xl font-medium text-dark md:text-3xl">You May Also Like</h2>
            </div>
            <Link
              href={type ? `/products?type=${encodeURIComponent(type)}` : '/products'}
              className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-secondary"
            >
              View all {type ? plural(type).toLowerCase() : 'designs'}
              <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      )}

      {/* Phones: price and the main action stay on screen — the buttons
          above sit about a screen and a half down. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EFE8DD] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-[#8A8A8A]">{canCustomize ? 'Starting from' : 'Price'}</p>
            <p className="text-lg font-semibold leading-tight text-dark">{formatINR(price / 100)}</p>
          </div>
          {canCustomize ? (
            <Link
              href={customiseHref}
              className={cn('flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-secondary text-[15px] font-semibold text-white')}
            >
              <Scissors size={16} aria-hidden /> Customise
            </Link>
          ) : (
            <AddToCartButton product={product} variant={activeVariant} className="py-3" />
          )}
        </div>
      </div>
    </main>
  );
}
