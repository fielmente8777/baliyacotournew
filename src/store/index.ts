import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { adminApi } from './api/adminApi';
import { baseApi } from './api/baseApi';
import authReducer from './features/authSlice';
import createDesignReducer from './features/createDesignSlice';
import { announceAdminSaves } from '@/lib/liveUpdates';

export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
      auth: authReducer,
      createDesign: createDesignReducer,
    },
    middleware: (getDefault) =>
      getDefault().concat(baseApi.middleware, adminApi.middleware, announceAdminSaves),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export { setupListeners };
