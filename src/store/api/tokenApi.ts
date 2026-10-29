/**
 * Design tokens — the customer's wallet for AI colour previews.
 *
 * Shown only while the admin's "Design credits" switch is on (settingsApi).
 * Spending happens inside POST /designs/recolour, which
 * invalidates 'Tokens' so the balance on screen updates by itself.
 */

import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export interface TokenPack {
  id: string;
  label: string;
  tagline: string;
  /** "Most popular", "Best value" — absent on the plain pack. */
  highlight?: string;
  tokens: number;
  bonus: number;
  /** tokens + bonus */
  total: number;
  /** Minor units (paise). */
  price: number;
  perToken: number;
  /** Against the smallest pack's per-token price. */
  savingsPercent: number;
}

export interface TokenUsage {
  received: number;
  used: number;
  refunded: number;
  usedThisMonth: number;
  previewsGenerated: number;
}

export interface TokenLimits {
  costPerNewPreview: number;
  cachedPreviewsFree: boolean;
  failedPreviewsRefunded: boolean;
  previewsPerWindow: number;
  windowMinutes: number;
  tokensExpire: boolean;
}

export interface TokenEntry {
  _id: string;
  delta: number;
  balanceAfter: number;
  reason: 'grant' | 'purchase' | 'spend' | 'refund';
  note?: string;
  createdAt: string;
}

export interface TokenWallet {
  enabled: boolean;
  balance: number;
  previewsLeft: number;
  costs: { recolour: number };
  usage: TokenUsage;
  limits: TokenLimits;
  packs: TokenPack[];
  history: TokenEntry[];
}

const tokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallet: builder.query<TokenWallet, void>({
      query: () => '/tokens/me',
      transformResponse: (res: ApiEnvelope<TokenWallet>) => unwrap(res),
      providesTags: ['Tokens'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetWalletQuery } = tokenApi;
