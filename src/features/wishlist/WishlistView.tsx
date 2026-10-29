'use client';

/**
 * My Account → Wishlist. Saved Shopify products, newest first. Each opens its
 * product page, where the customer picks a size and adds it to the cart —
 * Shopify products need a variant, so there is no one-tap "move to cart".
 */

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, X } from 'lucide-react';

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

  const canOpen = Boolean(href && item.available);

  const body = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-[#F5F1EA]">
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
      <div className="px-3 pt-3">
        <h3 className="line-clamp-2 min-h-[2.5em] text-sm font-medium leading-snug text-[#262626] group-hover:text-secondary">
          {item.title}
        </h3>
        {item.price !== undefined && item.currency && (
          <p className="mt-1 text-[15px] font-semibold text-[#222]">{formatMoney(item.price, item.currency)}</p>
        )}
      </div>
    </>
  );

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-lg border border-[#EAE6DF] bg-white transition-shadow duration-300 hover:shadow-[0_8px_24px_-14px_rgba(34,34,34,0.3)]">
      {canOpen ? <Link href={href!}>{body}</Link> : <div>{body}</div>}

      <div className="mt-auto p-3">
        {canOpen ? (
          <Link
            href={href!}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#A52C45] text-[13px] font-medium text-white transition hover:bg-[#8F243A]"
          >
            View product
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => remove(item._id)}
            disabled={isLoading}
            className="flex h-9 w-full items-center justify-center rounded-md border border-[#E4DED4] text-[13px] font-medium text-[#555] transition hover:border-[#A52C45] hover:text-[#A52C45] disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => remove(item._id)}
        disabled={isLoading}
        aria-label={`Remove ${item.title} from wishlist`}
        title="Remove from wishlist"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#444] shadow-sm transition hover:bg-white hover:text-[#A52C45] disabled:opacity-50"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </li>
  );
}

export default function WishlistView() {
  const { data, isLoading, isError, refetch } = useGetWishlistQuery();

  return (
    <AccountContent>
      <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#E9E4DC] px-4 py-3 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#202020]">
            <Heart size={16} className="fill-[#A52C45] text-[#A52C45]" aria-hidden="true" />
            Wishlist
          </h2>
          {data && data.count > 0 && (
            <p className="text-xs text-[#8A8A8A]">
              {data.count} {data.count === 1 ? 'item' : 'items'} saved
            </p>
          )}
        </div>
        {data && data.count > 0 && (
          <Link href="/products" className="text-[13px] font-medium text-[#A52C45] hover:underline">
            Continue shopping
          </Link>
        )}
      </div>

      {isLoading ? (
        <ul className="grid animate-pulse grid-cols-2 gap-3 p-3 sm:gap-4 sm:p-5 lg:grid-cols-3 2xl:grid-cols-4" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="aspect-[3/4] rounded-lg bg-black/5" />
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
        <ul className="grid grid-cols-2 gap-3 bg-[#FCFBF8] p-3 sm:gap-4 sm:p-5 lg:grid-cols-3 2xl:grid-cols-4">
          {data.items.map((item) => (
            <WishlistCard key={item._id} item={item} />
          ))}
        </ul>
      )}
    </AccountContent>
  );
}
