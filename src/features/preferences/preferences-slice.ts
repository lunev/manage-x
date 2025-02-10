import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PreferenceKey =
  | 'sidePanel'
  | 'showGroups'
  | 'showSearch'
  | 'showPermissions'
  | 'showUrlRules';

const initialState: Record<PreferenceKey, { label: string; active: boolean }> =
  {
    showGroups: {
      label: 'Show Groups',
      active: true,
    },
    showSearch: {
      label: 'Show Search',
      active: true,
    },
    showPermissions: {
      label: 'Show Permissions',
      active: true,
    },
    showUrlRules: {
      label: 'Show URL Rules',
      active: true,
    },
    sidePanel: {
      label: 'Show as Side Panel',
      active: false,
    },
  };

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    togglePreferences(state, action: PayloadAction<PreferenceKey>) {
      const key = action.payload;
      if (state[key]) {
        state[key].active = !state[key].active;
      }
    },
    disablePreferences(state, action: PayloadAction<PreferenceKey>) {
      const key = action.payload;
      if (state[key]) {
        state[key].active = false;
      }
    },
  },
});

export const { togglePreferences, disablePreferences } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
