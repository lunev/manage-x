import { configureStore } from '@reduxjs/toolkit';
import extensionRuleSlice from '@/features/extension-rules/extension-rules-slice';
import groupRuleSlice from '@/features/group-rules/group-rules-slice';
import { ExtensionRule, GroupRule } from '@/types';

export type PreloadedState = {
  extensionRules?: { entities: ExtensionRule[] };
  groupRules?: { entities: GroupRule[] };
};

export const createMockStore = (initialState: PreloadedState = {}) => {
  return configureStore({
    reducer: {
      extensionRules: extensionRuleSlice,
      groupRules: groupRuleSlice,
    },
    preloadedState: {
      extensionRules: { entities: [] },
      groupRules: { entities: [] },
      ...initialState,
    },
  });
};
