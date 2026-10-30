'use client';

/**
 * Phones and tablets: pinned to the bottom of the builder. A live thumbnail of
 * the design (so a colour change is visible while the big preview is scrolled
 * away — tap it to jump back up), the running price, Back, and the next step
 * by name ("Next: Colour") — or Add To Cart on the last one.
 *
 * The shell adds bottom padding (pb-28 lg:pb-10) so nothing hides behind it.
 */

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { cn, formatINR } from '@/lib/format';

interface Props {
  previewUrl?: string;
  isGenerating?: boolean;
  /** Minor units. */
  total: number;
  canGoBack: boolean;
  onBack: () => void;
  action: { label: string; onClick: () => void; disabled?: boolean; isFinal?: boolean };
  /** Why the action is disabled, e.g. "Choose a Fabric to continue". */
  hint?: string;
  error?: string | null;
}

export default function MobileBuilderBar({
  previewUrl,
  isGenerating,
  total,
  canGoBack,
  onBack,
  action,
  hint,
  error,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t border-[#EFE8DD] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
      {(error || hint) && (
        <p className={cn('mb-2 text-center text-xs', error ? 'text-secondary' : 'text-dark/55')}>{error ?? hint}</p>
      )}

      <div className="mx-auto flex max-w-2xl items-center gap-3">
        {previewUrl && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="View your design"
            className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-[#F7F3ED] ring-1 ring-[#EFE8DE]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny thumbnail of an image already loaded above */}
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            {isGenerating && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Loader2 size={14} className="animate-spin text-secondary" aria-hidden />
              </span>
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p key={total} className="animate-fade-in text-lg font-semibold leading-tight text-dark">
            {formatINR(total / 100)}
          </p>
          <p className="text-[11px] text-[#8A8A8A]">Your price</p>
        </div>

        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Previous step"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#E4DED4] text-dark transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>

        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            'flex h-12 min-w-0 max-w-[55%] shrink items-center justify-center gap-1 rounded-md px-4 text-[15px] font-medium transition active:scale-[0.99]',
            action.disabled ? 'cursor-not-allowed bg-[#EDEDED] text-[#A8A8A8]' : 'bg-secondary text-white hover:bg-secondary/90'
          )}
        >
          <span className="truncate">{action.label}</span>
          {!action.isFinal && <ChevronRight size={18} className="shrink-0" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
