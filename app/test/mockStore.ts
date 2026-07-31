import { configureStore } from '@reduxjs/toolkit';
import preferencesSlice from '@/features/preferences/preferences-slice';

export type PreloadedState = {
  preferences?: {
    sidePanel: {
      label: string;
      value: false;
    };
    groups: {
      label: string;
      value: false;
    };
  };
};

export const createMockStore = (initialState: PreloadedState = {}) => {
  return configureStore({
    reducer: {
      preferences: preferencesSlice,
    },
    preloadedState: {
      preferences: {
        sidePanel: {
          label: 'Show as Side Panel',
          value: false,
        },
        groups: {
          label: 'Show Groups',
          value: false,
        },
      },
      ...initialState.preferences,
    },
  });
};
