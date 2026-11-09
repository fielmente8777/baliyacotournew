'use client';

/**
 * Design Builder → a step → "Body fit": which body shapes and fit concerns
 * each option of this step suits or should avoid. The same data as Admin →
 * Size & fit guide (content entry `guides`), edited here next to the options.
 */

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { AdminOption, AdminOptionGroup } from '@/@types/admin';
import { adminErrorMessage, useGetContentQuery, useSaveContentMutation } from '@/store/api/adminApi';
import { GUIDES_PAGE, mergeGuides, slugify, type FitChoice, type StyleGuides } from '@/lib/styleGuides';
import { cn } from '@/lib/format';
import { Badge, Button, Card, NoticeBar, type Notice } from '../ui';

type Mark = 'suits' | 'avoid' | null;

export default function BodyFitCard({ group, options }: { group: AdminOptionGroup; options: AdminOption[] }) {
  const { data, isLoading } = useGetContentQuery(GUIDES_PAGE);
  if (isLoading) return null;
  /* Remount on save so the draft starts from what was saved. */
  return <Editor key={data?.updatedAt ?? 'default'} saved={data?.data ?? null} group={group} options={options} />;
}

function Editor({ saved, group, options }: { saved: unknown; group: AdminOptionGroup; options: AdminOption[] }) {
  const initial = useMemo(() => mergeGuides(saved), [saved]);
  const [draft, setDraft] = useState<StyleGuides>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [save, { isLoading: saving }] = useSaveContentMutation();

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const choices: { kind: 'bodyShapes' | 'fitConcerns'; choice: FitChoice }[] = [
    ...draft.bodyShapes.map((choice) => ({ kind: 'bodyShapes' as const, choice })),
    ...draft.fitConcerns.map((choice) => ({ kind: 'fitConcerns' as const, choice })),
  ];

  const valueOf = (o: AdminOption) => slugify(o.value) || slugify(o.label);
  const markOf = (choice: FitChoice, v: string): Mark => {
    const a = choice.advice[group.code];
    return a?.suits.includes(v) ? 'suits' : a?.avoid.includes(v) ? 'avoid' : null;
  };

  /* Not marked → Suits → Avoid → not marked. */
  const cycle = (kind: 'bodyShapes' | 'fitConcerns', id: string, v: string) =>
    setDraft((d) => ({
      ...d,
      [kind]: d[kind].map((choice) => {
        if (choice.id !== id) return choice;
        const current = choice.advice[group.code] ?? { suits: [], avoid: [], tip: '' };
        const mark = markOf(choice, v);
        const suits = current.suits.filter((x) => x !== v);
        const avoid = current.avoid.filter((x) => x !== v);
        if (mark === null) suits.push(v);
        if (mark === 'suits') avoid.push(v);
        const advice = { ...choice.advice };
        if (!suits.length && !avoid.length && !current.tip.trim()) delete advice[group.code];
        else advice[group.code] = { ...current, suits, avoid };
        return { ...choice, advice };
      }),
    }));

  const submit = async () => {
    setNotice(null);
    try {
      await save({ page: GUIDES_PAGE, data: draft as unknown as Record<string, unknown> }).unwrap();
      setNotice({ tone: 'ok', text: 'Saved. Customers see it in “Find my fit”.' });
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not save') });
    }
  };

  if (!choices.length || !options.length) return null;

  return (
    <Card title="Body fit" actions={<span className="text-xs text-[#888]">Same as Admin → Size &amp; fit guide</span>}>
      <p className="mb-3 text-sm text-[#666]">
        Which body shapes and fit concerns each {group.label.toLowerCase()} suits. Customers see &ldquo;Suits you&rdquo; on it in
        &ldquo;Find my fit&rdquo;. Click to cycle: <span className="font-medium text-emerald-700">Suits</span> →{' '}
        <span className="font-medium text-red-700">Avoid</span> → not marked.
      </p>

      <div className="flex flex-col divide-y divide-[#f2eee8] rounded-md border border-[#eee8de]">
        {options.map((o) => {
          const v = valueOf(o);
          const suits = choices.filter(({ choice }) => markOf(choice, v) === 'suits').length;
          const avoid = choices.filter(({ choice }) => markOf(choice, v) === 'avoid').length;
          const open = openId === o._id;
          return (
            <div key={o._id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o._id)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
              >
                <span className="truncate text-sm font-medium text-dark">{o.label}</span>
                {suits > 0 && <Badge tone="ok">{suits} suits</Badge>}
                {avoid > 0 && <Badge tone="warn">{avoid} avoid</Badge>}
                <ChevronDown className={cn('ml-auto size-4 shrink-0 text-[#888] transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                  {choices.map(({ kind, choice }) => {
                    const mark = markOf(choice, v);
                    return (
                      <button
                        key={`${kind}-${choice.id}`}
                        type="button"
                        onClick={() => cycle(kind, choice.id, v)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-xs transition-colors',
                          mark === 'suits' && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                          mark === 'avoid' && 'border-red-200 bg-red-50 text-red-700 line-through',
                          mark === null && 'border-[#e2dcd2] bg-white text-[#555] hover:border-secondary/40'
                        )}
                      >
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />
        <div className="flex gap-2">
          <Button onClick={submit} loading={saving} disabled={!dirty}>
            Save body fit
          </Button>
          <Button variant="outline" disabled={!dirty} onClick={() => setDraft(initial)}>
            Discard
          </Button>
        </div>
      </div>
    </Card>
  );
}
