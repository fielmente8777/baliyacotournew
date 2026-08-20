/**
 * Measurement fixtures + the field definitions that drive both the
 * New Measurement form and the mannequin hotspots.
 */

import type {
  MeasurementField,
  MeasurementKey,
  MeasurementProfile,
} from '@/@types/measurement';

/**
 * Single source of truth for the 12 measurements. The form renders these
 * in order (two per row); the mannequin places a hotspot at each
 * `hotspot` coordinate. Adding a 13th measurement means editing only
 * this array.
 */
export const MEASUREMENT_FIELDS: MeasurementField[] = [
  { key: 'chest',       label: 'Chest',        guideImage: '/guides/chest.png',        hotspot: { top: 27, left: 47 }, min: 20, max: 70 },
  { key: 'sleeve',      label: 'Sleeve',       guideImage: '/guides/sleeve.png',       hotspot: { top: 30, left: 62 }, min: 10, max: 40 },
  { key: 'shoulder',    label: 'Shoulder',     guideImage: '/guides/shoulder.png',     hotspot: { top: 22, left: 38 }, min: 10, max: 30 },
  { key: 'bicep',       label: 'Bicep',        guideImage: '/guides/bicep.png',        hotspot: { top: 34, left: 65 }, min: 8,  max: 25 },
  { key: 'wristAround', label: 'Wrist Around', guideImage: '/guides/wrist.png',        hotspot: { top: 45, left: 68 }, min: 4,  max: 15 },
  { key: 'frontRaise',  label: 'Front Side',   guideImage: '/guides/front-raise.png',  hotspot: { top: 38, left: 44 }, min: 10, max: 35 },
  { key: 'waist',       label: 'Waist',        guideImage: '/guides/waist.png',        hotspot: { top: 43, left: 50 }, min: 20, max: 70 },
  { key: 'backRaise',   label: 'Back Raise',   guideImage: '/guides/back-raise.png',   hotspot: { top: 40, left: 56 }, min: 10, max: 35 },
  { key: 'hip',         label: 'Hip',          guideImage: '/guides/hip.png',          hotspot: { top: 49, left: 46 }, min: 24, max: 75 },
  { key: 'thigh',       label: 'Thigh',        guideImage: '/guides/thigh.png',        hotspot: { top: 58, left: 51 }, min: 14, max: 40 },
  { key: 'legLength',   label: 'Leg Length',   guideImage: '/guides/leg-length.png',   hotspot: { top: 70, left: 45 }, min: 20, max: 55 },
  { key: 'legOpening',  label: 'Leg Opening',  guideImage: '/guides/leg-opening.png',  hotspot: { top: 76, left: 53 }, min: 8,  max: 30 },
];

const uniform = (n: number): Record<MeasurementKey, number> =>
  MEASUREMENT_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.key]: n }),
    {} as Record<MeasurementKey, number>
  );

export const emptyValues = (): Record<MeasurementKey, string> =>
  MEASUREMENT_FIELDS.reduce(
    (acc, f) => ({ ...acc, [f.key]: '' }),
    {} as Record<MeasurementKey, string>
  );

export const mockProfiles: MeasurementProfile[] = [
  { _id: 'mp-1', profileName: 'Jyotsana Gaur', unit: 'inch', values: uniform(36), isDefault: true },
  { _id: 'mp-2', profileName: 'Jyotsana Gaur', unit: 'inch', values: uniform(36) },
];
