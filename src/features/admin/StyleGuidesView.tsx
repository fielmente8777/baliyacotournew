'use client';

/**
 * Admin → Size & fit guide. Edits what customers see in Create Your Own Design:
 *
 *   - the Size guide popup (size chart + how-to-measure tips), opened from the
 *     Size and Measurements steps;
 *   - "Find my fit": body shapes and fit concerns, each with per-step advice —
 *     which options suit (they get a "Suits you" badge), which to avoid, and a
 *     tip shown above the options.
 *
 * Saved as the content entry `guides`. Until it is saved, the builder shows
 * the defaults in lib/styleGuides.ts — which is also what this editor starts
 * from.
 */

import { useMemo, useState } from 'react';
import { ChevronDown, Plus, RotateCcw, Trash2 } from 'lucide-react';

import type { AdminCatalog } from '@/@types/admin';
import { adminErrorMessage, useGetCatalogQuery, useGetContentQuery, useSaveContentMutation } from '@/store/api/adminApi';
import {
  DEFAULT_GUIDES,
  GUIDES_PAGE,
  mergeGuides,
  slugify,
  type BodyShape,
  type FitChoice,
  type GroupAdvice,
  type StyleGuides,
} from '@/lib/styleGuides';
import { cn } from '@/lib/format';
import { Silhouette } from '@/features/create-design/FitProfile';
import { Badge, Button, Card, inputClass, NoticeBar, PageTitle, type Notice } from './ui';

export default function StyleGuidesView() {
  const { data, isLoading, error } = useGetContentQuery(GUIDES_PAGE);
  const { data: catalog } = useGetCatalogQuery();

  return (
    <div className="max-w-5xl">
      <PageTitle
        title="Size & fit guide"
        description="The size chart and the body-shape suggestions customers see in Create Your Own Design. Changes show on the site as soon as you save."
      />
      {isLoading && <p className="text-sm text-[#888]">Loading…</p>}
      {/* A missing entry is normal before the first save — start from the defaults. */}
      {!isLoading && (
        <Editor
          key={data?.updatedAt ?? 'default'}
          saved={error ? null : (data?.data ?? null)}
          isSaved={Boolean(data?.updatedAt) && !error}
          catalog={catalog}
        />
      )}
    </div>
  );
}

function Editor({ saved, isSaved, catalog }: { saved: unknown; isSaved: boolean; catalog?: AdminCatalog }) {
  const initial = useMemo(() => mergeGuides(saved), [saved]);
  const [draft, setDraft] = useState<StyleGuides>(initial);
  const [notice, setNotice] = useState<Notice>(null);
  const [save, { isLoading: saving }] = useSaveContentMutation();

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const patch = <K extends keyof StyleGuides>(key: K, value: StyleGuides[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = async () => {
    setNotice(null);
    try {
      await save({ page: GUIDES_PAGE, data: draft as unknown as Record<string, unknown> }).unwrap();
      setNotice({ tone: 'ok', text: 'Saved. Customers see the new guide on their next visit to the designer.' });
    } catch (err) {
      setNotice({
        tone: 'error',
        text: `${adminErrorMessage(err, 'Could not save')}. If this keeps happening, the backend needs "guides" added to its content pages.`,
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm text-[#666]">
        <Badge tone={isSaved ? 'ok' : 'off'}>{isSaved ? 'Saved' : 'Using defaults'}</Badge>
        {!isSaved && <span>Nothing saved yet — customers see the built-in guide below.</span>}
      </div>

      <SizeChartCard value={draft.sizeChart} onChange={(v) => patch('sizeChart', v)} />
      <TipsCard value={draft.measureTips} onChange={(v) => patch('measureTips', v)} />

      <ChoicesCard
        title="Body shapes"
        description="Customers pick one. Each shape's advice marks options as “Suits you” on each step."
        kind="shape"
        value={draft.bodyShapes}
        onChange={(v) => patch('bodyShapes', v as BodyShape[])}
        catalog={catalog}
      />
      <ChoicesCard
        title="Fit concerns"
        description="Customers can pick several (Heavy bust, Petite…). An option gets “Suits you” only if every chosen shape and concern that lists options for that step marks it Suits, and none marks it Avoid."
        kind="concern"
        value={draft.fitConcerns}
        onChange={(v) => patch('fitConcerns', v)}
        catalog={catalog}
      />

      <div className="sticky bottom-0 z-10 flex flex-col gap-3 rounded-lg border border-[#e6e0d6] bg-white/95 p-3 backdrop-blur">
        <NoticeBar notice={notice} onClose={() => setNotice(null)} />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm('Replace everything here with the built-in guide? You still need to Save.')) setDraft(DEFAULT_GUIDES);
            }}
          >
            <RotateCcw className="size-4" /> Defaults
          </Button>
          <Button variant="outline" disabled={!dirty} onClick={() => setDraft(initial)}>
            Discard
          </Button>
          <Button onClick={submit} loading={saving} disabled={!dirty}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---- Size chart ------------------------------------------------------------ */

function SizeChartCard({ value, onChange }: { value: StyleGuides['sizeChart']; onChange: (v: StyleGuides['sizeChart']) => void }) {
  const { columns, rows, note } = value;

  const setColumn = (i: number, name: string) => onChange({ ...value, columns: columns.map((c, j) => (j === i ? name : c)) });
  const addColumn = () =>
    onChange({ ...value, columns: [...columns, 'New'], rows: rows.map((r) => ({ ...r, values: [...r.values, 0] })) });
  const removeColumn = (i: number) =>
    onChange({
      ...value,
      columns: columns.filter((_, j) => j !== i),
      rows: rows.map((r) => ({ ...r, values: r.values.filter((_, j) => j !== i) })),
    });
  const setRow = (r: number, next: (typeof rows)[number]) => onChange({ ...value, rows: rows.map((row, j) => (j === r ? next : row)) });
  const moveRow = (r: number, by: -1 | 1) => {
    const next = [...rows];
    const [row] = next.splice(r, 1);
    next.splice(r + by, 0, row);
    onChange({ ...value, rows: next });
  };

  return (
    <Card title="Size chart" actions={<span className="text-xs text-[#888]">Body measurements in inches — customers can switch to cm</span>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="w-24 text-left text-xs font-semibold uppercase tracking-wide text-[#888]">Size</th>
              {columns.map((c, i) => (
                <th key={i} className="min-w-24">
                  <div className="flex items-center gap-1">
                    <input aria-label={`Column ${i + 1} name`} value={c} onChange={(e) => setColumn(i, e.target.value)} className={cn(inputClass, 'font-semibold')} />
                    <button
                      type="button"
                      aria-label={`Remove column ${c}`}
                      disabled={columns.length <= 1}
                      onClick={() => removeColumn(i)}
                      className="rounded p-1 text-[#aaa] hover:text-red-700 disabled:opacity-30"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="w-24">
                <Button variant="ghost" onClick={addColumn} className="h-8 px-2">
                  <Plus className="size-4" /> Column
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <td>
                  <input aria-label="Size" value={row.size} onChange={(e) => setRow(r, { ...row, size: e.target.value })} className={cn(inputClass, 'font-semibold')} />
                </td>
                {columns.map((c, i) => (
                  <td key={i}>
                    <input
                      aria-label={`${row.size} ${c}`}
                      type="number"
                      step="0.5"
                      min="0"
                      value={row.values[i] || ''}
                      onChange={(e) => setRow(r, { ...row, values: row.values.map((v, j) => (j === i ? Number(e.target.value) || 0 : v)) })}
                      className={cn(inputClass, 'text-right tabular-nums')}
                    />
                  </td>
                ))}
                <td>
                  <div className="flex items-center gap-0.5 text-[#888]">
                    <button type="button" aria-label="Move up" disabled={r === 0} onClick={() => moveRow(r, -1)} className="rounded p-1 hover:text-dark disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={r === rows.length - 1}
                      onClick={() => moveRow(r, 1)}
                      className="rounded p-1 hover:text-dark disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove size ${row.size}`}
                      disabled={rows.length <= 1}
                      onClick={() => onChange({ ...value, rows: rows.filter((_, j) => j !== r) })}
                      className="rounded p-1 hover:text-red-700 disabled:opacity-30"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Button variant="outline" onClick={() => onChange({ ...value, rows: [...rows, { size: '', values: columns.map(() => 0) }] })}>
          <Plus className="size-4" /> Add size
        </Button>
        <label className="flex min-w-64 flex-1 flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">Note under the chart</span>
          <input value={note} onChange={(e) => onChange({ ...value, note: e.target.value })} className={inputClass} />
        </label>
      </div>
    </Card>
  );
}

/* ---- How-to-measure tips --------------------------------------------------- */

function TipsCard({ value, onChange }: { value: StyleGuides['measureTips']; onChange: (v: StyleGuides['measureTips']) => void }) {
  const set = (i: number, next: StyleGuides['measureTips'][number]) => onChange(value.map((t, j) => (j === i ? next : t)));
  return (
    <Card title="How to measure (under the size chart)">
      <div className="flex flex-col gap-2">
        {value.map((t, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr_auto] items-center gap-2">
            <input aria-label="Measurement" value={t.name} onChange={(e) => set(i, { ...t, name: e.target.value })} placeholder="Bust" className={inputClass} />
            <input aria-label="How to measure it" value={t.tip} onChange={(e) => set(i, { ...t, tip: e.target.value })} className={inputClass} />
            <Button variant="ghost" aria-label={`Remove ${t.name}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-2 text-red-700">
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {value.length === 0 && <p className="text-sm text-[#888]">No tips — the popup shows only the chart.</p>}
      </div>
      <Button variant="outline" className="mt-3" onClick={() => onChange([...value, { name: '', tip: '' }])}>
        <Plus className="size-4" /> Add tip
      </Button>
    </Card>
  );
}

/* ---- Body shapes and fit concerns ------------------------------------------ */

function ChoicesCard({
  title,
  description,
  kind,
  value,
  onChange,
  catalog,
}: {
  title: string;
  description: string;
  kind: 'shape' | 'concern';
  value: FitChoice[] | BodyShape[];
  onChange: (v: FitChoice[] | BodyShape[]) => void;
  catalog?: AdminCatalog;
}) {
  const [newLabel, setNewLabel] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    const base = slugify(label) || kind;
    let id = base;
    for (let n = 2; value.some((c) => c.id === id); n++) id = `${base}-${n}`;
    const choice: FitChoice = { id, label, description: '', advice: {} };
    onChange([...value, kind === 'shape' ? { ...choice, widths: [28, 28, 24, 30] } : choice] as FitChoice[]);
    setNewLabel('');
    setOpenId(id);
  };

  return (
    <Card title={title} actions={<span className="text-xs text-[#888]">{value.length} added</span>}>
      <p className="mb-3 text-sm text-[#666]">{description}</p>
      <div className="flex flex-col gap-2">
        {value.map((choice, i) => (
          <ChoiceEditor
            key={choice.id}
            choice={choice}
            isShape={kind === 'shape'}
            open={openId === choice.id}
            onToggle={() => setOpenId(openId === choice.id ? null : choice.id)}
            onChange={(next) => onChange(value.map((c, j) => (j === i ? next : c)) as FitChoice[])}
            onRemove={() => {
              if (window.confirm(`Remove “${choice.label}”? You still need to Save.`)) onChange(value.filter((_, j) => j !== i) as FitChoice[]);
            }}
            catalog={catalog}
          />
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={kind === 'shape' ? 'New shape, e.g. Diamond' : 'New concern, e.g. Short neck'}
          className={cn(inputClass, 'max-w-xs')}
        />
        <Button variant="outline" onClick={add} disabled={!newLabel.trim()}>
          <Plus className="size-4" /> Add
        </Button>
      </div>
    </Card>
  );
}

type Mark = 'suits' | 'avoid' | null;

function ChoiceEditor({
  choice,
  isShape,
  open,
  onToggle,
  onChange,
  onRemove,
  catalog,
}: {
  choice: FitChoice | BodyShape;
  isShape: boolean;
  open: boolean;
  onToggle: () => void;
  onChange: (next: FitChoice | BodyShape) => void;
  onRemove: () => void;
  catalog?: AdminCatalog;
}) {
  /* Every step that has options, plus any step the advice mentions that the
     catalogue doesn't have (so nothing saved is hidden). */
  const steps = useMemo(() => {
    const fromCatalog = (catalog?.groups ?? [])
      .filter((g) => g.isActive && g.inputType !== 'color_select' && g.inputType !== 'size_select')
      .sort((a, b) => a.position - b.position)
      .map((g) => ({
        code: g.code,
        label: g.label,
        options: (catalog?.options ?? [])
          .filter((o) => o.groupId === g._id && o.isActive)
          .sort((a, b) => a.position - b.position)
          .map((o) => ({ value: slugify(o.value) || slugify(o.label), label: o.label })),
      }));
    const known = new Set(fromCatalog.map((s) => s.code));
    const extra = Object.keys(choice.advice)
      .filter((code) => !known.has(code))
      .map((code) => ({ code, label: code, options: [] as { value: string; label: string }[] }));
    return [...fromCatalog, ...extra];
  }, [catalog, choice.advice]);

  const adviceCount = Object.values(choice.advice).filter((a) => a.suits.length || a.avoid.length || a.tip.trim()).length;

  const setAdvice = (code: string, next: GroupAdvice) => {
    const advice = { ...choice.advice };
    if (!next.suits.length && !next.avoid.length && !next.tip.trim()) delete advice[code];
    else advice[code] = next;
    onChange({ ...choice, advice });
  };

  return (
    <div className="rounded-md border border-[#eee8de]">
      <div className="flex items-center gap-3 px-3 py-2">
        {isShape && <Silhouette widths={(choice as BodyShape).widths} className="h-10 w-8 shrink-0 text-secondary" />}
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="truncate text-sm font-medium text-dark">{choice.label}</span>
          <span className="text-xs text-[#888]">
            {adviceCount} {adviceCount === 1 ? 'step' : 'steps'} with advice
          </span>
          <ChevronDown className={cn('ml-auto size-4 shrink-0 text-[#888] transition-transform', open && 'rotate-180')} />
        </button>
        <Button variant="ghost" aria-label={`Remove ${choice.label}`} onClick={onRemove} className="px-2 text-red-700">
          <Trash2 className="size-4" />
        </Button>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-[#eee8de] px-3 py-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">Name</span>
              <input value={choice.label} onChange={(e) => onChange({ ...choice, label: e.target.value })} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">Short description</span>
              <input value={choice.description} onChange={(e) => onChange({ ...choice, description: e.target.value })} className={inputClass} />
            </label>
          </div>

          {isShape && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#666]">Silhouette widths (10–40)</span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {(['Shoulder', 'Bust', 'Waist', 'Hip'] as const).map((name, i) => (
                  <label key={name} className="flex items-center gap-1.5 text-sm text-[#555]">
                    {name}
                    <input
                      type="number"
                      min={10}
                      max={40}
                      value={(choice as BodyShape).widths[i]}
                      onChange={(e) => {
                        const widths = [...(choice as BodyShape).widths] as BodyShape['widths'];
                        widths[i] = Math.min(40, Math.max(10, Number(e.target.value) || 10));
                        onChange({ ...(choice as BodyShape), widths });
                      }}
                      className={cn(inputClass, 'w-16')}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-[#888]">
              Click an option to cycle: <span className="font-medium text-emerald-700">Suits</span> →{' '}
              <span className="font-medium text-red-700">Avoid</span> → not marked.
            </p>
            {!catalog && <p className="mt-2 text-sm text-[#888]">Loading the Design Builder options…</p>}
            <div className="mt-2 flex flex-col divide-y divide-[#f2eee8] rounded-md border border-[#f2eee8]">
              {steps.map((step) => {
                const current = choice.advice[step.code] ?? { suits: [], avoid: [], tip: '' };
                const markOf = (v: string): Mark => (current.suits.includes(v) ? 'suits' : current.avoid.includes(v) ? 'avoid' : null);
                const cycle = (v: string) => {
                  const mark = markOf(v);
                  const suits = current.suits.filter((x) => x !== v);
                  const avoid = current.avoid.filter((x) => x !== v);
                  if (mark === null) suits.push(v);
                  if (mark === 'suits') avoid.push(v);
                  setAdvice(step.code, { ...current, suits, avoid });
                };
                /* Saved values that no longer match an option in the catalogue. */
                const known = new Set(step.options.map((o) => o.value));
                const orphans = [...current.suits, ...current.avoid].filter((v) => !known.has(v));

                return (
                  <div key={step.code} className="grid gap-2 p-3 md:grid-cols-[120px_1fr]">
                    <span className="pt-1 text-sm font-medium text-dark">{step.label}</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {step.options.map((o) => {
                          const mark = markOf(o.value);
                          return (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() => cycle(o.value)}
                              className={cn(
                                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                                mark === 'suits' && 'border-emerald-300 bg-emerald-50 text-emerald-800',
                                mark === 'avoid' && 'border-red-200 bg-red-50 text-red-700 line-through',
                                mark === null && 'border-[#e2dcd2] bg-white text-[#555] hover:border-secondary/40'
                              )}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                        {orphans.map((v) => (
                          <button
                            key={`orphan-${v}`}
                            type="button"
                            title="Not in the Design Builder — click to remove"
                            onClick={() =>
                              setAdvice(step.code, {
                                ...current,
                                suits: current.suits.filter((x) => x !== v),
                                avoid: current.avoid.filter((x) => x !== v),
                              })
                            }
                            className="rounded-full border border-dashed border-[#d8d2c8] px-2.5 py-1 text-xs text-[#999] hover:border-red-300 hover:text-red-700"
                          >
                            {v} ×
                          </button>
                        ))}
                        {step.options.length === 0 && orphans.length === 0 && <span className="text-xs text-[#aaa]">No options in this step.</span>}
                      </div>
                      <input
                        aria-label={`${step.label} tip`}
                        value={current.tip}
                        onChange={(e) => setAdvice(step.code, { ...current, tip: e.target.value })}
                        placeholder={`Tip shown on the ${step.label} step (optional)`}
                        className={cn(inputClass, 'text-[13px]')}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
