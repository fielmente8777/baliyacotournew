/**
 * Measurement types. Template-driven: the fields themselves are configured by
 * an admin, so the frontend never hardcodes which measurements exist.
 */

export interface MeasurementTemplate {
  _id: string;
  name: string;
  unit: 'in' | 'cm';
  displayOrder: number;
  isActive: boolean;
}

/** Presentation metadata the backend doesn't store, matched by template name. */
export interface MeasurementUiMeta {
  guideImage: string;
  hotspot: { top: number; left: number };
  min: number;
  max: number;
}

/** A template resolved with its local UI metadata. */
export interface MeasurementField extends MeasurementTemplate {
  ui: MeasurementUiMeta;
}

export interface MeasurementValue {
  templateId: string;
  /** Denormalised at save time — survives a later template rename. */
  name: string;
  value: number;
  unit: 'in' | 'cm';
}

export interface MeasurementProfile {
  _id: string;
  profileName: string;
  values: MeasurementValue[];
  isDefault: boolean;
}

export interface SaveMeasurementProfileBody {
  /** Optional — the backend generates "<FirstName>_Measurement" when omitted. */
  profileName?: string;
  values: { templateId: string; value: number }[];
  isDefault?: boolean;
}
