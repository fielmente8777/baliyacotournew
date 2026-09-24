'use client';

/**
 * Notification bell with an unread badge and a dropdown of the latest few.
 *
 * Tapping a notification marks it read and opens what it's about (usually
 * that order's detail page). "Show all notifications" opens the full page.
 * Opening the panel alone doesn't mark anything read — the customer may only
 * be glancing; "Mark all read" is explicit.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';

import type { AppNotification } from '@/@types/notification';
import { NotificationsIllustration } from '@/components/illustrations';
import { NotificationIcon, notificationHref, timeAgo } from '@/features/notifications/notificationUtils';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/api/notificationApi';

/** How many the dropdown shows; the rest are on the notifications page. */
const PREVIEW_COUNT = 5;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* Polls once a minute so new order updates show up without a refresh. */
  const { data } = useGetNotificationsQuery(undefined, { pollingInterval: 60000 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const items = (data?.items ?? []).slice(0, PREVIEW_COUNT);
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

  const openNotification = (item: AppNotification) => {
    if (!item.isRead) markRead(item._id);
    setOpen(false);
    router.push(notificationHref(item));
  };

  return (
    <div ref={ref} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative flex aspect-square w-7 items-center justify-center text-[#5C6476] transition-all duration-300 ease-in-out hover:text-secondary"
      >
        <Bell size={22} />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 animate-pop-in items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-medium leading-none text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-4 top-full z-50 mt-3 origin-top-right animate-pop-in overflow-hidden rounded-xl border border-[#EFEBE4] bg-white shadow-xl sm:inset-x-auto sm:right-0 sm:top-auto sm:w-96">
          <div className="flex items-center justify-between border-b border-[#F2EEE8] px-4 py-3">
            <h3 className="text-sm font-semibold text-[#222]">Notifications</h3>

            {unread > 0 && (
              <button type="button" onClick={() => markAllRead()} className="text-xs text-secondary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto sm:max-h-96">
            {items.length === 0 && (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <NotificationsIllustration className="w-24" />
                <p className="mt-2 text-sm text-[#9A9A9A]">You&apos;re all caught up.</p>
              </div>
            )}

            {items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => openNotification(item)}
                className={`flex w-full items-start gap-3 border-b border-[#F7F4EF] px-4 py-3 text-left transition-colors duration-200 last:border-none hover:bg-[#FAF7F2] ${
                  item.isRead ? 'bg-white' : 'bg-[#FDF8F9]'
                }`}
              >
                <NotificationIcon notification={item} size="sm" />

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-[#222]">
                    <span className="truncate">{item.title}</span>
                    {!item.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" aria-label="unread" />}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-[#6B6B6B]">{item.message}</p>
                  <p className="mt-1 text-[11px] text-[#A9A9A9]">{timeAgo(item.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>

          <Link
            href="/my-account/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 border-t border-[#F2EEE8] px-4 py-3 text-xs font-medium text-secondary transition-colors hover:bg-[#FBF6F7]"
          >
            Show all notifications
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
