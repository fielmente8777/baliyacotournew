/** Embroidery assets. Mirrors baliye-node models/embroideryasset.ts. */

export const EMBROIDERY_REGIONS = [
  'neckline',
  'yoke',
  'placket',
  'shoulder',
  'chest',
  'sleeve_body',
  'sleeve_cuff',
  'waist',
  'buti',
  'hem_border',
  'lower_hem',
  'back',
] as const;

export type EmbroideryRegion = (typeof EMBROIDERY_REGIONS)[number];

export type EmbroiderySide = 'pair' | 'left' | 'right' | 'center';

/** Positions placed against a left/right point, where the side matters. */
export const SIDED_REGIONS: EmbroideryRegion[] = ['shoulder', 'chest', 'sleeve_body', 'sleeve_cuff'];

export interface Placement {
  anchor:
    | 'neckline_point'
    | 'shoulder_left'
    | 'shoulder_right'
    | 'cuff_left'
    | 'cuff_right'
    | 'hem_center'
    | 'body_center';
  offset: { x: number; y: number };
  scale: { relativeTo: 'shoulderWidth' | 'garmentWidth' | 'hemWidth'; factor: number };
  align: 'center' | 'top' | 'bottom';
  rotation: number;
  mirror: boolean;
  tile: boolean;
}

export interface EmbroideryAsset {
  _id: string;
  collectionId: string;
  collectionName: string;
  name: string;
  region: EmbroideryRegion;
  side: EmbroiderySide;
  workType?: string;
  description?: string;
  /** True when the AI chose the name and position. */
  aiLabelled?: boolean;
  assetUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  placement: Placement;
  dominantHex?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface EmbroideryCollection {
  _id: string;
  collectionName: string;
  assetCount: number;
  approvedCount: number;
  thumbnailUrl: string;
  createdAt: string;
}

/** One copy of a piece as read off the source photo; fractions of the target image. */
export interface PlannedPiece {
  assetId: string;
  x: number;
  y: number;
  width: number;
  rotation: number;
  flip: boolean;
}

export interface Landmarks {
  confidence: number;
  neckline: { x: number; y: number };
  shoulderLeft: { x: number; y: number };
  shoulderRight: { x: number; y: number };
  cuffLeft: { x: number; y: number };
  cuffRight: { x: number; y: number };
  hemCenter: { x: number; y: number };
  bodyCenter: { x: number; y: number };
  shoulderWidth: number;
  garmentWidth: number;
  hemWidth: number;
  top: number;
  bottom: number;
}

/** Below this the detection is unreliable and the operator must mark them. */
export const ACCEPTABLE_CONFIDENCE = 0.6;

export const REGION_LABELS: Record<EmbroideryRegion, string> = {
  neckline: 'Neckline (gala)',
  yoke: 'Yoke',
  placket: 'Placket',
  shoulder: 'Shoulder',
  chest: 'Chest',
  sleeve_body: 'Sleeve (bazu)',
  sleeve_cuff: 'Sleeve cuff',
  waist: 'Waist (kamar)',
  buti: 'Buti (all over)',
  hem_border: 'Hem border (daaman)',
  lower_hem: 'Lower border',
  back: 'Back',
};

/** One line each, in plain words — shown beside the position picker. */
export const REGION_HINTS: Record<EmbroideryRegion, string> = {
  neckline: 'The border that follows the neck opening',
  yoke: 'The panel of work just below the neckline, across the upper chest',
  placket: 'The narrow strip down the centre front, below the neck',
  shoulder: 'A motif sitting on top of the shoulder',
  chest: 'A motif on one side of the chest, or one in the centre',
  sleeve_body: 'A motif on the sleeve itself, between shoulder and cuff',
  sleeve_cuff: 'The border at the end of the sleeve',
  waist: 'A band or motif across the waist',
  buti: 'A small motif repeated all over — one piece, scattered automatically',
  hem_border: 'The long border along the bottom edge',
  lower_hem: 'A second, thinner band near the hem',
  back: 'Work on the back — kept for reference, not placed on try-ons',
};

export const SIDE_LABELS: Record<EmbroiderySide, string> = {
  pair: 'Both sides (mirrored)',
  left: 'Left only',
  right: 'Right only',
  center: 'Centre',
};
