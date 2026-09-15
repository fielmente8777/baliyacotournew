/** Embroidery assets. Mirrors baliye-node models/embroideryasset.ts. */

export type EmbroideryRegion =
  | 'neckline'
  | 'chest'
  | 'sleeve_cuff'
  | 'sleeve_body'
  | 'hem_border'
  | 'placket'
  | 'buti'
  | 'lower_hem';

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
  neckline: 'Neckline',
  chest: 'Chest motif',
  sleeve_cuff: 'Sleeve cuff',
  sleeve_body: 'Sleeve body',
  hem_border: 'Hem border',
  placket: 'Placket',
  buti: 'Buti (scattered)',
  lower_hem: 'Trouser hem',
};
