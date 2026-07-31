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
    const newExtensionRules = state.extensions.entities
      .filter((ext) => ext.enabledUrls?.length > 0 || ext.disabledUrls?.length > 0)
      .map((ext) => ({
        id: ext.id,
        name: ext.name,
        enabledUrls: ext.enabledUrls.map((u) => u.url).join('\n'),
        disabledUrls: ext.disabledUrls.map((u) => u.url).join('\n'),
        active: ext.enabled,
      }));

    const newState = { ...state };

    delete newState.extensions;
    delete newState.preferences;
    delete newState.groups;

    return {
      ...newState,
      extensionRules: {
        entities: newExtensionRules,
      },
    };
  }

  return state;
};
