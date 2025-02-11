import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PreferenceType = {
  key: 'sidePanel' | 'groups' | 'search' | 'permissions' | 'urlRules';
  label: string;
  visible: boolean;
};

type PreferencesState = Record<
  PreferenceType['key'],
  Omit<PreferenceType, 'key'>
>;

const initialState: PreferencesState = {
  groups: {
    label: 'Groups',
    visible: true,
  },
  search: {
    label: 'Search',
    visible: true,
  },
  permissions: {
    label: 'Permissions',
    visible: true,
  },
  urlRules: {
    label: 'URL Rules',
    visible: true,
  },
  sidePanel: {
    label: 'Side Panel',
    visible: false,
  },
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    togglePreferences(state, action: PayloadAction<PreferenceType['key']>) {
      const key = action.payload;
      if (state[key]) {
        state[key].visible = !state[key].visible;
      }
    },
    disablePreferences(state, action: PayloadAction<PreferenceType['key']>) {
      const key = action.payload;
      if (state[key]) {
        state[key].visible = false;
      }
    },
  },
});

export const { togglePreferences, disablePreferences } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
