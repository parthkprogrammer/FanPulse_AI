import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import matchReducer from '@/features/matches/matchSlice';
import fantasyReducer from '@/features/fantasy/fantasySlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    matches: matchReducer,
    fantasy: fantasyReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

