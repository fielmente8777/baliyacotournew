/**
 * Size chart and body-shape styling advice for Create Your Own Design.
 *
 * Edited in Admin → Size & fit guide and saved as the content entry `guides`
 * (GET /content/guides, PUT /admin/content/guides). The defaults below ship
 * with the code: until something is saved — or if the backend can't be read —
 * the builder shows them. Saved data replaces them part by part (size chart,
 * how-to tips, body shapes, fit concerns), so an empty or broken part falls
 * back to its default.
 *
 * Fit advice is keyed by group code (neck, sleeve, length, lower, fabric…)
 * and option value — the same values the option illustrations use.
 */

export const GUIDES_PAGE = 'guides' as const;

/* ---- Types ---------------------------------------------------------------- */

export interface SizeChart {
  /** Column names after "Size", e.g. Bust, Waist. */
  columns: string[];
  /** Body measurements in inches, one per column. */
  rows: { size: string; values: number[] }[];
  note: string;
}

export interface MeasureTip {
  name: string;
  tip: string;
}

export interface GroupAdvice {
  suits: string[];
  avoid: string[];
  tip: string;
}

export interface FitChoice {
  id: string;
  label: string;
  description: string;
  /** Group code → advice for that step. */
  advice: Record<string, GroupAdvice>;
}

export interface BodyShape extends FitChoice {
  /** Relative widths for the silhouette: shoulder, bust, waist, hip (10–40). */
  widths: [number, number, number, number];
}

export interface StyleGuides {
  sizeChart: SizeChart;
  measureTips: MeasureTip[];
  bodyShapes: BodyShape[];
  fitConcerns: FitChoice[];
}

/* ---- Defaults ------------------------------------------------------------- */

const a = (suits: string[], tip: string, avoid: string[] = []): GroupAdvice => ({ suits, avoid, tip });

export const DEFAULT_GUIDES: StyleGuides = {
  sizeChart: {
    columns: ['Bust', 'Waist', 'Hip', 'Shoulder'],
    rows: [
      { size: 'XS', values: [32, 26, 35, 13.5] },
      { size: 'S', values: [34, 28, 37, 14] },
      { size: 'M', values: [36, 30, 39, 14.5] },
      { size: 'L', values: [38, 32, 41, 15] },
      { size: 'XL', values: [40, 34, 43, 15.5] },
      { size: 'XXL', values: [42, 36, 45, 16] },
      { size: '3XL', values: [44, 38, 47, 16.5] },
    ],
    note: 'Between two sizes? Pick the bigger one.',
  },

  measureTips: [
    { name: 'Bust', tip: 'Around the fullest part of your chest, tape level under the arms.' },
    { name: 'Waist', tip: 'Around your natural waist — the narrowest part, just above the navel.' },
    { name: 'Hip', tip: 'Around the fullest part of your hips, feet together.' },
    { name: 'Shoulder', tip: 'Across the back, from one shoulder edge to the other.' },
  ],

  bodyShapes: [
    {
      id: 'pear',
      label: 'Pear',
      description: 'Hips wider than shoulders and bust, defined waist.',
      widths: [24, 26, 18, 36],
      advice: {
        neck: a(['boat-neck', 'square-neck', 'sweetheart-neck', 'collar-neck', 'keyhole-neck'], 'Open necklines like square or sweetheart balance fuller hips by drawing the eye up.'),
        sleeve: a(['puff-sleeve', 'bell-sleeve', 'flared-sleeve', 'three-quarter-sleeve'], 'A little volume on the sleeves balances your shoulders with your hips.'),
        length: a(['knee-length', 'calf-length', 'ankle-length'], 'An A-line kurta that falls past the hips skims them gracefully.'),
        lower: a(['palazzo', 'sharara', 'straight-pant', 'salwar'], 'Straight or flowing bottoms work best; skip extra gathers at the hip.', ['patiala', 'dhoti']),
        fabric: a(['georgette', 'crepe', 'rayon', 'chiffon'], 'Soft, flowing fabrics fall smoothly over the hips.'),
      },
    },
    {
      id: 'hourglass',
      label: 'Hourglass',
      description: 'Bust and hips balanced, with a clearly defined waist.',
      widths: [30, 32, 18, 32],
      advice: {
        neck: a(['sweetheart-neck', 'v-neck', 'deep-v-neck', 'square-neck'], 'Sweetheart and V necks follow your natural curves.'),
        sleeve: a(['three-quarter-sleeve', 'full-sleeve', 'short-sleeve', 'half-sleeve'], 'Fitted sleeves keep the silhouette clean.'),
        length: a(['knee-length', 'calf-length'], 'A fitted kurta that shows your waist is your best friend.'),
        lower: a(['churidar', 'straight-pant', 'skirt', 'palazzo'], 'Slim bottoms keep the focus on your balanced proportions.'),
        fabric: a(['crepe', 'cotton-silk', 'premium-silk', 'georgette'], 'Fabrics with some structure or drape show off your waist.'),
      },
    },
    {
      id: 'apple',
      label: 'Apple',
      description: 'Fuller midsection, with slimmer legs and arms.',
      widths: [30, 34, 34, 30],
      advice: {
        neck: a(['v-neck', 'deep-v-neck', 'sweetheart-neck', 'keyhole-neck'], 'V-shaped necklines lengthen the torso and draw the eye up.', ['high-neck']),
        sleeve: a(['three-quarter-sleeve', 'full-sleeve', 'flared-sleeve'], 'Three-quarter sleeves show off slimmer forearms.', ['puff-sleeve']),
        length: a(['calf-length', 'ankle-length', 'floor-length'], 'Long A-line or Anarkali cuts flow past the midsection.', ['short']),
        lower: a(['straight-pant', 'churidar', 'palazzo'], 'Slim bottoms show off your legs.', ['patiala', 'dhoti']),
        fabric: a(['georgette', 'crepe', 'chiffon', 'rayon'], 'Light, flowing fabrics avoid adding bulk at the middle.', ['velvet']),
      },
    },
    {
      id: 'rectangle',
      label: 'Rectangle',
      description: 'Shoulders, waist and hips about the same width.',
      widths: [28, 29, 27, 29],
      advice: {
        neck: a(['boat-neck', 'square-neck', 'sweetheart-neck', 'round-neck'], 'Wide and curved necklines add softness and shape.'),
        sleeve: a(['puff-sleeve', 'bell-sleeve', 'flared-sleeve'], 'Statement sleeves add curves to a straight frame.'),
        length: a(['knee-length', 'calf-length'], 'Angrakha, peplum or belted kurtas create a waistline.'),
        lower: a(['patiala', 'sharara', 'gharara', 'dhoti', 'salwar'], 'Volume below the waist, like a sharara or gharara, adds curves at the hips.'),
        fabric: a(['chanderi', 'organza', 'cotton-silk', 'premium-silk'], 'Crisp fabrics hold flares and gathers well.'),
      },
    },
    {
      id: 'inverted-triangle',
      label: 'Inverted triangle',
      description: 'Shoulders or bust wider than hips.',
      widths: [38, 34, 24, 24],
      advice: {
        neck: a(['v-neck', 'deep-v-neck', 'sweetheart-neck', 'keyhole-neck', 'round-neck'], 'Deep, narrow necklines break up broad shoulders.', ['boat-neck', 'square-neck']),
        sleeve: a(['three-quarter-sleeve', 'full-sleeve', 'flared-sleeve', 'bell-sleeve'], 'Keep sleeves simple at the top; skip puffs.', ['puff-sleeve']),
        length: a(['calf-length', 'ankle-length', 'floor-length'], 'Flared Anarkalis add volume below the waist.'),
        lower: a(['sharara', 'gharara', 'palazzo', 'patiala'], 'Flared bottoms balance wider shoulders.'),
      },
    },
  ],

  fitConcerns: [
    {
      id: 'heavy-bust',
      label: 'Heavy bust',
      description: 'Fuller chest',
      advice: {
        neck: a(
          ['v-neck', 'deep-v-neck', 'sweetheart-neck', 'keyhole-neck', 'square-neck'],
          'Heavy bust? V, sweetheart and square necks open up the chest. High and boat necks make it look bigger.',
          ['high-neck', 'boat-neck', 'mandarin-neck']
        ),
        sleeve: a(['three-quarter-sleeve', 'full-sleeve'], 'Skip puff sleeves — they add width at bust level.', ['puff-sleeve']),
        embroidery: a([], 'Keep heavy work at the hem and borders rather than the yoke, so the eye goes down.'),
      },
    },
    {
      id: 'broad-shoulders',
      label: 'Broad shoulders',
      description: 'Wider shoulder line',
      advice: {
        neck: a(['v-neck', 'deep-v-neck', 'round-neck', 'keyhole-neck'], 'Broad shoulders: V and round necks narrow the shoulder line; boat necks widen it.', ['boat-neck', 'square-neck']),
        sleeve: a(['three-quarter-sleeve', 'full-sleeve', 'bell-sleeve', 'flared-sleeve'], 'Longer sleeves with flare at the wrist balance the shoulders.', ['puff-sleeve', 'sleeveless']),
      },
    },
    {
      id: 'narrow-shoulders',
      label: 'Narrow shoulders',
      description: 'Slim, sloping shoulders',
      advice: {
        neck: a(['boat-neck', 'square-neck', 'collar-neck'], 'Boat and square necks broaden narrow shoulders.'),
        sleeve: a(['puff-sleeve', 'short-sleeve', 'half-sleeve'], 'Puff or cap sleeves add width at the shoulder.'),
      },
    },
    {
      id: 'heavy-hips',
      label: 'Heavy hips / thighs',
      description: 'Fuller lower body',
      advice: {
        length: a(['knee-length', 'calf-length', 'ankle-length'], 'Choose a kurta long enough to cover the hips.', ['short']),
        lower: a(['palazzo', 'sharara', 'straight-pant'], 'Heavy hips: palazzo and straight pants fall cleanly; patiala and dhoti add bulk.', ['patiala', 'dhoti']),
      },
    },
    {
      id: 'tummy',
      label: 'Tummy',
      description: 'Fuller belly area',
      advice: {
        neck: a(['v-neck', 'deep-v-neck'], 'A V neck pulls the eye up and away from the middle.'),
        length: a(['calf-length', 'ankle-length', 'floor-length'], 'A-line and Anarkali cuts flow over the tummy; avoid a cinched waist.', ['short']),
        fabric: a(['georgette', 'crepe', 'chiffon', 'rayon'], 'Flowing fabrics skim rather than cling.', ['velvet']),
      },
    },
    {
      id: 'petite',
      label: 'Petite / short',
      description: 'Under about 5′2″',
      advice: {
        neck: a(['v-neck', 'deep-v-neck'], 'V necks make you look taller.'),
        length: a(['short', 'knee-length'], 'Petite: knee-length kurtas keep proportions; floor-length can swamp you (unless you wear heels).', ['floor-length']),
        lower: a(['churidar', 'straight-pant', 'palazzo'], 'Slim, full-length bottoms lengthen the legs.', ['patiala', 'dhoti', 'gharara']),
        fabric: a(['georgette', 'chiffon', 'crepe', 'rayon'], 'Light fabrics avoid overwhelming a small frame.', ['velvet']),
      },
    },
    {
      id: 'tall',
      label: 'Tall',
      description: 'Over about 5′7″',
      advice: {
        neck: a(['boat-neck', 'high-neck', 'mandarin-neck', 'collar-neck'], 'High and wide necklines suit a long frame.'),
        length: a(['ankle-length', 'floor-length', 'calf-length'], 'Long kurtas and Anarkalis are made for your height.'),
        lower: a(['patiala', 'sharara', 'gharara', 'palazzo', 'dhoti'], 'You can carry volume — sharara and patiala look great.'),
      },
    },
  ],
};

/* ---- Reading saved data safely -------------------------------------------- */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);

function readAdvice(v: unknown): Record<string, GroupAdvice> {
  if (!isObj(v)) return {};
  const out: Record<string, GroupAdvice> = {};
  for (const [code, entry] of Object.entries(v)) {
    if (!isObj(entry)) continue;
    out[code] = { suits: strList(entry.suits), avoid: strList(entry.avoid), tip: str(entry.tip) };
  }
  return out;
}

function readChoice(v: unknown): FitChoice | null {
  if (!isObj(v) || !str(v.id) || !str(v.label)) return null;
  return { id: str(v.id), label: str(v.label), description: str(v.description), advice: readAdvice(v.advice) };
}

function readSizeChart(v: unknown): SizeChart | null {
  if (!isObj(v)) return null;
  const columns = strList(v.columns);
  const rows = Array.isArray(v.rows)
    ? v.rows.filter(isObj).map((r) => ({
        size: str(r.size),
        values: columns.map((_, i) => num(Array.isArray(r.values) ? r.values[i] : 0)),
      }))
    : [];
  if (!columns.length || !rows.length) return null;
  return { columns, rows, note: str(v.note) };
}

/** Saved guides laid over the defaults, part by part. */
export function mergeGuides(saved: unknown): StyleGuides {
  if (!isObj(saved)) return DEFAULT_GUIDES;

  const tips = Array.isArray(saved.measureTips)
    ? saved.measureTips.filter(isObj).map((t) => ({ name: str(t.name), tip: str(t.tip) })).filter((t) => t.name)
    : [];
  const shapes = Array.isArray(saved.bodyShapes)
    ? saved.bodyShapes.flatMap((s): BodyShape[] => {
        const choice = readChoice(s);
        if (!choice || !isObj(s)) return [];
        const w = Array.isArray(s.widths) ? s.widths.map(num) : [];
        const widths = (w.length === 4 ? w : [28, 28, 24, 30]) as BodyShape['widths'];
        return [{ ...choice, widths }];
      })
    : [];
  const concerns = Array.isArray(saved.fitConcerns)
    ? saved.fitConcerns.map(readChoice).filter((c): c is FitChoice => Boolean(c))
    : [];

  return {
    sizeChart: readSizeChart(saved.sizeChart) ?? DEFAULT_GUIDES.sizeChart,
    measureTips: Array.isArray(saved.measureTips) ? tips : DEFAULT_GUIDES.measureTips,
    bodyShapes: Array.isArray(saved.bodyShapes) ? shapes : DEFAULT_GUIDES.bodyShapes,
    fitConcerns: Array.isArray(saved.fitConcerns) ? concerns : DEFAULT_GUIDES.fitConcerns,
  };
}

/** "Heavy bust" → "heavy-bust": ids for new shapes and concerns. */
export const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
