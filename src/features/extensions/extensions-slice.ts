import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export type UrlRuleItem = {
  id: string;
  url: string;
};

export type Extension = {
  id: string;
  enabledUrls: UrlRuleItem[];
  disabledUrls: UrlRuleItem[];
};

export type UrlType = 'enabled' | 'disabled';

type ExtensionsState = {
  entities: Extension[];
};

const initialState: ExtensionsState = {
  entities: [],
};

const findExtensionById = (state: ExtensionsState, extensionId: string) =>
  state.entities.find((extension) => extension.id === extensionId);

const extensionsSlice = createSlice({
  name: 'extensions',
  initialState,
  reducers: {
    initExtension: (state, action: PayloadAction<{ extensionId: string }>) => {
      const { extensionId } = action.payload;
      const existingExtension = findExtensionById(state, extensionId);
      if (!existingExtension) {
        state.entities.push({
          id: extensionId,
          enabledUrls: [],
          disabledUrls: [],
        });
      }
    },
    addUrlRule: (
      state,
      action: PayloadAction<{
        extensionId: string;
        url: string;
        type: UrlType;
      }>,
    ) => {
      const { extensionId, url, type } = action.payload;
      const extension = findExtensionById(state, extensionId);

      if (extension) {
        extension[`${type}Urls`].push({
          id: uuidv4(),
          url,
        });
      }
    },
    removeUrlRule: (
      state,
      action: PayloadAction<{
        extensionId: string;
        urlId: string;
        type: UrlType;
      }>,
    ) => {
      const { extensionId, urlId, type } = action.payload;
      const extension = findExtensionById(state, extensionId);

      if (extension) {
        const urlIndex = extension[`${type}Urls`].findIndex(
          (rule) => rule.id === urlId,
        );
        if (urlIndex !== -1) {
          extension[`${type}Urls`].splice(urlIndex, 1);
        }
      }
    },
    editUrlRule: (
      state,
      action: PayloadAction<{
        extensionId: string;
        urlId: string;
        type: UrlType;
        newUrlValue: string;
      }>,
    ) => {
      const { extensionId, urlId, type, newUrlValue } = action.payload;
      const extension = findExtensionById(state, extensionId);

      if (extension) {
        const urlIndex = extension[`${type}Urls`].findIndex(
          (rule) => rule.id === urlId,
        );
        if (urlIndex !== -1) {
          extension[`${type}Urls`][urlIndex].url = newUrlValue;
        }
      }
    },
  },
});

export const { initExtension, addUrlRule, removeUrlRule, editUrlRule } =
  extensionsSlice.actions;
export default extensionsSlice.reducer;
