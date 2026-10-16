/**
 * Line-art stand-ins for design-builder option cards that have no photo yet.
 *
 * Drawn per option, not per step — a V-neck looks like a V-neck, a sharara
 * like a sharara — so the builder is usable before every image is uploaded
 * to Shopify. `tint` is the colour the customer picked in the Colour step,
 * so the drawings follow their choice. A real image always wins over these.
 *
 * Unknown values fall back to a sensible drawing for their step, and
 * unknown steps to the step icon, so a new option added in Shopify never
 * renders an empty card.
 */

import { useId, type ReactNode } from 'react';

import { StepIcon } from '@/components/icons/customizationIcons';

const MAROON = '#A52C45';
const GOLD = '#C9A24A';
const BG = '#F1EDE6';
const DEFAULT_TINT = '#F6E7EA';

interface Props {
  groupCode: string;
  value: string;
  tint?: string;
  className?: string;
}

/** Dark tints need a light outline to stay readable. */
function isDark(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}

/* ---- Shared garment pieces ----------------------------------------------- */

/** Kurta front, shoulders to hip — the canvas for neck and embroidery. */
const BODICE = 'M30 36 L56 14 H104 L130 36 L120 52 L112 46 V116 H48 V46 L40 52 Z';

/* ---- Neck ------------------------------------------------------------- */

const NECKLINES: Record<string, string> = {
  'round-neck': 'M62 14 Q80 46 98 14 Z',
  'v-neck': 'M62 14 L80 54 L98 14 Z',
  'deep-v-neck': 'M62 14 L80 70 L98 14 Z',
  'boat-neck': 'M50 14 Q80 32 110 14 Z',
  'square-neck': 'M63 14 V42 H97 V14 Z',
  'sweetheart-neck': 'M62 14 V34 Q62 48 72 48 Q80 48 80 40 Q80 48 88 48 Q98 48 98 34 V14 Z',
  'keyhole-neck': 'M64 14 Q80 32 96 14 Z M80 30 Q74 42 80 48 Q86 42 80 30 Z',
  'collar-neck': 'M64 14 L80 44 L96 14 Z',
  'high-neck': 'M70 14 Q80 22 90 14 Z',
  'mandarin-neck': 'M70 14 Q80 20 90 14 Z',
};

function Neck({ value, fill, stroke }: { value: string; fill: string; stroke: string }) {
  const cut = NECKLINES[value] ?? NECKLINES['round-neck'];
  return (
    <>
      <path d={BODICE} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d={cut} fill={BG} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      {value === 'collar-neck' && (
        <path d="M64 14 L56 30 L74 30 Z M96 14 L104 30 L86 30 Z" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      )}
      {value === 'mandarin-neck' && (
        <>
          <rect x="68" y="6" width="24" height="9" rx="2" fill={fill} stroke={stroke} strokeWidth="2" />
          <path d="M80 15 V36" stroke={stroke} strokeWidth="1.6" />
        </>
      )}
      {value === 'high-neck' && <rect x="66" y="4" width="28" height="11" rx="3" fill={fill} stroke={stroke} strokeWidth="2" />}
    </>
  );
}

/* ---- Sleeve ----------------------------------------------------------- */

const TORSO = 'M56 14 H104 L112 22 V112 H48 V22 Z';

/** Left sleeve; the right one is the mirror image. */
const SLEEVES: Record<string, string | null> = {
  sleeveless: null,
  'short-sleeve': 'M48 22 L34 38 L44 48 L48 44 Z',
  'half-sleeve': 'M48 22 L26 54 L38 62 L48 46 Z',
  'three-quarter-sleeve': 'M48 22 L18 74 L31 80 L48 46 Z',
  'full-sleeve': 'M48 22 L12 94 L25 98 L48 46 Z',
  'bell-sleeve': 'M48 22 L24 70 L6 96 Q18 104 32 98 L36 72 L48 46 Z',
  'puff-sleeve': 'M48 22 Q24 18 28 42 Q34 54 46 48 Z',
  'flared-sleeve': 'M48 22 L22 66 L12 84 Q22 90 34 84 L36 66 L48 46 Z',
};

function Sleeve({ value, fill, stroke }: { value: string; fill: string; stroke: string }) {
  const sleeve = value in SLEEVES ? SLEEVES[value] : SLEEVES['full-sleeve'];
  return (
    <>
      {sleeve && (
        <>
          <path d={sleeve} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          <g transform="translate(160 0) scale(-1 1)">
            <path d={sleeve} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
          </g>
        </>
      )}
      <path d={TORSO} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d="M66 14 Q80 34 94 14" fill={BG} stroke={stroke} strokeWidth="2" />
    </>
  );
}

/* ---- Length ----------------------------------------------------------- */

const HEMS: Record<string, number> = {
  short: 54,
  'knee-length': 72,
  'calf-length': 90,
  'ankle-length': 104,
  'floor-length': 114,
};

function Length({ value, fill, stroke }: { value: string; fill: string; stroke: string }) {
  const hem = HEMS[value] ?? 72;
  const flare = (hem - 24) * 0.28;
  return (
    <>
      {/* Legs for scale */}
      <path d="M70 40 V114 M90 40 V114" stroke={MAROON} strokeWidth="1.5" opacity="0.3" />
      <path
        d={`M68 6 H92 L100 14 L${100 + flare} ${hem} H${60 - flare} L60 14 Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M72 6 Q80 18 88 6" fill={BG} stroke={stroke} strokeWidth="1.8" />
      <path d={`M${40 - flare} ${hem} H${120 + flare}`} stroke={MAROON} strokeWidth="1.4" strokeDasharray="3 4" opacity="0.6" />
    </>
  );
}

/* ---- Lower ------------------------------------------------------------ */

const LOWERS: Record<string, string> = {
  churidar: 'M62 10 H98 L92 112 H83 L80 40 L77 112 H68 Z',
  salwar: 'M56 10 H104 L100 70 L90 112 H82 L80 50 L78 112 H70 L60 70 Z',
  patiala: 'M50 10 H110 L114 60 Q108 96 92 110 H84 L80 56 L76 110 H68 Q52 96 46 60 Z',
  palazzo: 'M56 10 H104 L114 112 H84 L80 44 L76 112 H46 Z',
  sharara: 'M60 10 H100 L98 62 L118 112 H84 L80 62 L76 112 H42 L62 62 Z',
  gharara: 'M60 10 H100 L96 54 L120 112 H84 L80 54 L76 112 H40 L64 54 Z',
  'straight-pant': 'M60 10 H100 L98 112 H84 L80 40 L76 112 H62 Z',
  trousers: 'M60 10 H100 L98 112 H84 L80 40 L76 112 H62 Z',
  skirt: 'M62 10 H98 L120 112 H40 Z',
  dhoti: 'M54 10 H106 L100 80 L92 112 H84 L80 60 L76 112 H68 L60 80 Z',
};

function Lower({ value, fill, stroke }: { value: string; fill: string; stroke: string }) {
  const shape = LOWERS[value] ?? LOWERS['straight-pant'];
  return (
    <>
      <path d={shape} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d="M58 16 H102" stroke={stroke} strokeWidth="1.6" />
      {value === 'patiala' && <path d="M60 24 Q58 60 64 90 M70 24 V70 M90 24 V70 M100 24 Q102 60 96 90" stroke={stroke} strokeWidth="1.3" opacity="0.5" />}
      {value === 'churidar' && <path d="M68 96 Q72 98 76 96 M68 102 Q72 104 76 102 M84 96 Q88 98 92 96 M84 102 Q88 104 92 102" stroke={stroke} strokeWidth="1.3" opacity="0.6" />}
      {(value === 'sharara' || value === 'gharara') && (
        <path d={value === 'sharara' ? 'M62 62 H76 M84 62 H98' : 'M64 54 H76 M84 54 H96'} stroke={GOLD} strokeWidth="3" />
      )}
    </>
  );
}

/* ---- Dupatta ---------------------------------------------------------- */

const DRAPE = 'M30 18 Q80 6 130 18 L120 112 Q80 100 40 112 Z';

function Dupatta({ value, fill, stroke, patternId }: { value: string; fill: string; stroke: string; patternId: string }) {
  if (value === 'no-dupatta') {
    return (
      <>
        <path d={DRAPE} stroke={MAROON} strokeWidth="2" strokeDasharray="5 5" opacity="0.45" />
        <path d="M44 104 L116 22" stroke={MAROON} strokeWidth="2.5" opacity="0.6" />
      </>
    );
  }

  /* Gold against a dark outfit (reds included), maroon against a light one. */
  const body = value === 'contrast-dupatta' ? (isDark(fill) ? GOLD : MAROON) : fill;
  return (
    <>
      <defs>
        <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2" fill={stroke} opacity="0.45" />
        </pattern>
      </defs>
      <path d={DRAPE} fill={body} stroke={stroke} strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
      {value === 'printed-dupatta' && <path d={DRAPE} fill={`url(#${patternId})`} />}
      {value === 'embroidered-dupatta' && (
        <path d="M42 104 Q80 93 118 104" stroke={GOLD} strokeWidth="4" strokeDasharray="2 3" />
      )}
      <path d="M58 14 Q62 60 52 108 M102 14 Q98 60 108 108" stroke={stroke} strokeWidth="1.2" opacity="0.35" />
    </>
  );
}

/* ---- Fabric ----------------------------------------------------------- */

function Fabric({ value, fill, stroke, patternId }: { value: string; fill: string; stroke: string; patternId: string }) {
  const sheer = ['chiffon', 'organza', 'net', 'georgette'].includes(value);
  const swatch = 'M26 16 H134 V96 L118 104 H26 Z';

  const pattern: Record<string, ReactNode> = {
    cotton: <path d="M0 4 H8 M4 0 V8" stroke={stroke} strokeWidth="0.6" opacity="0.35" />,
    'cotton-silk': <path d="M0 8 L8 0" stroke="#fff" strokeWidth="1.2" opacity="0.5" />,
    rayon: <path d="M0 4 Q2 2 4 4 T8 4" stroke={stroke} strokeWidth="0.7" opacity="0.4" />,
    chanderi: <circle cx="4" cy="4" r="1.2" fill={GOLD} opacity="0.8" />,
    georgette: <path d="M0 6 L2 2 L4 6 L6 2 L8 6" stroke={stroke} strokeWidth="0.6" opacity="0.35" />,
    crepe: <path d="M0 2 Q2 4 4 2 T8 2 M0 6 Q2 8 4 6 T8 6" stroke={stroke} strokeWidth="0.6" opacity="0.4" />,
    net: <path d="M0 0 L8 8 M8 0 L0 8" stroke={stroke} strokeWidth="0.7" opacity="0.5" />,
    organza: <path d="M0 8 L8 0" stroke="#fff" strokeWidth="1.6" opacity="0.6" />,
    chiffon: <path d="M0 4 Q4 2 8 4" stroke="#fff" strokeWidth="1" opacity="0.6" />,
    velvet: <circle cx="4" cy="4" r="3" fill="#000" opacity="0.08" />,
    'premium-silk': <path d="M0 8 L8 0" stroke="#fff" strokeWidth="2" opacity="0.45" />,
  };

  return (
    <>
      <defs>
        <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse">
          {pattern[value] ?? pattern.cotton}
        </pattern>
      </defs>
      {/* A second layer peeking out shows the drape. */}
      <path d="M36 24 H142 V104 H36 Z" fill={fill} opacity={sheer ? 0.35 : 0.55} stroke={stroke} strokeWidth="1.2" />
      <path d={swatch} fill={fill} opacity={sheer ? 0.6 : 1} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d={swatch} fill={`url(#${patternId})`} />
      <path d="M134 96 L118 104 V96 Z" fill={BG} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      {value === 'premium-silk' && <path d="M26 90 H118" stroke={GOLD} strokeWidth="3" />}
    </>
  );
}

/* ---- Embroidery ------------------------------------------------------- */

/** Points around the yoke, where motifs sit. */
const YOKE = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI * (i / 8);
  return { x: 80 - Math.cos(a) * 30, y: 16 + Math.sin(a) * 34 };
});

function Embroidery({ value, fill, stroke }: { value: string; fill: string; stroke: string }) {
  const motif = (x: number, y: number, i: number): ReactNode => {
    switch (value) {
      case 'no-embroidery':
        return null;
      case 'zari-work':
      case 'gota-patti':
        return <rect key={i} x={x - 3} y={y - 3} width="6" height="6" transform={`rotate(45 ${x} ${y})`} fill={GOLD} />;
      case 'zardozi-work':
      case 'heavy-embroidery':
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill={GOLD} />
            <circle cx={x} cy={y + 9} r="2" fill={GOLD} opacity="0.8" />
          </g>
        );
      case 'sequin-work':
        return <circle key={i} cx={x} cy={y} r="2.6" fill="#fff" stroke={GOLD} strokeWidth="1.2" />;
      case 'mirror-work':
        return <circle key={i} cx={x} cy={y} r="3.6" fill="#E8EEF2" stroke={stroke} strokeWidth="1.2" />;
      case 'chikankari':
        return <path key={i} d={`M${x - 3} ${y} Q${x} ${y - 4} ${x + 3} ${y} Q${x} ${y + 4} ${x - 3} ${y}`} fill="#fff" stroke={stroke} strokeWidth="0.6" />;
      case 'aari-work':
        return <circle key={i} cx={x} cy={y} r="3" stroke={stroke} strokeWidth="1.4" />;
      case 'machine-embroidery':
        return <rect key={i} x={x - 2.5} y={y - 2.5} width="5" height="5" fill={stroke} opacity="0.7" />;
      default: /* thread-work and anything new */
        return <path key={i} d={`M${x - 4} ${y} Q${x} ${y - 5} ${x + 4} ${y}`} stroke={stroke} strokeWidth="1.6" />;
    }
  };

  return (
    <>
      <path d={BODICE} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <path d="M62 14 Q80 46 98 14 Z" fill={BG} stroke={stroke} strokeWidth="2" />
      {value === 'gota-patti' && <path d="M48 110 H112" stroke={GOLD} strokeWidth="4" />}
      {(value === 'heavy-embroidery' || value === 'zardozi-work') && (
        <path d="M48 104 H112" stroke={GOLD} strokeWidth="3" strokeDasharray="4 3" />
      )}
      {YOKE.map((p, i) => motif(p.x, p.y, i))}
    </>
  );
}

/* ---- Entry point ------------------------------------------------------ */

export function OptionIllustration({ groupCode, value, tint, className = 'h-full w-full' }: Props) {
  const id = useId().replace(/:/g, '');
  const fill = tint || DEFAULT_TINT;
  const stroke = isDark(fill) ? '#F3E9DC' : MAROON;
  const shared = { value, fill, stroke };

  switch (groupCode) {
    case 'neck':
      return <Frame className={className}><Neck {...shared} /></Frame>;
    case 'sleeve':
      return <Frame className={className}><Sleeve {...shared} /></Frame>;
    case 'length':
      return <Frame className={className}><Length {...shared} /></Frame>;
    case 'lower':
      return <Frame className={className}><Lower {...shared} /></Frame>;
    case 'dupatta':
      return <Frame className={className}><Dupatta {...shared} patternId={`dp${id}`} /></Frame>;
    case 'fabric':
      return <Frame className={className}><Fabric {...shared} patternId={`fb${id}`} /></Frame>;
    case 'embroidery':
      return <Frame className={className}><Embroidery {...shared} /></Frame>;
    default:
      return (
        <div className={`flex items-center justify-center ${className}`} style={{ color: MAROON }}>
          <StepIcon kind="option" code={groupCode} size={48} />
        </div>
      );
  }
}
