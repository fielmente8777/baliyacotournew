'use client';

/**
 * My Account → Wishlist. Saved Shopify products, newest first. Each opens its
 * product page, where the customer picks a size and adds it to the cart —
 * Shopify products need a variant, so there is no one-tap "move to cart".
 */

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';

import EmptyState from '@/components/EmptyState';
import { EmptyBagIllustration } from '@/components/illustrations';
import type { WishlistItem } from '@/@types/wishlist';
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from '@/store/api/wishlistApi';

import AccountContent from '../../app/(website)/my-account/components/AccountContent';
import { formatMoney } from '../../app/(website)/my-account/orders/orderView';

const PLACEHOLDER = '/Rectangle-23959.png';

function hrefFor(item: WishlistItem) {
  if (item.kind === 'shopify' && item.handle) return `/products/${item.handle}`;
  return null;
}

function WishlistCard({ item }: { item: WishlistItem }) {
  const [remove, { isLoading }] = useRemoveFromWishlistMutation();
  const href = hrefFor(item);

  const body = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        <Image
          src={item.image || PLACEHOLDER}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-cover duration-500 group-hover:scale-105 ${item.available ? '' : 'opacity-50 grayscale'}`}
        />
        {!item.available && (
          <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-[1.5px] text-[#6B6B6B]">
            Unavailable
          </span>
        )}
      </div>
      <div className="pt-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-[#262626] group-hover:text-secondary">
          {item.title}
        </h3>
        {item.price !== undefined && item.currency && (
          <p className="mt-1 text-[13px] text-[#8B6E54]">{formatMoney(item.price, item.currency)}</p>
        )}
      </div>
    </>
  );

  return (
    <li className="group relative">
      {href && item.available ? <Link href={href}>{body}</Link> : <div>{body}</div>}

      <button
        type="button"
        onClick={() => remove(item._id)}
        disabled={isLoading}
        aria-label={`Remove ${item.title} from wishlist`}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#444] shadow-sm transition hover:text-[#9B1C14] disabled:opacity-50"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

export default function WishlistView() {
  const { data, isLoading, isError, refetch } = useGetWishlistQuery();

  return (
    <AccountContent>
      <div className="border-b border-[#E9E4DC] px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#222]">
          <Heart size={18} className="text-[#A52C45]" aria-hidden="true" />
          Wishlist
          {data && data.count > 0 && <span className="text-sm font-normal text-[#6B6B6B]">({data.count})</span>}
        </h2>
      </div>

      {isLoading ? (
        <ul className="grid animate-pulse grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="aspect-[3/4] rounded bg-black/5" />
          ))}
        </ul>
      ) : isError ? (
        <EmptyState
          illustration={<EmptyBagIllustration />}
          title="We couldn't load your wishlist"
          message="Please check your connection and try again."
          action={{ label: 'Try again', onClick: () => refetch() }}
        />
      ) : !data || data.count === 0 ? (
        <EmptyState
          illustration={<EmptyBagIllustration />}
          title="Your wishlist is empty"
          message="Tap the heart on any piece to save it here for later."
          action={{ label: 'Browse the collection', href: '/products' }}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 py-6 sm:px-6 lg:grid-cols-3">
          {data.items.map((item) => (
            <WishlistCard key={item._id} item={item} />
          ))}
        </ul>
      )}
    </AccountContent>
  );
}
