import { ExtensionPersisted } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export type UrlType = 'enabled' | 'disabled';

type ExtensionsState = {
  entities: ExtensionPersisted[];
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
    initExtensions: (
      state,
      action: PayloadAction<{ extensions: ExtensionPersisted[] }>,
    ) => {
      const { extensions } = action.payload;

      extensions.forEach((extension) => {
        if (!state.entities.find((entity) => entity.id === extension.id)) {
          state.entities.push(extension);
        }
      });
    },
    toggleExtension: (
      state,
      action: PayloadAction<{ extensionId: string }>,
    ) => {
      const { extensionId } = action.payload;
      const extension = findExtensionById(state, extensionId);
      if (extension) {
        extension.enabled = !extension.enabled;
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
    updateUrlRule: (
      state,
      action: PayloadAction<{
        extensionId: string;
        urlId: string;
        type: UrlType;
        newUrl: string;
      }>,
    ) => {
      const { extensionId, urlId, type, newUrl } = action.payload;
      const extension = findExtensionById(state, extensionId);

      if (extension) {
        const urlIndex = extension[`${type}Urls`].findIndex(
          (rule) => rule.id === urlId,
        );
        if (urlIndex !== -1) {
          extension[`${type}Urls`][urlIndex].url = newUrl;
        }
      }
    },
    resetAllUrlRules: (
      state,
      action: PayloadAction<{
        extensionId: string;
      }>,
    ) => {
      const { extensionId } = action.payload;
      const extension = findExtensionById(state, extensionId);

      if (extension) {
        extension.disabledUrls = [];
        extension.enabledUrls = [];
      }
    },
  },
});

export const {
  initExtensions,
  toggleExtension,
  addUrlRule,
  removeUrlRule,
  updateUrlRule,
  resetAllUrlRules,
} = extensionsSlice.actions;
export default extensionsSlice.reducer;
