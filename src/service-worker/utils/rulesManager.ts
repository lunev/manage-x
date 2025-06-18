import { ExtensionRule, GroupRule } from '@/types';
import matchUrl from 'match-url-wildcard';
import { storagePersisted, getDefaultExtensionState, getCurrentTabParams } from '@/lib/utils';

export const manageExtensions = async () => {
  const activeTab = await getCurrentTabParams();
  const tabUrl = activeTab?.url;
  if (!tabUrl) return;

  const extensionRules = await storagePersisted.get('extensionRules');
  const groupRules = await storagePersisted.get('groupRules');

  const individualRules = (extensionRules?.entities ?? []) as ExtensionRule[];
  const groups = (groupRules?.entities ?? []) as GroupRule[];

  const extRuleMap = new Map(individualRules.map((r) => [r.id, r]));

  for (const extId of new Set([...individualRules.map((r) => r.id), ...groups.flatMap((g) => g.extensions)])) {
    const rule = extRuleMap.get(extId);
    const groupMatches = groups.filter((g) => g.active && g.extensions.includes(extId));

    let enabledPatterns: string[] = [];
    let disabledPatterns: string[] = [];

    if (rule?.active) {
      enabledPatterns = rule.enabledUrls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      disabledPatterns = rule.disabledUrls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (groupMatches.length > 0) {
      for (const group of groupMatches) {
        enabledPatterns.push(
          ...group.enabledUrls
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        );
        disabledPatterns.push(
          ...group.disabledUrls
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }
    }

    const shouldDisable = disabledPatterns.some((pattern) => matchUrl(tabUrl, pattern));
    const shouldEnable = enabledPatterns.some((pattern) => matchUrl(tabUrl, pattern));

    const defaultState = await getDefaultExtensionState(extId);

    if (shouldDisable) {
      await chrome.management.setEnabled(extId, false);
    } else if (shouldEnable) {
      await chrome.management.setEnabled(extId, true);
    } else {
      await chrome.management.setEnabled(extId, defaultState.enabled);
    }
  }
};

export function setupRulesManager() {
  manageExtensions();

  chrome.tabs.onUpdated.addListener(manageExtensions);
  chrome.tabs.onActivated.addListener(manageExtensions);
  chrome.storage.onChanged.addListener(manageExtensions);
}
