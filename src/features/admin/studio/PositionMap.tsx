'use client';

/**
 * A front view of a kurta with every embroidery position drawn on it.
 *
 * Used three ways: as the example on each photo slot ("this photo should show
 * the left sleeve"), as the legend that names the positions, and beside the
 * pieces to show where each one will be placed. Left and right are as seen in
 * the photo, which is also how the placement engine reads them.
 */

import type { EmbroideryRegion, EmbroiderySide } from '@/@types/embroidery';
import { SIDED_REGIONS } from '@/@types/embroidery';
import { cn } from '@/lib/format';

/** A drawable zone: a region, plus a side for the paired ones. */
export type ZoneId =
  | Exclude<EmbroideryRegion, 'shoulder' | 'chest' | 'sleeve_body' | 'sleeve_cuff'>
  | `${'shoulder' | 'chest' | 'sleeve_body' | 'sleeve_cuff'}-${'left' | 'right'}`
  | 'chest-center'
  | 'garment';

/** The zones a piece covers, given its position and side. */
export function zonesFor(region: EmbroideryRegion, side: EmbroiderySide): ZoneId[] {
  if (!SIDED_REGIONS.includes(region)) return [region as ZoneId];
  if (side === 'left') return [`${region}-left` as ZoneId];
  if (side === 'right') return [`${region}-right` as ZoneId];
  if (side === 'center' && region === 'chest') return ['chest-center'];
  return [`${region}-left` as ZoneId, `${region}-right` as ZoneId];
}

const BODY =
  'M84 30 Q100 44 116 30 L142 38 L178 112 L162 122 L140 82 L146 244 L54 244 L60 82 L38 122 L22 112 L58 38 Z';

/* Each zone's shape. Kept simple — it is a guide, not a pattern. */
const ZONES: { id: ZoneId; el: 'path' | 'rect' | 'ellipse'; props: Record<string, number | string> }[] = [
  { id: 'yoke', el: 'path', props: { d: 'M78 40 Q100 62 122 40 L126 66 Q100 76 74 66 Z' } },
  { id: 'neckline', el: 'path', props: { d: 'M82 31 Q100 50 118 31 L121 37 Q100 59 79 37 Z' } },
  { id: 'placket', el: 'rect', props: { x: 97, y: 52, width: 6, height: 52, rx: 2 } },
  { id: 'shoulder-left', el: 'ellipse', props: { cx: 66, cy: 42, rx: 9, ry: 5 } },
  { id: 'shoulder-right', el: 'ellipse', props: { cx: 134, cy: 42, rx: 9, ry: 5 } },
  { id: 'chest-left', el: 'ellipse', props: { cx: 80, cy: 92, rx: 10, ry: 11 } },
  { id: 'chest-right', el: 'ellipse', props: { cx: 120, cy: 92, rx: 10, ry: 11 } },
  { id: 'chest-center', el: 'ellipse', props: { cx: 100, cy: 92, rx: 12, ry: 11 } },
  { id: 'sleeve_body-left', el: 'ellipse', props: { cx: 47, cy: 74, rx: 9, ry: 12, transform: 'rotate(28 47 74)' } },
  { id: 'sleeve_body-right', el: 'ellipse', props: { cx: 153, cy: 74, rx: 9, ry: 12, transform: 'rotate(-28 153 74)' } },
  { id: 'sleeve_cuff-left', el: 'rect', props: { x: 18, y: 104, width: 24, height: 7, rx: 2, transform: 'rotate(28 30 108)' } },
  { id: 'sleeve_cuff-right', el: 'rect', props: { x: 158, y: 104, width: 24, height: 7, rx: 2, transform: 'rotate(-28 170 108)' } },
  { id: 'waist', el: 'rect', props: { x: 61, y: 124, width: 78, height: 8, rx: 2 } },
  { id: 'hem_border', el: 'rect', props: { x: 55, y: 226, width: 90, height: 10, rx: 2 } },
  { id: 'lower_hem', el: 'rect', props: { x: 54, y: 238, width: 92, height: 5, rx: 1.5 } },
];

const BUTIS = [
  [76, 152], [100, 146], [124, 154], [86, 174], [114, 172], [72, 196], [100, 192], [128, 198], [88, 212], [114, 212],
];

export default function PositionMap({
  highlight = [],
  muted = false,
  showLabels = false,
  back = false,
  className,
}: {
  highlight?: ZoneId[];
  /** Draw every zone faintly, so the whole map reads as a legend. */
  muted?: boolean;
  /** Small position names next to the zones. */
  showLabels?: boolean;
  /** Draw the garment as a back view (for the "back" photo slot). */
  back?: boolean;
  className?: string;
}) {
  const on = (id: ZoneId) => highlight.includes(id);
  const garmentOn = on('garment');

  const fill = (id: ZoneId) =>
    on(id) ? 'fill-secondary/85 stroke-secondary' : muted ? 'fill-secondary/12 stroke-secondary/30' : 'fill-transparent stroke-transparent';

  return (
    <svg viewBox="0 0 200 256" className={cn('h-auto w-full', className)} aria-hidden>
      <path
        d={back ? BODY.replace('Q100 44 116 30', 'Q100 34 116 30') : BODY}
        className={cn(
          'stroke-[1.5] transition-colors',
          garmentOn ? 'fill-secondary/15 stroke-secondary' : 'fill-[#f7f2ea] stroke-[#cbbfae]'
        )}
        strokeLinejoin="round"
      />

      {back ? (
        <text x="100" y="140" textAnchor="middle" className="fill-[#a89a86] text-[16px] font-semibold tracking-widest">
          BACK
        </text>
      ) : (
        <>
          {ZONES.map(({ id, el: El, props }) => (
            <El key={id} {...props} className={cn('stroke-1 transition-colors duration-200', fill(id))} />
          ))}

          {BUTIS.map(([cx, cy]) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={2.6}
              className={cn('transition-colors', on('buti') ? 'fill-secondary' : muted ? 'fill-secondary/25' : 'fill-transparent')}
            />
          ))}
        </>
      )}

      {showLabels && !back && (
        <g className="fill-[#6f6253] text-[7px]">
          <text x="100" y="20" textAnchor="middle">Neckline · Yoke</text>
          <text x="2" y="40">Shoulder</text>
          <text x="2" y="72">Sleeve</text>
          <text x="2" y="132">Cuff</text>
          <text x="100" y="114" textAnchor="middle">Chest</text>
          <text x="100" y="142" textAnchor="middle">Waist</text>
          <text x="100" y="185" textAnchor="middle" className="fill-[#a0907c]">Buti</text>
          <text x="100" y="254" textAnchor="middle">Hem border (daaman)</text>
        </g>
      )}
    </svg>
  );
}
