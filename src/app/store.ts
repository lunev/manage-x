import { combineReducers, configureStore } from '@reduxjs/toolkit';
import notesSlice from '@/features/notes/notes-slice';
import preferencesSlice from '@/features/preferences/preferences-slice';
// prettier-ignore
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { syncStorage } from 'redux-persist-webextension-storage';

const syncStorageConfig = {
  key: 'syncStorage',
  storage: syncStorage,
};

const rootReducer = combineReducers({
  notes: notesSlice,
  preferences: preferencesSlice,
});

const persistedReducer = persistReducer(syncStorageConfig, rootReducer);

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
