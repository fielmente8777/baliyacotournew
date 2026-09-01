/**
 * Public catalog endpoints. Not mocked — products are the storefront, and
 * faking them would hide an empty or misconfigured catalog.
 */

import type {
  GarmentType,
  Paginated,
  Product,
  ProductListQuery,
} from '@/@types/product';
import { baseApi, unwrap, type ApiEnvelope } from './baseApi';

/** Drops undefined keys so they don't become "?sort=undefined". */
const cleanParams = (query: object = {}) =>
  Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== '')
  );

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Paginated<Product>, ProductListQuery | void>({
      query: (query) => ({ url: '/products', params: cleanParams(query ?? {}) }),
      /** The list endpoint returns pagination in `meta`, beside `data`. */
      transformResponse: (res: ApiEnvelope<Product[]>): Paginated<Product> => ({
        items: unwrap(res),
        meta: res.meta ?? { page: 1, limit: res.data.length, total: res.data.length, totalPages: 1 },
      }),
      providesTags: ['Product'],
    }),

    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/products/${slug}`,
      transformResponse: (res: ApiEnvelope<Product>) => unwrap(res),
      providesTags: ['Product'],
    }),

    getRelatedProducts: builder.query<Product[], string>({
      query: (slug) => `/products/${slug}/related`,
      transformResponse: (res: ApiEnvelope<Product[]>) => unwrap(res),
      providesTags: ['Product'],
    }),

    getGarmentTypes: builder.query<GarmentType[], { family?: string } | void>({
      query: (arg) => ({ url: '/garment-types', params: cleanParams(arg ?? {}) }),
      transformResponse: (res: ApiEnvelope<GarmentType[]>) => unwrap(res),
      providesTags: ['GarmentType'],
    }),

    getGarmentTypeBySlug: builder.query<GarmentType, string>({
      query: (slug) => `/garment-types/${slug}`,
      transformResponse: (res: ApiEnvelope<GarmentType>) => unwrap(res),
      providesTags: ['GarmentType'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetGarmentTypesQuery,
  useGetGarmentTypeBySlugQuery,
} = productApi;
