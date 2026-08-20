/**
 * Measurement types. Field keys match the New Measurement form in
 * Stensil-4 and the userMeasurement model on the backend.
 */

export type MeasurementKey =
  | 'chest'
  | 'sleeve'
  | 'shoulder'
  | 'bicep'
  | 'wristAround'
  | 'frontRaise'
  | 'waist'
  | 'backRaise'
  | 'hip'
  | 'thigh'
  | 'legLength'
  | 'legOpening';

export interface MeasurementField {
  key: MeasurementKey;
  label: string;
  /** Illustration shown when the matching mannequin hotspot is hovered. */
  guideImage: string;
  /** Hotspot position on the mannequin, in % of the stage box. */
  hotspot: { top: number; left: number };
  min: number;
  max: number;
}

/** A saved measurement profile — "Jyotsana Gaur" in the design. */
export interface MeasurementProfile {
  _id: string;
  profileName: string;
  unit: 'inch';
  values: Record<MeasurementKey, number>;
  isDefault?: boolean;
}

/** Form payload — values are strings while typing, parsed on submit. */
export interface MeasurementFormValues {
  profileName: string;
  values: Record<MeasurementKey, string>;
}
