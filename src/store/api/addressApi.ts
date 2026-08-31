/**
 * Saved shipping addresses. Never mocked — an address belongs to whoever the
 * token identifies.
 */

import type { Address, SaveAddressBody } from '@/@types/account';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>({
      query: () => '/addresses',
      transformResponse: (res: ApiEnvelope<Address[]>) => unwrap(res),
      providesTags: ['Address'],
    }),

    createAddress: builder.mutation<Address, SaveAddressBody>({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      transformResponse: (res: ApiEnvelope<Address>) => unwrap(res),
      invalidatesTags: ['Address'],
    }),

    updateAddress: builder.mutation<Address, { id: string; body: Partial<SaveAddressBody> }>({
      query: ({ id, body }) => ({ url: `/addresses/${id}`, method: 'PUT', body }),
      transformResponse: (res: ApiEnvelope<Address>) => unwrap(res),
      invalidatesTags: ['Address'],
    }),

    deleteAddress: builder.mutation<unknown, string>({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
