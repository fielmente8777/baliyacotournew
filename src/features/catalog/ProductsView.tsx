'use client';

/**
 * The /products listing (all ready-made designs).
 *
 *   hero          breadcrumb, title, live counts, three product photos in arches
 *   silhouettes   one tile per garment type (Shopify product type) — tap to filter
 *   toolbar       sticky: filter chips, result count, sort, 3 / 4 per row
 *   grid          the designs, paginated
 *   promo         "design it from scratch" → the builder
 *
 * Filters live in the URL (?badge=, ?tag=, ?type=, ?sort=), so the query is
 * derived from searchParams, every view is linkable, and RTK Query caches
 * each combination. The navbar's "Bestsellers" link is just
 * /products?badge=bestseller, so it lands on the same state as the chip.
 */

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';

import { useGetProductsQuery } from '@/store/api/productApi';
import { primaryImage, type Product, type ProductListQuery } from '@/@types/product';
import { cn } from '@/lib/format';
import { productsPageData, type ProductsPageContent } from '@/app/(website)/products/pageData';

import Breadcrumb from './Breadcrumb';
import ProductFilters, { activeFilter } from './ProductFilters';
import Pagination from './Pagination';
import ProductGrid from './ProductGrid';
import SortButton from './SortButton';
import DesignYourOwnPromo from './DesignYourOwnPromo';

/** Divides evenly into the 2-, 3- and 4-column grids. */
const PAGE_SIZE = 24;


/** Soft backdrops for the silhouette tiles, in turn. */
const TILE_TINTS = ['#F2E4E6', '#EFE8DE', '#E6EEEA', '#F4EAD6'];

const hasPhoto = (p: Product) => p.images.length > 0;

/** "Kurti" → "Kurtis", "Sharara Set" → "Sharara Sets"; already-plural stays. */
const plural = (type: string) => (/s$/i.test(type) ? type : `${type}s`);

/**
 * `content` is the page's words and banner pictures from the admin panel
 * (Admin → Pre-made Designs page), defaults in app/(website)/products/pageData.ts.
 */
export default function ProductsView({ content = productsPageData }: { content?: ProductsPageContent }) {
  /* The admin's banner pictures; they also stand in for any silhouette whose
     products have no photo yet, so no frame is ever left empty. */
  const art = content.hero.images.filter(Boolean).length ? content.hero.images.filter(Boolean) : productsPageData.hero.images;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = activeFilter(new URLSearchParams(searchParams.toString()));
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const type = searchParams.get('type') ?? undefined;
  const [columns, setColumns] = useState<3 | 4>(4);

  const query: ProductListQuery = {
    sort: (searchParams.get('sort') as ProductListQuery['sort']) ?? undefined,
    badge: (searchParams.get('badge') as ProductListQuery['badge']) ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    productType: type,
    search: searchParams.get('q') ?? undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(query);
  /* The whole catalogue, once: silhouette tiles, counts and hero photos. */
  const { data: all } = useGetProductsQuery({ limit: 250 });

  const silhouettes = useMemo(() => {
    const byType = new Map<string, Product[]>();
    for (const p of all?.items ?? []) {
      if (!p.productType) continue;
      byType.set(p.productType, [...(byType.get(p.productType) ?? []), p]);
    }
    return [...byType.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([name, items], i) => ({
        name,
        count: items.length,
        image: items.find(hasPhoto) ? primaryImage(items.find(hasPhoto)!) : art[i % art.length],
        tint: TILE_TINTS[i % TILE_TINTS.length],
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- art comes from the page's content
  }, [all]);

  /* The banner shows the admin's pictures, topped up with product photos. */
  const heroArt = [...art, ...(all?.items ?? []).filter(hasPhoto).map(primaryImage)].slice(0, 3);

  /** The URL with one param changed (page always resets). */
  const withParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const setType = (value?: string) => router.push(withParam('type', value), { scroll: false });

  const total = data?.meta.total;
  const heading = type ? plural(type) : filter.heading;

  return (
    <main className="bg-[#FAF7F2]">
      {/* ---- Hero -------------------------------------------------------- */}
      <section className="bg-[#F1EDE6]">
        <div className="mx-auto grid max-w-320 items-center gap-8 px-4 py-8 md:px-10 md:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:py-16">
          <div className="flex flex-col gap-4 md:gap-5">
            <Breadcrumb current={heading} />
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B6E54] md:text-xs">
              {content.hero.eyebrow}
            </p>
            <h1 className="text-[34px] font-medium leading-[1.05] text-dark md:text-5xl lg:text-6xl">
              {type ? (
                plural(type)
              ) : (
                filter.key === 'all' ? (
                  <>
                    {content.hero.title} <span className="text-secondary">{content.hero.titleAccent}</span>
                  </>
                ) : (
                  <>
                    {filter.heading.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-secondary">{filter.heading.split(' ').slice(-1)}</span>
                  </>
                )
              )}
            </h1>
            <p className="max-w-lg text-[15px] leading-relaxed text-[#555] md:text-[17px]">
              {content.hero.description}
            </p>

            {/* Three equal columns on every screen — wrapping put the third
                stat on its own line, out of step with the dividers. */}
            <dl className="grid max-w-md grid-cols-3 pt-1 md:pt-2">
              {[
                { value: all?.meta.total ?? '…', label: 'Designs' },
                { value: silhouettes.length || '…', label: 'Silhouettes' },
                { value: '3 steps', label: 'To design your own' },
              ].map((stat, i) => (
                <div key={stat.label} className={cn('flex flex-col gap-0.5', i > 0 && 'border-l border-[#D9CBB8] pl-4 md:pl-7')}>
                  <dt className="order-2 text-[11px] leading-snug text-[#6B6B6B] md:text-[13px]">{stat.label}</dt>
                  <dd className="order-1 whitespace-nowrap text-2xl font-semibold text-secondary md:text-3xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Three photos in arches, the middle one taller. Smaller on
              phones, under the text, so the hero isn't only words. */}
          <div aria-hidden className="mx-auto grid w-full max-w-sm grid-cols-3 items-end gap-3 sm:max-w-md lg:max-w-none lg:gap-4">
            {heroArt.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={cn(
                  'relative overflow-hidden rounded-t-full rounded-b-sm bg-[#EFE8DE] shadow-[0_18px_40px_-24px_rgba(34,34,34,0.45)]',
                  i === 1 ? 'aspect-1/2' : 'aspect-3/5'
                )}
              >
                <Image src={src} alt="" fill sizes="(max-width: 1024px) 33vw, 220px" className="object-cover object-top" priority={i === 1} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Shop by silhouette ----------------------------------------- */}
      {silhouettes.length > 1 && (
        <section aria-labelledby="silhouettes" className="mx-auto max-w-320 px-4 pt-10 md:px-10 md:pt-14">
          <div className="mb-4 flex items-baseline justify-between gap-4 md:mb-6">
            <h2 id="silhouettes" className="text-xl font-medium text-dark md:text-3xl">
              {content.silhouettes.title}
            </h2>
            {type && (
              <button
                type="button"
                onClick={() => setType()}
                className="min-h-11 text-[13px] font-medium text-secondary underline underline-offset-4 md:text-sm"
              >
                Show all
              </button>
            )}
          </div>

          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 pt-1 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
            {silhouettes.map((s) => {
              const active = s.name === type;
              return (
                <button
                  key={s.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setType(active ? undefined : s.name)}
                  className="group flex w-32 shrink-0 flex-col gap-2.5 text-left sm:w-40 md:w-auto md:gap-3"
                >
                  <span
                    style={{ backgroundColor: s.tint }}
                    className={cn(
                      'relative block aspect-4/3 w-full overflow-hidden rounded-t-full rounded-b-sm outline-2 outline-offset-4 transition-transform duration-300 group-hover:-translate-y-1',
                      active ? 'outline-secondary' : 'outline-transparent'
                    )}
                  >
                    <Image src={s.image} alt="" fill sizes="(max-width: 768px) 160px, 25vw" className="object-cover object-top" />
                  </span>
                  {/* Name over count — side by side, a two-word name broke
                      onto two lines on phones. */}
                  <span className="flex flex-col gap-0.5">
                    <span className={cn('text-[15px] font-medium leading-tight md:text-lg', active ? 'text-secondary' : 'text-dark')}>
                      {plural(s.name)}
                    </span>
                    <span className="text-xs text-[#6B6B6B] md:text-[13px]">
                      {s.count} {s.count === 1 ? 'design' : 'designs'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- Toolbar (sticky) ------------------------------------------- */}
      <div className="sticky top-0 z-20 mt-8 border-b border-[#E8DFD3] bg-[#FAF7F2]/95 backdrop-blur md:mt-10">
        <div className="mx-auto flex max-w-320 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 md:flex-nowrap md:px-10 md:py-3">
          <div className="min-w-0 max-md:w-full">
            <ProductFilters />
          </div>
          <div className="flex shrink-0 items-center gap-3 max-md:w-full max-md:justify-between">
            {total !== undefined && (
              <span aria-live="polite" className="whitespace-nowrap text-[13px] text-[#6B6B6B] md:text-sm">
                {total} {total === 1 ? 'design' : 'designs'}
              </span>
            )}
            <SortButton />
            <div role="group" aria-label="Designs per row" className="hidden overflow-hidden rounded-md border border-[#D9CBB8] bg-white lg:flex">
              {([3, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} per row`}
                  aria-pressed={columns === n}
                  onClick={() => setColumns(n)}
                  className={cn(
                    'flex size-11 items-center justify-center transition-colors',
                    n === 4 && 'border-l border-[#D9CBB8]',
                    columns === n ? 'bg-dark text-white' : 'text-[#6B6B6B] hover:text-dark'
                  )}
                >
                  <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                    {n === 3
                      ? [1, 7, 13].map((x) => <rect key={x} x={x} y="1" width="4" height="16" rx="1" />)
                      : [1, 5.3, 9.6, 14].map((x) => <rect key={x} x={x} y="1" width="3" height="16" rx="1" />)}
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Grid ------------------------------------------------------- */}
      <section className="mx-auto max-w-320 px-4 pb-16 pt-6 md:px-10 md:pb-20 md:pt-10">
        {type && (
          <p className="flex items-center gap-2 text-sm text-[#6B6B6B]">
            Showing
            <button
              type="button"
              onClick={() => setType()}
              aria-label={`Remove ${plural(type)} filter`}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#D9CBB8] bg-[#F1EDE6] px-3.5 text-dark transition-colors hover:border-secondary"
            >
              {plural(type)}
              <X size={13} aria-hidden />
            </button>
          </p>
        )}

        {isError ? (
          <div className="py-20 text-center">
            <p className="text-secondary">We couldn&apos;t load the designs.</p>
            <button type="button" onClick={() => refetch()} className="mt-4 underline">
              Try again
            </button>
          </div>
        ) : (
          <ProductGrid
            products={data?.items ?? []}
            isLoading={isLoading || isFetching}
            columns={columns}
            empty={
              <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
                <h2 className="text-2xl font-medium text-dark md:text-3xl">No designs match these filters</h2>
                <p className="text-[#6B6B6B]">Try another silhouette, or design your own from scratch.</p>
                <Link
                  href={pathname}
                  scroll={false}
                  className="inline-flex min-h-12 items-center rounded-full border border-dark px-7 text-[15px] font-medium text-dark transition-colors hover:bg-dark hover:text-white"
                >
                  Clear all filters
                </Link>
              </div>
            }
          />
        )}

        {data && <Pagination page={page} totalPages={data.meta.totalPages} />}
      </section>

      <DesignYourOwnPromo {...content.promo} />
    </main>
  );
}
