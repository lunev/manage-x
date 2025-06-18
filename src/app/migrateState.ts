import { ExtensionPersisted, ExtensionRule } from '@/types';
import { PersistedState } from 'redux-persist';

type ManageXPersistedState = PersistedState & {
  extensions?: {
    entities: ExtensionPersisted[];
  };
  preferences?: unknown;
  groups?: unknown;
  extensionRules?: {
    entities: ExtensionRule[];
  };
};

export const migrate = async (state: ManageXPersistedState | undefined): Promise<ManageXPersistedState | undefined> => {
  if (state?.extensions) {
    const newExtensionRules: ExtensionRule[] = state?.extensions?.entities
      .filter((ext) => ext.enabled)
      .map((ext) => ({
        id: ext.id,
        name: ext.name,
        enabledUrls: ext.enabledUrls.map((u) => u.url).join('\n'),
        disabledUrls: ext.disabledUrls.map((u) => u.url).join('\n'),
        active: ext.enabled,
      }));

    return {
      ...state,
      extensionRules: {
        entities: newExtensionRules,
      },
      extensions: undefined,
      preferences: undefined,
      groups: undefined,
    };
  }

  return state;
};
