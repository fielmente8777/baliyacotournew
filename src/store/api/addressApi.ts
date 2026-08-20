/** Saved address endpoints. */

import type { Address, SaveAddressArg } from '@/@types/account';
import { mockAddresses } from '@/mocks/account.mock';
import { USE_MOCKS, baseApi, mockDelay } from './baseApi';

let demoAddresses: Address[] = [...mockAddresses];

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], void>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await mockDelay();
              return { data: demoAddresses };
            },
            providesTags: ['Address'],
          }
        : { query: () => '/profile/addresses', providesTags: ['Address'] }
    ),

    saveAddress: builder.mutation<Address, SaveAddressArg>(
      USE_MOCKS
        ? {
            queryFn: async (arg: SaveAddressArg) => {
              await mockDelay();
              const saved: Address = { ...arg, _id: arg._id ?? `addr-${Date.now()}` };
              demoAddresses = arg._id
                ? demoAddresses.map((a) => (a._id === arg._id ? saved : a))
                : [...demoAddresses, saved];
              return { data: saved };
            },
            invalidatesTags: ['Address'],
          }
        : {
            query: (body) => ({
              url: body._id ? `/profile/addresses/${body._id}` : '/profile/addresses',
              method: body._id ? 'PUT' : 'POST',
              body,
            }),
            invalidatesTags: ['Address'],
          }
    ),
  }),
  overrideExisting: false,
});

export const { useGetAddressesQuery, useSaveAddressMutation } = addressApi;
