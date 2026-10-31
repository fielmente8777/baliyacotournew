'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useGetWishlistQuery } from '@/store/api/wishlistApi';

import { OverviewEmpty } from './OverviewSection';

const PLACEHOLDER = '/Rectangle-23959.png';

/** The first four saved pieces. */
export default function WishlistPeek() {
  const { data, isLoading } = useGetWishlistQuery();
  const items = (data?.items ?? []).slice(0, 4);

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5 xl:grid-cols-2" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-3/4 rounded-sm bg-black/5" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <OverviewEmpty text="Tap the heart on any piece to save it here." href="/products" label="Browse the collection" />;
  }

  return (
    <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5 xl:grid-cols-2">
      {items.map((item) => (
        <li key={item._id}>
          <Link
            href={item.kind === 'shopify' && item.handle ? `/products/${item.handle}` : '/my-account/wishlist'}
            className="group block"
            title={item.title}
          >
            <div className="relative aspect-3/4 overflow-hidden rounded-sm bg-[#F1EDE6]">
              <Image
                src={item.image || PLACEHOLDER}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 45vw, 160px"
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${item.available ? '' : 'opacity-50 grayscale'}`}
              />
            </div>
            <p className="mt-2 truncate text-[13px] font-medium text-dark group-hover:text-secondary">{item.title}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
