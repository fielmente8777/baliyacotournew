'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, RotateCcw } from 'lucide-react';

import type { ContentPage } from '@/@types/admin';
import { adminErrorMessage, useGetContentQuery, useSaveContentMutation } from '@/store/api/adminApi';
import { mergeContent } from '@/lib/siteContent';
import { homePageData } from '@/app/(website)/Home/pagedata';
import { websiteFooterData } from '@/components/footer/footerData';
import { termsContent } from '@/app/(website)/terms-and-conditions/pageData';
import { productsPageData } from '@/app/(website)/products/pageData';
import { Button, Card, NoticeBar, PageTitle, type Notice } from '../ui';
import { ContentField, humanize, ObjectFields, type Json } from './ContentFields';
import AiWriter from './AiWriter';
import RichTextEditor from './RichTextEditor';

type Content = { [key: string]: Json };

/** The defaults each page ships with — also the shape the editor follows. */
const PAGES: Record<ContentPage, { title: string; path: string; description: string; defaults: Content }> = {
  home: {
    title: 'Home page',
    path: '/',
    description: 'Every section of the home page, top to bottom. Switch a section off with its Show switch. Product names, prices and photos come from Shopify; the fabric library from the Design Builder.',
    defaults: homePageData as unknown as Content,
  },
  footer: {
    title: 'Footer',
    path: '/',
    description: 'Shown at the bottom of every page.',
    defaults: { footer: websiteFooterData as unknown as Json },
  },
  products: {
    title: 'Pre-made Designs page',
    path: '/products',
    description: 'The banner (words and pictures), the silhouette heading and the design-your-own block on the Pre-made Designs page. Product names, prices and photos come from Shopify.',
    defaults: productsPageData as unknown as Content,
  },
  terms: {
    title: 'Terms & Conditions',
    path: '/terms-and-conditions',
    description: 'The terms page. Type and format it like a document; no HTML needed.',
    defaults: { html: termsContent },
  },
};

/* The footer is saved flat (logo, description, lists) but edited as one section. */
const toEditable = (page: ContentPage, saved: Record<string, unknown> | null): Content => {
  if (page === 'footer') return { footer: mergeContent(websiteFooterData, saved) as unknown as Json };
  return mergeContent(PAGES[page].defaults, saved) as Content;
};
const toSaved = (page: ContentPage, draft: Content) => (page === 'footer' ? (draft.footer as Content) : draft);

const SECTION_LABELS: Record<string, string> = {
  hero: 'Top banner',
  highlights: 'Four promises under the banner',
  silhouettes: 'Shop by silhouette',
  philosophy: 'Statement',
  designOnline: 'Designed online (laptop picture)',
  products: 'Ready to order (product tabs)',
  collections: 'Collections',
  fabrics: 'Fabric library',
  behindTheScenes: 'Behind the scenes',
  reviews: 'Customer photos and reviews',
  foundersMessage: 'Note from the founders',
  newsletter: 'Newsletter sign-up',
  footer: 'Footer',
  promo: 'Design-your-own block',
};

export default function ContentEditorView({ page }: { page: ContentPage }) {
  const { data, isLoading, error } = useGetContentQuery(page);

  if (isLoading) return <p className="text-sm text-[#888]">Loading…</p>;
  if (error) return <NoticeBar notice={{ tone: 'error', text: adminErrorMessage(error, 'Could not load this page') }} />;

  /* Remount when the saved version changes so the draft starts from it. */
  return <Editor key={`${page}:${data?.updatedAt ?? 'default'}`} page={page} saved={data?.data ?? null} updatedAt={data?.updatedAt} />;
}

function Editor({ page, saved, updatedAt }: { page: ContentPage; saved: Record<string, unknown> | null; updatedAt?: string }) {
  const config = PAGES[page];
  const initial = toEditable(page, saved);
  const [draft, setDraft] = useState<Content>(initial);
  const [notice, setNotice] = useState<Notice>(null);
  const [save, { isLoading: saving }] = useSaveContentMutation();

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const defaults = page === 'footer' ? { footer: websiteFooterData as unknown as Json } : config.defaults;

  const submit = async () => {
    setNotice(null);
    try {
      await save({ page, data: toSaved(page, draft) }).unwrap();
      setNotice({ tone: 'ok', text: 'Saved. The website shows the change on its next load.' });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not save') });
    }
  };

  const resetSection = (key: string) => {
    if (!window.confirm(`Put “${SECTION_LABELS[key] ?? humanize(key)}” back to the original text and pictures? Nothing is saved until you click Save.`)) return;
    setDraft((d) => ({ ...d, [key]: defaults[key] }));
  };

  return (
    <div className="max-w-5xl">
      <PageTitle
        title={config.title}
        description={
          <>
            {config.description}
            {updatedAt ? ` Last saved ${new Date(updatedAt).toLocaleString()}.` : ' Not edited yet — showing the original content.'}
          </>
        }
        actions={
          <Link
            href={config.path}
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d8d2c8] bg-white px-3.5 text-sm text-dark transition hover:border-secondary hover:text-secondary"
          >
            <ExternalLink className="size-4" /> View page
          </Link>
        }
      />

      <div className="flex flex-col gap-5">
        {page === 'terms' ? (
          <TermsEditor html={String(draft.html ?? '')} onChange={(html) => setDraft({ html })} />
        ) : (
          Object.entries(draft).map(([key, section]) => (
            <Card
              key={key}
              title={SECTION_LABELS[key] ?? humanize(key)}
              actions={
                <Button variant="ghost" onClick={() => resetSection(key)} className="h-8 text-xs">
                  <RotateCcw className="size-3.5" /> Reset to original
                </Button>
              }
            >
              {section && typeof section === 'object' && !Array.isArray(section) ? (
                <ObjectFields
                  value={section}
                  parentKey={key}
                  template={defaults[key] as { [k: string]: Json }}
                  onChange={(next) => setDraft((d) => ({ ...d, [key]: next }))}
                />
              ) : (
                <ContentField name={key} value={section} onChange={(next) => setDraft((d) => ({ ...d, [key]: next }))} />
              )}
            </Card>
          ))
        )}

        <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-lg border border-[#e6e0d6] bg-white/95 p-3 backdrop-blur">
          <NoticeBar notice={notice} onClose={() => setNotice(null)} />
          <div className="flex items-center justify-end gap-2">
            {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
            <Button variant="outline" disabled={!dirty} onClick={() => setDraft(initial)}>
              Discard
            </Button>
            <Button onClick={submit} loading={saving} disabled={!dirty}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The Terms page: typed like a document, formatted with the toolbar — no HTML.
 * "Write with AI" can draft, tidy or shorten the whole text.
 */
function TermsEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  return (
    <Card
      title="Terms text"
      actions={<AiWriter value={html} onApply={onChange} field="Terms and Conditions page" format="html" />}
    >
      <p className="mb-3 text-xs text-[#888]">
        Type as you would in a document. Select text and use the toolbar for headings, bold, lists and links; what you
        see is how it looks on the website.
      </p>
      <RichTextEditor value={html} onChange={onChange} placeholder="Write the terms here…" />
    </Card>
  );
}
