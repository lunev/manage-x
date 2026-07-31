import { mergeStringArrays, mergeUrlStrings } from '@/lib/utils';
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
    mergeGroupRules: (state, action: PayloadAction<GroupRule[]>) => {
      const newRules = action.payload;
      const currentMap = new Map(state.entities.map((rule) => [rule.id, rule]));

      for (const newRule of newRules) {
        const existingRule = currentMap.get(newRule.id);

        if (!existingRule) {
          currentMap.set(newRule.id, newRule);
        } else {
          const mergedRule: GroupRule = {
            ...existingRule,
            name: existingRule.name || newRule.name,
            extensions: mergeStringArrays(existingRule.extensions, newRule.extensions),
            enabledUrls: mergeUrlStrings(existingRule.enabledUrls, newRule.enabledUrls),
            disabledUrls: mergeUrlStrings(existingRule.disabledUrls, newRule.disabledUrls),
            active: newRule.active,
          };

          currentMap.set(newRule.id, mergedRule);
        }
      }

      state.entities = Array.from(currentMap.values());
    },
  },
});

export const { addGroupUrlRule, removeGroupUrlRule, updateGroupUrlRule, toggleGroupUrlRule, mergeGroupRules } =
  groupRuleSlice.actions;
export default groupRuleSlice.reducer;
