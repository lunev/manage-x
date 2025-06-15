import { GroupRule } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type GroupRulesState = {
  entities: GroupRule[];
};

const initialState: GroupRulesState = {
  entities: [],
};

const groupRuleSlice = createSlice({
  name: 'groupRules',
  initialState,
  reducers: {
    addGroupUrlRule: (state, action: PayloadAction<GroupRule>) => {
      const { id, name, extensions, enabledUrls, disabledUrls, active } = action.payload;
      state.entities.push({
        id,
        name,
        extensions,
        enabledUrls,
        disabledUrls,
        active,
      });
    },
    removeGroupUrlRule: (state, action: PayloadAction<{ id: string }>) => {
      state.entities = state.entities.filter((entity) => entity.id !== action.payload.id);
    },
    updateGroupUrlRule: (state, action: PayloadAction<GroupRule>) => {
      const groupIndex = state.entities.findIndex((entity) => entity.id === action.payload.id);
      if (groupIndex !== -1) {
        state.entities[groupIndex] = action.payload;
      }
    },
    toggleGroupUrlRule: (state, action: PayloadAction<{ id: string }>) => {
      const groupIndex = state.entities.findIndex((entity) => entity.id === action.payload.id);
      if (groupIndex !== -1) {
        state.entities[groupIndex].active = !state.entities[groupIndex].active;
      }
    },
  },
});

export const { addGroupUrlRule, removeGroupUrlRule, updateGroupUrlRule, toggleGroupUrlRule } = groupRuleSlice.actions;
export default groupRuleSlice.reducer;
