/**
 * Newsletter sign-up from the website. Subscribers are listed and exported
 * in the admin panel (Admin → Newsletter).
 */

import { baseApi } from './baseApi';

const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<void, { email: string; source?: string }>({
      query: (body) => ({ url: '/newsletter', method: 'POST', body }),
    }),
  }),
});

export const { useSubscribeNewsletterMutation } = newsletterApi;
