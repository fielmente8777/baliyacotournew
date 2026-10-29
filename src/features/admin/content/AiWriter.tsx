'use client';

/**
 * "Write with AI" for one content field. Opens a small panel: pick what to do
 * (write, improve, shorter, longer, fix spelling) or type an instruction, read
 * the suggestion, then Use it or Discard. Nothing changes until "Use this".
 */

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

import { adminErrorMessage, useWriteContentMutation } from '@/store/api/adminApi';
import { cn } from '@/lib/format';
import { Button, inputClass } from '../ui';

type Action = 'write' | 'improve' | 'shorter' | 'longer' | 'fix' | 'custom';

const ACTIONS: { id: Action; label: string; needsText?: boolean }[] = [
  { id: 'write', label: 'Write it for me' },
  { id: 'improve', label: 'Improve', needsText: true },
  { id: 'shorter', label: 'Shorter', needsText: true },
  { id: 'longer', label: 'Longer', needsText: true },
  { id: 'fix', label: 'Fix spelling & grammar', needsText: true },
];

export default function AiWriter({
  value,
  onApply,
  field,
  format = 'plain',
  className,
}: {
  value: string;
  onApply: (text: string) => void;
  /** What this field is, so the AI writes the right kind of thing. */
  field: string;
  format?: 'plain' | 'html';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [write, { isLoading }] = useWriteContentMutation();
  const panel = useRef<HTMLDivElement>(null);

  /* Close on Escape or a click outside. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => !panel.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const hasText = value.replace(/<[^>]*>/g, '').trim().length > 0;

  const run = async (action: Action) => {
    setError(null);
    setSuggestion(null);
    try {
      const { text } = await write({ action, text: value, instruction, field, format }).unwrap();
      setSuggestion(text);
    } catch (err) {
      setError(adminErrorMessage(err, 'The AI writer is not available right now.'));
    }
  };

  return (
    <div ref={panel} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-7 items-center gap-1 rounded-full border border-secondary/30 bg-secondary/5 px-2.5 text-[11px] font-semibold text-secondary transition hover:bg-secondary/10"
      >
        <Sparkles className="size-3.5" aria-hidden /> Write with AI
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Write with AI"
          className="absolute right-0 top-full z-50 mt-2 w-[min(26rem,calc(100vw-2rem))] animate-pop-in rounded-lg border border-[#e6e0d6] bg-white p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-dark">
              <Sparkles className="size-4 text-secondary" aria-hidden /> Write with AI
            </p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-[#888] hover:text-dark">
              <X className="size-4" />
            </button>
          </div>

          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={2}
            placeholder={
              hasText
                ? 'Optional: tell it what you want, e.g. "mention it is made to measure"'
                : 'What should it say? e.g. "a welcome line for festive season"'
            }
            className={cn(inputClass, 'resize-none text-[13px]')}
          />

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={isLoading || (a.needsText && !hasText)}
                onClick={() => run(a.id)}
                className="rounded-full border border-[#d8d2c8] px-3 py-1.5 text-xs font-medium text-dark transition hover:border-secondary hover:text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {a.label}
              </button>
            ))}
            {instruction.trim() && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => run('custom')}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Do what I typed
              </button>
            )}
          </div>

          {isLoading && <p className="mt-3 animate-pulse text-xs text-[#888]">Writing…</p>}
          {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

          {suggestion && (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#888]">Suggestion</p>
              {format === 'html' ? (
                <div
                  className="terms-content max-h-60 overflow-y-auto rounded-md bg-[#faf8f4] p-3 text-sm [&_h1]:text-xl [&_h2]:mt-3 [&_h2]:text-lg [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: suggestion }}
                />
              ) : (
                <p className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-md bg-[#faf8f4] p-3 text-sm text-dark">{suggestion}</p>
              )}
              <div className="mt-2.5 flex gap-2">
                <Button
                  className="h-8 text-xs"
                  onClick={() => {
                    onApply(suggestion);
                    setSuggestion(null);
                    setOpen(false);
                  }}
                >
                  Use this
                </Button>
                <Button variant="ghost" className="h-8 text-xs" onClick={() => setSuggestion(null)}>
                  Discard
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-[#999]">Nothing is saved until you press Save on the page.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
