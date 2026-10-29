/**
 * Feature switches the admin flips in the dashboard (Admin → Design credits).
 * Read live, so turning credits off hides them on the site straight away.
 */

import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export interface AppSettings {
  creditsEnabled: boolean;
  /** "How to measure" video link, or "" until the admin adds one. */
  measureVideoUrl: string;
}

const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<AppSettings, void>({
      query: () => '/settings',
      transformResponse: (res: ApiEnvelope<AppSettings>) => unwrap(res),
      providesTags: ['Settings'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSettingsQuery } = settingsApi;

/**
 * Whether design credits are on. undefined while loading — callers that
 * would otherwise flash the credit UI (or spend) should wait for it.
 *
 * Polled while the tab is visible, so a customer already on the page sees
 * the admin's switch within a few seconds — no reload needed.
 */
export function useCreditsEnabled(): boolean | undefined {
  const { data } = useGetSettingsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    pollingInterval: SETTINGS_POLL_MS,
    skipPollingIfUnfocused: true,
  });
  return data?.creditsEnabled;
}

const SETTINGS_POLL_MS = 10_000;

/** The admin's "How to measure" video link; "" when none is set. */
export function useMeasureVideoUrl(): string {
  const { data } = useGetSettingsQuery(undefined, { refetchOnMountOrArgChange: true });
  return data?.measureVideoUrl ?? '';
}
