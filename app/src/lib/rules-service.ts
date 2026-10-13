import { ExtensionRule, GroupRule } from '@/types';

// Each rule is stored in chrome.storage.sync under its own key, `<prefix><id>`:
//   er:<extensionId> — Extension Rule
//   gr:<groupId>     — Group Rule
const createRulesService = <T extends { id: string }>(prefix: string) => ({
  getAll: async (): Promise<T[]> => {
    const all = await chrome.storage.sync.get(null);
    return Object.entries(all)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value);
  },
  save: (rule: T) => chrome.storage.sync.set({ [prefix + rule.id]: rule }),
  remove: (id: string) => chrome.storage.sync.remove(prefix + id),
});

export const extensionRulesService = createRulesService<ExtensionRule>('er:');
export const groupRulesService = createRulesService<GroupRule>('gr:');
