import { configureStore } from '@reduxjs/toolkit';
import { Note } from '../src/types';
import notesSlice from '../src/features/notes/notes-slice';
import preferencesSlice from '@/features/preferences/preferences-slice';
import { PreferenceProperties } from '@/features/preferences/preferenceProperties';

export type PreloadedState = {
  notes?: {
    data: Note[];
  };
  preferences?: {
    [PreferenceProperties.Active]?: boolean;
    [PreferenceProperties.Muted]?: boolean;
  };
};

export const createMockStore = (initialState: PreloadedState = {}) => {
  return configureStore({
    reducer: {
      notes: notesSlice,
      preferences: preferencesSlice,
    },
    preloadedState: {
      notes: {
        data: [
          { id: '1', title: 'Take a break' },
          { id: '2', title: 'Test' },
        ],
        ...initialState.notes,
      },
      preferences: {
        [PreferenceProperties.Active]: true,
        [PreferenceProperties.Muted]: false,
        ...initialState.preferences,
      },
    },
  });
};
