'use client';

/**
 * My Account landing page: a greeting, the numbers that matter (orders on
 * their way, wishlist, unread updates, addresses), the latest orders and a
 * peek at the wishlist — so the most common jobs are one tap away.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { Bell, ChevronRight, Heart, MapPin, Package, Ruler, UserRound, type LucideIcon } from 'lucide-react';

import { useGetAddressesQuery } from '@/store/api/addressApi';
import { useGetMyOrdersQuery, useGetMyShopifyOrdersQuery } from '@/store/api/orderApi';
import { useGetProfileQuery } from '@/store/api/profileApi';
import { useGetWishlistQuery } from '@/store/api/wishlistApi';

import { initialsOf } from '../../app/(website)/my-account/components/accountMenu';
import { useAccountCounts } from '../../app/(website)/my-account/components/useAccountCounts';
import StatusPill from '../../app/(website)/my-account/orders/components/StatusPill';
import { shortDate, toOrderLines, toShopifyOrderLines } from '../../app/(website)/my-account/orders/orderView';
import { formatPhone } from '@/lib/phone';

const PLACEHOLDER = '/Rectangle-23959.png';

interface TileProps {
  href: string;
  icon: LucideIcon;
  label: string;
  value?: number;
  hint: string;
}

function StatTile({ href, icon: Icon, label, value, hint }: TileProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border border-[#EAE6DF] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#A52C45]/40 hover:shadow-[0_8px_24px_-12px_rgba(165,44,69,0.25)] sm:p-5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBF6F7] text-[#A52C45] transition-colors group-hover:bg-[#A52C45] group-hover:text-white">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="mt-3 text-2xl font-semibold text-[#222]">
        {value === undefined ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-black/5" /> : value}
      </span>
      <span className="text-sm font-medium text-dark">{label}</span>
      <span className="mt-0.5 text-xs text-[#8A8A8A]">{hint}</span>
    </Link>
  );
}

function SectionCard({ title, href, linkLabel, children }: { title: string; href: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#EAE6DF] bg-white">
      <div className="flex items-center justify-between border-b border-[#F2EEE8] px-4 py-3.5 sm:px-5">
        <h2 className="text-base font-semibold text-[#222]">{title}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-[13px] font-medium text-[#A52C45] transition-[gap] duration-300 hover:gap-1.5"
        >
          {linkLabel}
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function RecentOrders() {
  const { data: orders = [], isLoading: a } = useGetMyOrdersQuery();
  const { data: shopifyOrders = [], isLoading: b } = useGetMyShopifyOrdersQuery();

  const lines = useMemo(
    () =>
      [...toOrderLines(orders), ...toShopifyOrderLines(shopifyOrders)]
        .sort((x, y) => new Date(y.placedAt).getTime() - new Date(x.placedAt).getTime())
        .slice(0, 3),
    [orders, shopifyOrders]
  );

  if (a || b) {
    return (
      <div className="animate-pulse divide-y divide-[#F2EEE8]" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-3 px-4 py-4 sm:px-5">
            <div className="h-[72px] w-14 rounded bg-black/5" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 w-1/2 rounded bg-black/5" />
              <div className="h-3 w-1/4 rounded bg-black/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="px-4 py-8 text-center sm:px-5">
        <p className="text-sm text-[#6B6B6B]">You haven&apos;t placed any orders yet.</p>
        <Link href="/products" className="mt-3 inline-block text-sm font-medium text-[#A52C45] underline underline-offset-2">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#F2EEE8]">
      {lines.map((line) => (
        <li key={line.key}>
          <Link href={line.detailHref} className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#FDFCFA] sm:gap-4 sm:px-5">
            <div className="relative h-[72px] w-14 shrink-0 overflow-hidden rounded bg-[#F5F1EA]">
              <Image src={line.image} alt="" fill sizes="56px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#222] group-hover:text-[#A52C45]">{line.productName}</p>
              <p className="mt-0.5 text-xs text-[#8A8A8A]">
                Placed {shortDate(line.placedAt)} · <span className="font-medium text-[#444]">{line.price}</span>
              </p>
              <div className="mt-1.5 sm:hidden">
                <StatusPill stage={line.stage} label={line.statusTitle} />
              </div>
            </div>
            <div className="hidden sm:block">
              <StatusPill stage={line.stage} label={line.statusTitle} />
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#B5B0A8] group-hover:text-[#A52C45]" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function WishlistPeek() {
  const { data, isLoading } = useGetWishlistQuery();
  const items = (data?.items ?? []).slice(0, 4);

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-4 gap-3 p-4 sm:p-5" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[3/4] rounded bg-black/5" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-8 text-center sm:px-5">
        <p className="text-sm text-[#6B6B6B]">Tap the heart on any piece to save it here.</p>
        <Link href="/products" className="mt-3 inline-block text-sm font-medium text-[#A52C45] underline underline-offset-2">
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-4 gap-3 p-4 sm:p-5">
      {items.map((item) => (
        <li key={item._id}>
          <Link
            href={item.kind === 'shopify' && item.handle ? `/products/${item.handle}` : '/my-account/wishlist'}
            className="group block"
            title={item.title}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded bg-[#F5F1EA]">
              <Image
                src={item.image || PLACEHOLDER}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 25vw, 120px"
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${item.available ? '' : 'opacity-50 grayscale'}`}
              />
            </div>
            <p className="mt-1.5 truncate text-[12px] text-[#444] group-hover:text-[#A52C45]">{item.title}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const SHORTCUTS: { href: string; icon: LucideIcon; title: string; text: string }[] = [
  { href: '/my-account/personal-details', icon: UserRound, title: 'Personal Details', text: 'Name, phone, email and birthday' },
  { href: '/my-account/saved-measurements', icon: Ruler, title: 'Saved Measurements', text: 'Your fit, ready for every order' },
  { href: '/my-account/saved-addresses', icon: MapPin, title: 'Saved Addresses', text: 'Where we deliver your pieces' },
];

export default function AccountOverview() {
  const { data: profile } = useGetProfileQuery();
  const { data: addresses } = useGetAddressesQuery();
  const counts = useAccountCounts();
  const firstName = profile?.name?.trim().split(/\s+/)[0];

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-[#EAE6DF] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#A52C45] text-lg font-semibold text-white">
            {initialsOf(profile?.name)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-[#222] sm:text-xl">
              Hello{firstName ? `, ${firstName}` : ''}!
            </h2>
            <p className="truncate text-sm text-[#6B6B6B]">{profile?.email || formatPhone(profile?.phone) || 'Welcome to Baliye Couture'}</p>
          </div>
        </div>
        <Link
          href="/my-account/personal-details"
          className="inline-flex h-10 items-center justify-center rounded-md border border-[#A52C45] px-5 text-sm font-medium text-[#A52C45] transition hover:bg-[#A52C45] hover:text-white"
        >
          Edit profile
        </Link>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile href="/my-account/orders" icon={Package} label="Orders" value={counts.totalOrders} hint={counts.orders ? `${counts.orders} on the way` : 'Track & manage'} />
        <StatTile href="/my-account/wishlist" icon={Heart} label="Wishlist" value={counts.wishlist} hint="Saved for later" />
        <StatTile href="/my-account/notifications" icon={Bell} label="Unread updates" value={counts.notifications} hint="Order notifications" />
        <StatTile href="/my-account/saved-addresses" icon={MapPin} label="Addresses" value={addresses?.length} hint="Saved for checkout" />
      </div>

      <div className="grid gap-5 lg:gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <SectionCard title="Recent Orders" href="/my-account/orders" linkLabel="View all">
          <RecentOrders />
        </SectionCard>
        <SectionCard title="Wishlist" href="/my-account/wishlist" linkLabel="View all">
          <WishlistPeek />
        </SectionCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {SHORTCUTS.map(({ href, icon: Icon, title, text }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-lg border border-[#EAE6DF] bg-white p-4 transition-colors hover:border-[#A52C45]/40"
          >
            <Icon size={20} className="shrink-0 text-[#A52C45]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#222]">{title}</p>
              <p className="truncate text-xs text-[#8A8A8A]">{text}</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#B5B0A8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#A52C45]" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
