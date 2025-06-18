import { combineReducers, configureStore } from '@reduxjs/toolkit';
import groupRuleSlice from '@/features/group-rules/group-rules-slice';
import extensionRuleSlice from '@/features/extension-rules/extension-rules-slice';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { localStorage } from 'redux-persist-webextension-storage';

const localStorageConfig = {
  key: 'localStorage',
  storage: localStorage,
};

const rootReducer = combineReducers({
  groupRules: groupRuleSlice,
  extensionRules: extensionRuleSlice,
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
