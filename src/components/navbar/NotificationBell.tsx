'use client';

/**
 * Notification bell with an unread badge and a dropdown feed.
 *
 * Opening the panel does not mark everything read — the customer may only be
 * glancing. Reading one marks that one; "Mark all read" is explicit.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/api/notificationApi';

/** Relative time without pulling in a date library for one label. */
const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Only poll while the tab is being used; the badge is not worth a
     background request every 30s forever. */
  const { data } = useGetNotificationsQuery(undefined, { pollingInterval: 60000 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const items = data?.items ?? [];
  const unread = data?.unread ?? 0;

  useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative flex aspect-square w-7 items-center justify-center text-[#5C6476] transition-all duration-300 ease-in-out hover:text-secondary"
      >
        <Bell size={22} />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-medium leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-xl border border-[#EFEBE4] bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-[#F2EEE8] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#222]">Notifications</h3>

            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-xs text-secondary"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-[#9A9A9A]">
                Nothing here yet.
              </p>
            )}

            {items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => !item.isRead && markRead(item._id)}
                className={`block w-full border-b border-[#F7F4EF] px-4 py-3 text-left last:border-none ${
                  item.isRead ? 'bg-white' : 'bg-[#FDF8F9]'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!item.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#222]">{item.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#6B6B6B]">
                      {item.message}
                    </p>
                    <p className="mt-1 text-[11px] text-[#A9A9A9]">
                      {timeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Link
            href="/my-account/orders"
            onClick={() => setOpen(false)}
            className="block border-t border-[#F2EEE8] px-4 py-3 text-center text-xs font-medium text-secondary"
          >
            View my orders
          </Link>
        </div>
      )}
    </div>
  );
}
