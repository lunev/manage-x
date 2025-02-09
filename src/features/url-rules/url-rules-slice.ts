import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UrlRule = {
  extensionId: string;
  enabledUrls: string[];
  disabledUrls: string[];
};

type UrlRulesState = {
  urlRules: UrlRule[];
};

const initialState: UrlRulesState = {
  urlRules: [
    {
      extensionId: 'cfhdojbkjhnklbpkdaibdccddilifddb',
      enabledUrls: ['www.google.com', 'www.twitter.com'],
      disabledUrls: ['www.fb.com', 'www.indeed.com'],
    },
  ],
};

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    addRule: (state, action: PayloadAction<UrlRule>) => {
      const { extensionId } = action.payload;
      const existingRule = state.urlRules.find(
        (rule) => rule.extensionId === extensionId,
      );
      if (!existingRule) {
        state.urlRules.push(action.payload);
      }
    },
  },
});

export const { addRule } = rulesSlice.actions;
export default rulesSlice.reducer;
