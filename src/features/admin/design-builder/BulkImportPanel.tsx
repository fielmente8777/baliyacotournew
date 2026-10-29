'use client';

import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Upload } from 'lucide-react';

import type { CatalogImportReport, CatalogImportRow } from '@/@types/admin';
import { adminErrorMessage, useDownloadCatalogSheetMutation, useImportCatalogSheetMutation } from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { Badge, Button, Card, NoticeBar, type Notice } from '../ui';

/**
 * Bulk add or update garments and options from the client's spreadsheet.
 * Download → client fills it in → upload shows a preview of every change →
 * Import saves it. The backend never applies a sheet with errors and never
 * deletes (baliye-node services/catalogImport.ts).
 */
export default function BulkImportPanel() {
  const [download, { isLoading: downloading, originalArgs }] = useDownloadCatalogSheetMutation();
  const [importSheet, { isLoading: importing }] = useImportCatalogSheetMutation();
  const [files, setFiles] = useState<File[]>([]);
  const [report, setReport] = useState<CatalogImportReport | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const input = useRef<HTMLInputElement>(null);

  const save = async (filled: boolean) => {
    setNotice(null);
    try {
      const url = await download({ filled }).unwrap();
      const a = document.createElement('a');
      a.href = url;
      a.download = filled ? 'design-builder-current.xlsx' : 'design-builder-template.xlsx';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not download the sheet') });
    }
  };

  const run = async (chosen: File[], apply: boolean) => {
    setNotice(null);
    try {
      const result = await importSheet({ files: chosen, apply }).unwrap();
      setReport(result);
      if (result.applied) setNotice({ tone: 'ok', text: 'Imported. The Garments and Steps tabs now show the changes.' });
    } catch (err) {
      setReport(null);
      setNotice({ tone: 'error', text: adminErrorMessage(err, 'Could not read the sheet') });
    }
  };

  const choose = (list: FileList | null) => {
    const chosen = Array.from(list ?? []).slice(0, 2);
    if (input.current) input.current.value = '';
    if (!chosen.length) return;
    setFiles(chosen);
    run(chosen, false);
  };

  const rows = report ? [...report.garments, ...report.options] : [];
  const count = (action: CatalogImportRow['action']) => rows.filter((r) => r.action === action).length;
  const pending =
    count('create') + count('update') + (report?.rules.length ?? 0) + (report?.newSteps.length ?? 0) + (report?.newMeasurements.length ?? 0);

  return (
    <div className="flex flex-col gap-5">
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />

      <Card title="1. Get the sheet">
        <p className="mb-4 max-w-2xl text-sm text-[#666]">
          An Excel file with a <em>How to fill</em> tab, a Garments tab and an Options tab. Send the blank one to the
          client for new garments, or the filled one so they can correct what is already on the site.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => save(false)} loading={downloading && !originalArgs?.filled}>
            <Download className="size-4" /> Blank template
          </Button>
          <Button variant="outline" onClick={() => save(true)} loading={downloading && originalArgs?.filled}>
            <FileSpreadsheet className="size-4" /> Current catalogue
          </Button>
        </div>
      </Card>

      <Card title="2. Upload the filled sheet">
        <p className="mb-4 max-w-2xl text-sm text-[#666]">
          The .xlsx file, or the Garments and Options sheets saved as two .csv files. Nothing is saved yet: you will see
          every change first. Rows are matched by name; nothing is deleted.
        </p>
        <input
          ref={input}
          type="file"
          accept=".xlsx,.csv"
          multiple
          className="hidden"
          onChange={(e) => choose(e.target.files)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => input.current?.click()} loading={importing && !report}>
            <Upload className="size-4" /> Choose file
          </Button>
          {files.length > 0 && <span className="text-sm text-[#666]">{files.map((f) => f.name).join(', ')}</span>}
        </div>
      </Card>

      {report && (
        <Card
          title={report.applied ? 'Imported' : '3. Check and import'}
          actions={
            !report.applied && (
              <Button onClick={() => run(files, true)} loading={importing} disabled={report.errorCount > 0 || !pending}>
                Import {pending} {pending === 1 ? 'change' : 'changes'}
              </Button>
            )
          }
        >
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            <Badge tone="ok">{count('create')} new</Badge>
            <Badge tone="neutral">{count('update')} updated</Badge>
            <Badge tone="off">{count('unchanged')} unchanged</Badge>
            {report.errorCount > 0 && <Badge tone="warn">{report.errorCount} errors</Badge>}
          </div>

          {report.errorCount > 0 && (
            <NoticeBar
              notice={{
                tone: 'error',
                text: 'Fix the rows marked below in the sheet and upload it again. Nothing is imported while any row has an error.',
              }}
            />
          )}

          <div className="mt-4 flex flex-col gap-5">
            {(report.newSteps.length > 0 || report.newMeasurements.length > 0) && (
              <ul className="flex flex-col gap-1 text-sm text-dark">
                {report.newSteps.length > 0 && (
                  <li>
                    <span className="font-medium">New steps:</span> {report.newSteps.join(', ')}
                  </li>
                )}
                {report.newMeasurements.length > 0 && (
                  <li>
                    <span className="font-medium">New measurement fields:</span> {report.newMeasurements.join(', ')}{' '}
                    <span className="text-[#888]">(check for typos: these are added as written)</span>
                  </li>
                )}
              </ul>
            )}

            {report.warnings.length > 0 && (
              <ul className="flex flex-col gap-1 rounded-md bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
                {report.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}

            <RowTable title="Garments sheet" rows={report.garments} />
            <RowTable title="Options sheet" rows={report.options} />

            {report.rules.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-dark">Steps and rules per garment</h3>
                <ul className="flex flex-col gap-2 text-sm">
                  {report.rules.map((r) => (
                    <li key={r.garment}>
                      <span className="font-medium text-dark">{r.garment}</span>
                      <span className="text-[#666]">: {r.changes.join(' · ')}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.applied && (
              <p className="text-sm text-[#666]">
                New garments start hidden unless the sheet said yes. Add their pictures under Missing pictures.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

const ACTION_TONE = { create: 'ok', update: 'neutral', unchanged: 'off', error: 'warn' } as const;
const ACTION_LABEL = { create: 'New', update: 'Update', unchanged: 'No change', error: 'Error' };

/** Rows with something to say first; unchanged rows are folded away. */
function RowTable({ title, rows }: { title: string; rows: CatalogImportRow[] }) {
  const [showAll, setShowAll] = useState(false);
  if (!rows.length) return null;

  const order = { error: 0, create: 1, update: 2, unchanged: 3 };
  const sorted = [...rows].sort((a, b) => order[a.action] - order[b.action] || a.row - b.row);
  const unchanged = rows.filter((r) => r.action === 'unchanged').length;
  const shown = showAll ? sorted : sorted.filter((r) => r.action !== 'unchanged');

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-dark">{title}</h3>
      <div className="overflow-x-auto rounded-md border border-[#eee8de]">
        <table className="w-full min-w-140 text-left text-sm">
          <thead className="bg-[#faf8f4] text-xs text-[#777]">
            <tr>
              <th className="w-14 px-3 py-2 font-medium">Row</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="w-24 px-3 py-2 font-medium">Result</th>
              <th className="px-3 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={`${r.row}-${r.name}`} className={cn('border-t border-[#f1ece4] align-top', r.action === 'error' && 'bg-red-50/60')}>
                <td className="px-3 py-2 text-[#888]">{r.row}</td>
                <td className="px-3 py-2 text-dark">{r.name || '—'}</td>
                <td className="px-3 py-2">
                  <Badge tone={ACTION_TONE[r.action]}>{ACTION_LABEL[r.action]}</Badge>
                </td>
                <td className="px-3 py-2">
                  {r.errors.length > 0 ? (
                    <ul className="flex flex-col gap-0.5 text-red-800">
                      {r.errors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[#666]">{r.changes.join(' · ')}</span>
                  )}
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-[#888]">
                  Every row matches the site already.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {unchanged > 0 && (
        <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-1.5 text-xs text-[#777] underline">
          {showAll ? 'Hide' : 'Show'} {unchanged} unchanged {unchanged === 1 ? 'row' : 'rows'}
        </button>
      )}
    </section>
  );
}
