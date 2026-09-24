/**
 * Shared by the navbar bell and the notifications page: where a notification
 * leads, which icon it gets, and how its time reads.
 */

import { Bell, PackageCheck, PackageX, Scissors, ShoppingBag, Sparkles, Truck, type LucideIcon } from 'lucide-react';

import type { AppNotification } from '@/@types/notification';

/** The page a notification opens: its order when it has one, otherwise the orders list. */
export const notificationHref = (n: AppNotification) =>
  n.meta?.orderId ? `/my-account/orders/${n.meta.orderId}` : '/my-account/orders';

const STATUS_ICONS: Record<string, LucideIcon> = {
  confirmed: ShoppingBag,
  stitching: Scissors,
  embroidery: Sparkles,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: PackageX,
};

function iconFor(n: AppNotification): { Icon: LucideIcon; tone: string } {
  if (n.event === 'ORDER_CANCELLED' || n.meta?.status === 'cancelled') {
    return { Icon: PackageX, tone: 'bg-[#FBE9E8] text-[#9B1C14]' };
  }
  if (n.event === 'ORDER_PLACED') return { Icon: ShoppingBag, tone: 'bg-[#F6E7EA] text-[#A52C45]' };
  if (n.meta?.status === 'delivered') return { Icon: PackageCheck, tone: 'bg-[#E8F1E8] text-[#2F5E31]' };
  const Icon = (n.meta?.status && STATUS_ICONS[n.meta.status]) || Bell;
  return { Icon, tone: 'bg-[#FBF1E1] text-[#8A5A12]' };
}

export function NotificationIcon({ notification, size = 'md' }: { notification: AppNotification; size?: 'sm' | 'md' }) {
  const { Icon, tone } = iconFor(notification);
  const box = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center rounded-full ${tone}`} aria-hidden="true">
      <Icon size={size === 'sm' ? 15 : 18} />
    </span>
  );
}

/** "just now", "5m ago", "3d ago", then a short date. */
export const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-CA', { day: 'numeric', month: 'short' });
};

/** Heading a notification is grouped under on the notifications page. */
export function dateGroup(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (d.getTime() >= startOfToday) return 'Today';
  if (d.getTime() >= startOfToday - day) return 'Yesterday';
  if (d.getTime() >= startOfToday - 6 * day) return 'This week';
  return 'Earlier';
}
