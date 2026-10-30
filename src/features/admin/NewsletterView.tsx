'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Search, Trash2 } from 'lucide-react';

import {
  adminErrorMessage,
  useExportNewsletterSubscribersMutation,
  useGetNewsletterSubscribersQuery,
  useRemoveNewsletterSubscriberMutation,
} from '@/store/api/adminApi';
import { Button, Card, inputClass, NoticeBar, PageTitle, type Notice } from './ui';

/**
 * Everyone who joined the newsletter from the website. The form's words are
 * edited under Home page → Newsletter; sending happens in a mailing tool
 * (Shopify Email, Mailchimp…) from the exported CSV.
 */
export default function NewsletterView() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<Notice>(null);
  const { data, isLoading, isFetching, error } = useGetNewsletterSubscribersQuery({ search: search.trim(), page });
  const [exportCsv, { isLoading: exporting }] = useExportNewsletterSubscribersMutation();
  const [remove] = useRemoveNewsletterSubscriberMutation();

  const download = async () => {
    setNotice(null);
    try {
      const url = await exportCsv().unwrap();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not export') });
    }
  };

  const removeOne = async (id: string, email: string) => {
    if (!window.confirm(`Remove ${email} from the newsletter list?`)) return;
    try {
      await remove(id).unwrap();
      setNotice({ tone: 'ok', text: `${email} removed.` });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not remove') });
    }
  };

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="Newsletter"
        description={
          <>
            Everyone who signed up with the form on the home page. Change the form&apos;s heading and text under{' '}
            <Link href="/admin/content/home" className="underline">
              Home page → Newsletter
            </Link>
            . Export the list to send emails from Shopify Email or Mailchimp.
          </>
        }
        actions={
          <Button variant="outline" onClick={download} loading={exporting} disabled={!data?.total}>
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />

        <Card
          title={data ? `${data.total} ${data.total === 1 ? 'subscriber' : 'subscribers'}` : 'Subscribers'}
          actions={
            <label className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#999]" aria-hidden />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search email"
                aria-label="Search email"
                className={`${inputClass} h-8 w-56 pl-8 text-sm`}
              />
            </label>
          }
        >
          {error ? (
            <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not load subscribers') }} />
          ) : isLoading ? (
            <p className="text-sm text-[#888]">Loading…</p>
          ) : !data?.items.length ? (
            <p className="text-sm text-[#888]">{search ? 'No email matches that search.' : 'No one has signed up yet.'}</p>
          ) : (
            <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#eee8de] text-left text-xs uppercase tracking-wide text-[#888]">
                    <th className="py-2 font-medium">Email</th>
                    <th className="py-2 font-medium">Signed up</th>
                    <th className="py-2 font-medium">From</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s._id} className="border-b border-[#f3efe8] last:border-0">
                      <td className="py-2.5 pr-3 break-all">{s.email}</td>
                      <td className="py-2.5 pr-3 whitespace-nowrap text-[#666]">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="py-2.5 pr-3 capitalize text-[#666]">{s.source}</td>
                      <td className="py-2.5 text-right">
                        <Button variant="ghost" className="h-8 px-2" aria-label={`Remove ${s.email}`} onClick={() => removeOne(s._id, s.email)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end gap-2 text-sm text-[#666]">
                  <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span>
                    Page {page} of {data.totalPages}
                  </span>
                  <Button variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
