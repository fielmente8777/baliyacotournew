/**
 * Local presentation metadata for measurements.
 *
 * Not data — the fields come from GET /measurements/template. These are the
 * mannequin hotspot coordinates and how-to-measure illustrations, which the
 * backend has no reason to store. Matched by template name.
 */

import type { MeasurementUiMeta } from '@/@types/measurement';

const DEFAULT_META: MeasurementUiMeta = {
  guideImage: '/guides/default.png',
  hotspot: { top: 50, left: 50 },
  min: 1,
  max: 120,
};

const META: Record<string, MeasurementUiMeta> = {
  Chest: { guideImage: '/guides/chest.png', hotspot: { top: 27, left: 47 }, min: 20, max: 70 },
  Sleeve: { guideImage: '/guides/sleeve.png', hotspot: { top: 30, left: 62 }, min: 10, max: 40 },
  Shoulder: { guideImage: '/guides/shoulder.png', hotspot: { top: 22, left: 38 }, min: 10, max: 30 },
  Bicep: { guideImage: '/guides/bicep.png', hotspot: { top: 34, left: 65 }, min: 8, max: 25 },
  'Wrist Around': { guideImage: '/guides/wrist.png', hotspot: { top: 45, left: 68 }, min: 4, max: 15 },
  'Front Raise': { guideImage: '/guides/front-raise.png', hotspot: { top: 38, left: 44 }, min: 10, max: 35 },
  Waist: { guideImage: '/guides/waist.png', hotspot: { top: 43, left: 50 }, min: 20, max: 70 },
  'Back Raise': { guideImage: '/guides/back-raise.png', hotspot: { top: 40, left: 56 }, min: 10, max: 35 },
  Hip: { guideImage: '/guides/hip.png', hotspot: { top: 49, left: 46 }, min: 24, max: 75 },
  Thigh: { guideImage: '/guides/thigh.png', hotspot: { top: 58, left: 51 }, min: 14, max: 40 },
  'Leg Length': { guideImage: '/guides/leg-length.png', hotspot: { top: 70, left: 45 }, min: 20, max: 55 },
  'Leg Opening': { guideImage: '/guides/leg-opening.png', hotspot: { top: 76, left: 53 }, min: 8, max: 30 },
};

/** Unknown template names fall back to the centre of the figure. */
export const uiMetaFor = (name: string): MeasurementUiMeta => META[name] ?? DEFAULT_META;
