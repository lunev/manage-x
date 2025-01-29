import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Preferences } from '@/types/';
import { PreferenceProperties } from './preferenceProperties';

const initialState: Preferences = {
  [PreferenceProperties.Active]: true,
  [PreferenceProperties.Muted]: false,
};

type ToggleActionPayload = {
  property: PreferenceProperties;
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggle(state, action: PayloadAction<ToggleActionPayload>) {
      const { property } = action.payload;
      state[property] = !state[property];
    },
  },
});

export const { toggle } = preferencesSlice.actions;
export default preferencesSlice.reducer;
