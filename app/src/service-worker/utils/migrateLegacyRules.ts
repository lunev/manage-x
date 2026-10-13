import { STORAGE_KEYS } from '@/constants';
import { ExtensionRule, GroupRule } from '@/types';
import { storagePersisted } from '@/lib/utils';
import { extensionRulesService, groupRulesService } from '@/lib/rules-service';

/**
 * Moves this device's pre-sync rules (the redux-persist blob in chrome.storage.local) into
 * chrome.storage.sync, once. The done flag is in chrome.storage.local because every device
 * has to migrate its own rules. Rules already in sync (e.g. from a device that migrated
 * first) are left alone. The legacy blob is kept as a backup.
 */
export const migrateLegacyRules = async () => {
  const { [STORAGE_KEYS.legacyRulesMigrated]: migrated } = await chrome.storage.local.get(
    STORAGE_KEYS.legacyRulesMigrated,
  );
  if (migrated) return;

  const extensionRules: ExtensionRule[] = (await storagePersisted.get('extensionRules'))?.entities ?? [];
  const groupRules: GroupRule[] = (await storagePersisted.get('groupRules'))?.entities ?? [];

  const syncedExtensionIds = new Set((await extensionRulesService.getAll()).map((rule) => rule.id));
  const syncedGroupIds = new Set((await groupRulesService.getAll()).map((rule) => rule.id));

  await extensionRulesService.saveAll(extensionRules.filter((rule) => !syncedExtensionIds.has(rule.id)));
  await groupRulesService.saveAll(
    groupRules
      // Keep the current group order: legacy groups have no createdAt, so use their array position.
      .map((rule, index) => ({ ...rule, createdAt: rule.createdAt ?? index }))
      .filter((rule) => !syncedGroupIds.has(rule.id)),
  );

  await chrome.storage.local.set({ [STORAGE_KEYS.legacyRulesMigrated]: true });
};
