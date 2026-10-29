import { CircleCheck, RotateCcw, Shirt, Sparkles } from 'lucide-react';

/**
 * "How credits work" — the same three steps in the builder popover and on the
 * Design Credits page, so the customer never reads two different stories.
 */
export default function TokenExplainer({ cost, compact = false }: { cost: number; compact?: boolean }) {
  const unit = cost === 1 ? 'credit' : 'credits';
  const steps = [
    {
      icon: Shirt,
      title: 'Style your outfit',
      text: 'Choose your fabric, neckline, sleeves and more. Browsing options is always free.',
    },
    {
      icon: Sparkles,
      title: `AI designs it · ${cost} ${unit}`,
      text: `Our AI creates a realistic look of your complete dress from your choices. Each new design uses ${cost} ${unit}.`,
    },
    {
      icon: CircleCheck,
      title: 'Seen before? Free',
      text: 'Designs already created appear instantly, at no cost — go back and forth as often as you like.',
    },
    {
      icon: RotateCcw,
      title: 'Failed? Refunded',
      text: 'If a design cannot be created, the credit comes straight back to your balance.',
    },
  ];

  return (
    <ol className={compact ? 'flex flex-col gap-3' : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
      {steps.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className={compact ? 'flex gap-3' : 'flex flex-col gap-2 rounded-xl border border-[#EAE6DF] p-4'}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A52C45]/10 text-[#A52C45]">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-medium text-[#222]">
              {!compact && <span className="text-[#A52C45]">{i + 1}. </span>}
              {title}
            </span>
            <span className="block text-xs leading-relaxed text-[#6B6B6B]">{text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
