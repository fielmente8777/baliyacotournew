/**
 * Icons for the design builder's steps, one per option-group code.
 *
 * Garment parts (neckline, sleeve, cuff, lower, dupatta, length) have no
 * equivalent in an icon library, so they're drawn here on the same 24px grid
 * and 1.7 stroke as lucide, and sit next to lucide icons without looking
 * out of place. Any group code without an icon falls back to a kurta outline.
 */

import type { SVGProps } from 'react';
import { ClipboardCheck, Palette, PenLine, Ruler, Tag, type LucideIcon } from 'lucide-react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Bolt of fabric: a roll with cloth unrolling from it. */
export const FabricIcon = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="6.5" cy="7" rx="3.5" ry="3.5" />
    <circle cx="6.5" cy="7" r="1" />
    <path d="M6.5 3.5H18l2 3.5-2 3.5H6.5" />
    <path d="M10 10.5v8.5l2.5-1.5L15 19l2.5-1.5L20 19v-8.5" />
  </Svg>
);

/** Five-petal floral motif with a needle — embroidery. */
export const EmbroideryIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="13" r="1.6" />
    <path d="M10 11.4c-1.6-2.4-.8-4.4 0-5 .8.6 1.6 2.6 0 5Z" />
    <path d="M11.5 12.4c2.4-1.3 4.3-.3 4.7.6-.8.7-2.9 1.1-4.7-.6Z" />
    <path d="M11 14.4c1.7 2.1 1.3 4.2.6 4.9-.9-.5-2-2.3-.6-4.9Z" />
    <path d="M9 14.4c-1.7 2.1-1.3 4.2-.6 4.9.9-.5 2-2.3.6-4.9Z" />
    <path d="M8.5 12.4c-2.4-1.3-4.3-.3-4.7.6.8.7 2.9 1.1 4.7-.6Z" />
    <path d="M15.5 8.5 21 3" />
    <path d="M20 3.2c.4-.4 1-.3 1.1.1" />
  </Svg>
);

/** Shoulders with a scooped neckline. */
export const NeckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 9.5C5 7.5 7.5 6 9 5.5c.3 2.8 1.4 4.8 3 4.8s2.7-2 3-4.8c1.5.5 4 2 6.5 4" />
    <path d="M5 8v12.5h14V8" />
    <path d="M9 5.5c.6 5 1.6 7 3 7s2.4-2 3-7" strokeDasharray="1.5 2" />
  </Svg>
);

/** Kurta body with one long sleeve drawn out. */
export const SleeveIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3.5c.4 1.4 1.5 2.2 3 2.2s2.6-.8 3-2.2" />
    <path d="M9 3.5 5 5.5 2 15.5l3 1 2.5-6.5v11h9V8" />
    <path d="M15 3.5l3 1.5" />
    <path d="M2.4 14l3 1" strokeWidth={2.4} />
  </Svg>
);

/** Sleeve end with a buttoned cuff band. */
export const CuffIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 3h8l1.5 11h-11L8 3Z" />
    <rect x="6" y="14" width="12" height="6" rx="1" />
    <circle cx="15" cy="17" r="0.9" />
  </Svg>
);

/** Salwar / trousers. */
export const LowerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12" />
    <path d="M6 3 4.5 21h5L12 9l2.5 12h5L18 3" />
    <path d="M6.2 6h11.6" />
  </Svg>
);

/** A dupatta draped in a loop. */
export const DupattaIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4c2 5 5 7 8 7s6-2 8-7" />
    <path d="M4 4c.5 6 1.5 11 1 16l3-1.5L10 20c.5-3 1-6 2-9" />
    <path d="M20 4c-.5 6-1.5 11-1 16l-3-1.5L14 20c-.5-3-1-6-2-9" />
  </Svg>
);

/** Garment outline with a length marker beside it. */
export const LengthIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3.5c.4 1.3 1.3 2 2.5 2s2.1-.7 2.5-2" />
    <path d="M7 3.5 4 5.5v2.5l2-.5L5 20.5h9l-1-13 2 .5V5.5l-3-2" />
    <path d="M19.5 3v18M18 4.5l1.5-1.5 1.5 1.5M18 19.5l1.5 1.5 1.5-1.5" />
  </Svg>
);

/** Kurta outline — used for any group without its own icon. */
export const GarmentIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3c.4 1.5 1.5 2.3 3 2.3S14.6 4.5 15 3" />
    <path d="M9 3 5 5l-1.5 5.5 2.5.8L7 8.5V21h10V8.5l1 2.8 2.5-.8L19 5l-4-2" />
    <path d="M12 5.3V11" />
  </Svg>
);

type AnyIcon = LucideIcon | ((p: IconProps) => React.JSX.Element);

/** Option-group code (from baliye-node) → icon. */
const GROUP_ICONS: Record<string, AnyIcon> = {
  fabric: FabricIcon,
  color: Palette,
  colour: Palette,
  embroidery: EmbroideryIcon,
  neck: NeckIcon,
  sleeve: SleeveIcon,
  sleeve_cuff: CuffIcon,
  lower: LowerIcon,
  dupatta: DupattaIcon,
  length: LengthIcon,
  size: Tag,
};

export function StepIcon({
  kind,
  code,
  size = 20,
}: {
  kind: 'option' | 'measurement' | 'instructions' | 'review';
  code?: string;
  size?: number;
}) {
  let Icon: AnyIcon;
  if (kind === 'measurement') Icon = Ruler;
  else if (kind === 'instructions') Icon = PenLine;
  else if (kind === 'review') Icon = ClipboardCheck;
  else Icon = (code && GROUP_ICONS[code]) || GarmentIcon;

  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
