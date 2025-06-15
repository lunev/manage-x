import { ExtensionRule } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ExtensionRuleState = {
  entities: ExtensionRule[];
};

const initialState: ExtensionRuleState = {
  entities: [],
};

const extensionRuleSlice = createSlice({
  name: 'extensions',
  initialState,
  reducers: {
    addExtensionUrlRule: (state, action: PayloadAction<ExtensionRule>) => {
      const { id, name, enabledUrls, disabledUrls, active } = action.payload;
      state.entities.push({
        id,
        name,
        enabledUrls,
        disabledUrls,
        active,
      });
    },
    removeExtensionUrlRule: (state, action: PayloadAction<{ id: string }>) => {
      state.entities = state.entities.filter((entity) => entity.id !== action.payload.id);
    },
    updateExtensionUrlRule: (state, action: PayloadAction<ExtensionRule>) => {
      const extensionIndex = state.entities.findIndex((entity) => entity.id === action.payload.id);
      if (extensionIndex !== -1) {
        state.entities[extensionIndex] = action.payload;
      }
    },
    toggleExtensionUrlRule: (state, action: PayloadAction<{ id: string }>) => {
      const extensionIndex = state.entities.findIndex((entity) => entity.id === action.payload.id);
      if (extensionIndex !== -1) {
        state.entities[extensionIndex].active = !state.entities[extensionIndex].active;
      }
    },
  },
});

export const { addExtensionUrlRule, removeExtensionUrlRule, toggleExtensionUrlRule, updateExtensionUrlRule } =
  extensionRuleSlice.actions;
export default extensionRuleSlice.reducer;
