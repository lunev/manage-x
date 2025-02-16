import { combineReducers, configureStore } from '@reduxjs/toolkit';
import preferencesSlice from '@/features/preferences/preferences-slice';
import groupsSlice from '@/features/groups/groups-slice';
import extensionsSlice from '@/features/extensions/extensions-slice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { localStorage } from 'redux-persist-webextension-storage';

const localStorageConfig = {
  key: 'localStorage',
  storage: localStorage,
};

const rootReducer = combineReducers({
  extensions: extensionsSlice,
  preferences: preferencesSlice,
  groups: groupsSlice,
});

const persistedReducer = persistReducer(localStorageConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
