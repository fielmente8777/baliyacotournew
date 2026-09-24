'use client';

/**
 * Every notification, newest first, grouped by day. Tapping one marks it
 * read and opens the order it's about. The bell in the navbar links here
 * through "Show all notifications".
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, ChevronRight } from 'lucide-react';

import type { AppNotification } from '@/@types/notification';
import EmptyState from '@/components/EmptyState';
import { NotificationsIllustration } from '@/components/illustrations';
import {
  NotificationIcon,
  dateGroup,
  notificationHref,
  timeAgo,
} from '@/features/notifications/notificationUtils';
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/store/api/notificationApi';

import AccountContent from '../../app/(website)/my-account/components/AccountContent';

type Tab = 'all' | 'unread';

export default function NotificationsView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('all');

  /* Same polling as the bell, so a new update appears here too. */
  const { data, isLoading, isError, refetch } = useGetNotificationsQuery({ limit: 100 }, { pollingInterval: 60000 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  const unread = data?.unread ?? 0;

  const groups = useMemo(() => {
    const items = (data?.items ?? []).filter((n) => tab === 'all' || !n.isRead);
    const map = new Map<string, AppNotification[]>();
    items.forEach((n) => {
      const key = dateGroup(n.createdAt);
      map.set(key, [...(map.get(key) ?? []), n]);
    });
    return [...map.entries()];
  }, [data, tab]);

  const open = (n: AppNotification) => {
    if (!n.isRead) markRead(n._id);
    router.push(notificationHref(n));
  };

  const tabClass = (t: Tab) =>
    `h-8 rounded-full px-3.5 text-[13px] transition-colors ${
      tab === t ? 'bg-[#A52C45] text-white' : 'text-[#555] hover:bg-[#F5F1EA]'
    }`;

  return (
    <AccountContent>
      <div className="flex flex-col gap-3 border-b border-[#E9E4DC] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-[#202020]">Notifications</h2>
          <p className="text-xs text-[#8A8A8A]">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div className="flex gap-1 rounded-full bg-[#FAF8F4] p-1" role="tablist" aria-label="Show">
            <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')} className={tabClass('all')}>
              All
            </button>
            <button type="button" role="tab" aria-selected={tab === 'unread'} onClick={() => setTab('unread')} className={tabClass('unread')}>
              Unread{unread > 0 ? ` (${unread})` : ''}
            </button>
          </div>

          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              disabled={markingAll}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#A52C45] transition-opacity hover:underline disabled:opacity-50"
            >
              <CheckCheck size={15} aria-hidden="true" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="animate-pulse divide-y divide-[#F2EEE8]" aria-busy="true" aria-label="Loading notifications">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 px-4 py-4 sm:px-6">
              <div className="h-10 w-10 rounded-full bg-black/5" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 w-1/3 rounded bg-black/5" />
                <div className="h-3 w-2/3 rounded bg-black/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="px-4 py-8 sm:px-6">
          <p className="text-sm text-[#A52C45]">We couldn&apos;t load your notifications.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 text-sm underline">
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <EmptyState
          illustration={<NotificationsIllustration />}
          title={tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          message="Updates about your orders, from confirmation to delivery, will appear here."
          action={tab === 'unread' ? { label: 'Show all', onClick: () => setTab('all') } : { label: 'View my orders', href: '/my-account/orders' }}
        />
      )}

      {groups.map(([label, items]) => (
        <section key={label} className="animate-fade-in">
          <h3 className="bg-[#FAF8F4] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A] sm:px-6">
            {label}
          </h3>
          <ul className="divide-y divide-[#F2EEE8]">
            {items.map((n) => (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={`group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-[#FAF7F2] sm:px-6 ${
                    n.isRead ? 'bg-white' : 'bg-[#FDF8F9]'
                  }`}
                >
                  <NotificationIcon notification={n} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm text-[#222] ${n.isRead ? '' : 'font-semibold'}`}>{n.title}</p>
                      <span className="shrink-0 text-[11px] text-[#A9A9A9]">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-[#6B6B6B]">{n.message}</p>
                    {n.meta?.orderId && (
                      <span className="mt-1.5 inline-flex items-center gap-0.5 text-[12px] font-medium text-[#A52C45] transition-[gap] duration-300 group-hover:gap-1.5">
                        View order
                        <ChevronRight size={13} aria-hidden="true" />
                      </span>
                    )}
                  </div>

                  {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#A52C45]" aria-label="unread" />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AccountContent>
  );
}
