'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react';

import type { AdminCatalog, AdminOptionConfig } from '@/@types/admin';
import { cn } from '@/lib/format';
import { Badge, Button, Field, inputClass } from '../ui';
import { byPosition } from './catalogKeys';

/**
 * The steps one garment shows in the builder, in order, with their rules:
 * required or optional, which options are offered, the default, and
 * "only show this step when …" (e.g. Cuff only after Full Sleeve).
 */
export default function StepsEditor({
  catalog,
  configs,
  onChange,
}: {
  catalog: AdminCatalog;
  configs: AdminOptionConfig[];
  onChange: (configs: AdminOptionConfig[]) => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState('');

  const groupById = new Map(catalog.groups.map((g) => [g._id, g]));
  const optionsOf = (groupId: string) => catalog.options.filter((o) => o.groupId === groupId).sort(byPosition);

  const ordered = [...configs].sort(byPosition);
  const used = new Set(configs.map((c) => c.groupId));
  const available = catalog.groups.filter((g) => !used.has(g._id));

  /* Positions are always 0..n-1 in list order. */
  const commit = (list: AdminOptionConfig[]) => onChange(list.map((c, i) => ({ ...c, position: i })));

  const update = (groupId: string, patch: Partial<AdminOptionConfig>) =>
    commit(ordered.map((c) => (c.groupId === groupId ? { ...c, ...patch } : c)));

  const move = (index: number, by: -1 | 1) => {
    const list = [...ordered];
    const [item] = list.splice(index, 1);
    list.splice(index + by, 0, item);
    commit(list);
  };

  const remove = (groupId: string) =>
    commit(
      ordered
        .filter((c) => c.groupId !== groupId)
        /* A step that depended on the removed one would never show. */
        .map((c) => (c.dependsOn?.groupId === groupId ? { ...c, dependsOn: undefined } : c))
    );

  const add = () => {
    if (!adding) return;
    commit([...ordered, { groupId: adding, position: ordered.length, isRequired: false, allowedOptions: [] }]);
    setOpen(adding);
    setAdding('');
  };

  const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div className="flex flex-col gap-2">
      {ordered.length === 0 && <p className="text-sm text-[#888]">No steps yet — add the first one below.</p>}

      {ordered.map((config, index) => {
        const group = groupById.get(config.groupId);
        const options = optionsOf(config.groupId);
        const isOpen = open === config.groupId;
        const dependsGroup = config.dependsOn ? groupById.get(config.dependsOn.groupId) : undefined;

        return (
          <div key={config.groupId} className="rounded-md border border-[#e6e0d6]">
            <div className="flex flex-wrap items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : config.groupId)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                aria-expanded={isOpen}
              >
                <ChevronDown className={cn('size-4 shrink-0 text-[#888] transition', isOpen && 'rotate-180')} />
                <span className="text-xs text-[#999]">{index + 1}.</span>
                <span className="truncate text-sm font-medium text-dark">{group?.label ?? 'Unknown step'}</span>
                {config.isRequired ? <Badge tone="ok">Required</Badge> : <Badge>Optional</Badge>}
                {config.allowedOptions.length > 0 && (
                  <Badge>
                    {config.allowedOptions.length} of {options.length} options
                  </Badge>
                )}
                {dependsGroup && <Badge tone="warn">Only after {dependsGroup.label}</Badge>}
              </button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" className="h-8 px-2" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 px-2"
                  disabled={index === ordered.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button variant="ghost" className="h-8 px-2 text-red-700" onClick={() => remove(config.groupId)} aria-label="Remove step">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            {isOpen && (
              <div className="flex flex-col gap-5 border-t border-[#eee8de] px-4 py-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.isRequired}
                    onChange={(e) => update(config.groupId, { isRequired: e.target.checked })}
                    className="accent-secondary"
                  />
                  Customer must choose before continuing
                </label>

                <Field
                  label="Options offered"
                  hint={
                    config.allowedOptions.length
                      ? 'Only the ticked options are offered for this garment.'
                      : 'Nothing ticked = every active option of this step is offered, including ones added later.'
                  }
                >
                  {() => (
                    <div className="flex flex-wrap gap-1.5">
                      {options.map((o) => {
                        const on = config.allowedOptions.includes(o._id);
                        return (
                          <button
                            key={o._id}
                            type="button"
                            onClick={() => {
                              const allowedOptions = toggleIn(config.allowedOptions, o._id);
                              /* The default must be one of the offered options. */
                              const defaultOption =
                                config.defaultOption && allowedOptions.length && !allowedOptions.includes(config.defaultOption)
                                  ? undefined
                                  : config.defaultOption;
                              update(config.groupId, { allowedOptions, defaultOption });
                            }}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs transition',
                              on ? 'border-secondary bg-secondary text-white' : 'border-[#d8d2c8] bg-white text-[#444] hover:border-secondary',
                              !o.isActive && 'opacity-50'
                            )}
                          >
                            {o.label}
                            {!o.isActive && ' (hidden)'}
                          </button>
                        );
                      })}
                      {options.length === 0 && <span className="text-xs text-[#888]">This step has no options yet.</span>}
                    </div>
                  )}
                </Field>

                <Field label="Pre-selected option">
                  {(id) => (
                    <select
                      id={id}
                      value={config.defaultOption ?? ''}
                      onChange={(e) => update(config.groupId, { defaultOption: e.target.value || undefined })}
                      className={cn(inputClass, 'max-w-xs')}
                    >
                      <option value="">None</option>
                      {options
                        .filter((o) => !config.allowedOptions.length || config.allowedOptions.includes(o._id))
                        .map((o) => (
                          <option key={o._id} value={o._id}>
                            {o.label}
                          </option>
                        ))}
                    </select>
                  )}
                </Field>

                <Field label="Only show this step when" hint="For example: show Cuff only when Sleeve is Full Sleeve.">
                  {(id) => (
                    <div className="flex flex-col gap-2">
                      <select
                        id={id}
                        value={config.dependsOn?.groupId ?? ''}
                        onChange={(e) =>
                          update(config.groupId, {
                            dependsOn: e.target.value ? { groupId: e.target.value, optionIds: [] } : undefined,
                          })
                        }
                        className={cn(inputClass, 'max-w-xs')}
                      >
                        <option value="">Always show</option>
                        {ordered
                          .filter((c) => c.groupId !== config.groupId)
                          .map((c) => (
                            <option key={c.groupId} value={c.groupId}>
                              {groupById.get(c.groupId)?.label} is…
                            </option>
                          ))}
                      </select>
                      {config.dependsOn && (
                        <div className="flex flex-wrap gap-1.5">
                          {optionsOf(config.dependsOn.groupId).map((o) => {
                            const ids = config.dependsOn?.optionIds ?? [];
                            const on = ids.includes(o._id);
                            return (
                              <button
                                key={o._id}
                                type="button"
                                onClick={() =>
                                  update(config.groupId, {
                                    dependsOn: { groupId: config.dependsOn!.groupId, optionIds: toggleIn(ids, o._id) },
                                  })
                                }
                                className={cn(
                                  'rounded-full border px-2.5 py-1 text-xs transition',
                                  on ? 'border-amber-600 bg-amber-600 text-white' : 'border-[#d8d2c8] bg-white text-[#444] hover:border-amber-600'
                                )}
                              >
                                {o.label}
                              </button>
                            );
                          })}
                          {config.dependsOn.optionIds.length === 0 && (
                            <span className="text-xs text-red-700">Tick at least one, or choose “Always show”.</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Field>
              </div>
            )}
          </div>
        );
      })}

      {available.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={adding} onChange={(e) => setAdding(e.target.value)} className={cn(inputClass, 'max-w-xs')}>
            <option value="">Add a step…</option>
            {available.map((g) => (
              <option key={g._id} value={g._id}>
                {g.label}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={add} disabled={!adding}>
            <Plus className="size-4" /> Add step
          </Button>
        </div>
      )}
    </div>
  );
}
