/** Admin panel types. Mirrors baliye-node services/adminCatalog.ts. */

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
}

export type GarmentFamily = 'indian' | 'western' | 'indo-western';

export type OptionInputType =
  | 'single_select'
  | 'multi_select'
  | 'color_select'
  | 'size_select'
  | 'measurement'
  | 'number'
  | 'text'
  | 'image_upload';

/** One step of a garment. */
export interface AdminOptionConfig {
  groupId: string;
  position: number;
  isRequired: boolean;
  /** Empty = every active option of the step. */
  allowedOptions: string[];
  defaultOption?: string;
  /** Show this step only when another step's choice is one of these. */
  dependsOn?: { groupId: string; optionIds: string[] };
}

export interface AdminGarment {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  family: GarmentFamily;
  /** Paise. */
  basePrice: number;
  measurementTemplates: string[];
  optionConfigs: AdminOptionConfig[];
  isDesignable: boolean;
  position: number;
  isActive: boolean;
}

export interface AdminOptionGroup {
  _id: string;
  code: string;
  label: string;
  description?: string;
  inputType: OptionInputType;
  position: number;
  isActive: boolean;
}

export interface AdminOption {
  _id: string;
  groupId: string;
  label: string;
  value: string;
  description?: string;
  image?: string;
  hex?: string;
  /** Paise. */
  priceModifier: number;
  pairsWith: string[];
  position: number;
  isActive: boolean;
  /** Embroidery options: the AI Studio collection it renders with. */
  assetCollectionId?: string;
}

export interface AdminMeasurementTemplate {
  _id: string;
  name: string;
  unit: 'in' | 'cm';
  defaultValue?: number;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface AdminCatalog {
  garments: AdminGarment[];
  groups: AdminOptionGroup[];
  options: AdminOption[];
  measurementTemplates: AdminMeasurementTemplate[];
  /** Design image key → url, as Shopify has it. */
  images: Record<string, string>;
  /** Option id → its AI Studio embroidery picture, for options linked in AI Studio. */
  studioImages?: Record<string, string>;
  /** Set when Shopify couldn't be read; images then come from the last sync. */
  shopifyError?: string;
}

/** One row of the Design Builder sheet, as the import read it. */
export interface CatalogImportRow {
  row: number;
  name: string;
  action: 'create' | 'update' | 'unchanged' | 'error';
  changes: string[];
  errors: string[];
}

/** POST /admin/catalog/import: a preview, or what was saved with `?apply=true`. */
export interface CatalogImportReport {
  applied: boolean;
  garments: CatalogImportRow[];
  options: CatalogImportRow[];
  newSteps: string[];
  newMeasurements: string[];
  rules: { garment: string; changes: string[] }[];
  warnings: string[];
  errorCount: number;
}

export interface CatalogSyncSummary {
  garments: number;
  groups: number;
  optionsUpdated: number;
  optionsCreated: number;
  skipped: string[];
}

export type ContentPage = 'home' | 'footer' | 'terms' | 'products';

/** A storefront customer, as the admin user list returns one. */
export interface AdminCustomer {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  tokenBalance?: number;
  createdAt: string;
}

/** One customer's credit activity, as listed on the admin Design credits page. */
export interface AdminCreditUser extends AdminCustomer {
  tokenBalance: number;
  received: number;
  used: number;
  designsGenerated: number;
  lastActivity: string;
}

export interface AdminCreditStats {
  enabled: boolean;
  costPerDesign: number;
  /** Every registered customer. */
  customers: number;
  /** Customers holding a balance above zero. */
  customersWithCredits: number;
  /** Customers who have spent at least one credit. */
  customersUsingCredits: number;
  /** Credits sitting in customer balances right now. */
  inCirculation: number;
  /** Added by admins, paid and free, net of corrections. */
  issued: number;
  /** Spent on AI designs, net of refunds. */
  used: number;
  usedThisMonth: number;
  designsGenerated: number;
  users: AdminCreditUser[];
}

/** The store's own AI credit — prepaid OpenAI balance. Amounts in US dollars. */
export interface AdminAiCredit {
  currency: 'USD';
  /** null until the admin has entered the balance from OpenAI once. */
  balance: {
    leftUsd: number;
    checkedUsd: number;
    checkedAt: string;
    toppedUpUsd: number;
    spentUsd: number;
    imagesSince: number;
    designsLeft: number | null;
    /** Design credits that can still be handed out without overrunning the balance. */
    creditsToGive: number | null;
    daysLeft: number | null;
    low: boolean;
  } | null;
  spentLast30DaysUsd: number;
  imagesLast30Days: number;
  spentThisMonthUsd: number;
  costPerDesignUsd: number | null;
  designsPerDollar: number | null;
  /** Design credits one AI design uses. */
  creditCost: number;
  /** Credits customers hold and haven't spent yet. */
  heldByCustomers: number;
  lowBalanceUsd: number;
  history: { _id: string; kind: 'balance' | 'topup'; amountUsd: number; note?: string; createdAt: string }[];
}

export interface AdminTokenEntry {
  _id: string;
  delta: number;
  balanceAfter: number;
  reason: 'grant' | 'purchase' | 'spend' | 'refund';
  note?: string;
  createdAt: string;
}
