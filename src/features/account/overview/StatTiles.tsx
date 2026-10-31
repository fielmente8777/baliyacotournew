'use client';

import Link from 'next/link';
import { ArrowUpRight, Bell, Heart, MapPin, Package, type LucideIcon } from 'lucide-react';

import { useGetAddressesQuery } from '@/store/api/addressApi';

import { useAccountCounts } from '../../../app/(website)/my-account/components/useAccountCounts';

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
      className="group relative flex flex-col rounded-md border border-[#E8DFD3] bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-[0_10px_28px_-16px_rgba(155,44,64,0.4)] sm:p-5"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-full bg-[#F1EDE6] text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
          <Icon size={18} aria-hidden="true" />
        </span>
        <ArrowUpRight size={16} aria-hidden="true" className="text-[#C9BCAB] transition-colors group-hover:text-secondary" />
      </div>
      <span className="mt-4 text-[28px] font-semibold leading-none text-dark md:text-[32px]">
        {value === undefined ? <span className="inline-block h-8 w-10 animate-pulse rounded bg-black/5" /> : value}
      </span>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B6E54]">{label}</span>
      <span className="mt-0.5 text-xs text-[#8A8A8A]">{hint}</span>
    </Link>
  );
}

/** The four numbers that matter, each a shortcut to its section. */
export default function StatTiles() {
  const { data: addresses } = useGetAddressesQuery();
  const counts = useAccountCounts();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatTile href="/my-account/orders" icon={Package} label="Orders" value={counts.totalOrders} hint={counts.orders ? `${counts.orders} on the way` : 'Track and manage'} />
      <StatTile href="/my-account/wishlist" icon={Heart} label="Wishlist" value={counts.wishlist} hint="Saved for later" />
      <StatTile href="/my-account/notifications" icon={Bell} label="Updates" value={counts.notifications} hint="Unread notifications" />
      <StatTile href="/my-account/saved-addresses" icon={MapPin} label="Addresses" value={addresses?.length} hint="Saved for checkout" />
    </div>
  );
}
