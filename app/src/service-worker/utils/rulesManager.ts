import { ExtensionRule, GroupRule } from '@/types';
import matchUrl from 'match-url-wildcard';
import { storagePersisted, getDefaultExtensionState, getCurrentTabParams } from '@/lib/utils';
import { markProgrammaticToggle } from './programmaticToggleTracker';

export const manageExtensions = async () => {
  const activeTab = await getCurrentTabParams();
  const tabUrl = activeTab?.url;
  if (!tabUrl) return;

  const extensionRules = await storagePersisted.get('extensionRules');
  const groupRules = await storagePersisted.get('groupRules');

  const individualRules = (extensionRules?.entities ?? []) as ExtensionRule[];
  const groups = (groupRules?.entities ?? []) as GroupRule[];

  const extRuleMap = new Map(individualRules.map((r) => [r.id, r]));
  const extIds = new Set([...individualRules.map((r) => r.id), ...groups.flatMap((g) => g.extensions)]);

  let affectedCount = 0;
  const promises: Promise<void>[] = [];

  for (const extId of extIds) {
    const rule = extRuleMap.get(extId);
    const groupMatches = groups.filter((g) => g.active && g.extensions.includes(extId));

    let enabledPatterns: string[] = [];
    let disabledPatterns: string[] = [];

    const ruleEnabledPatterns = rule?.active
      ? rule.enabledUrls
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const ruleDisabledPatterns = rule?.active
      ? rule.disabledUrls
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // A rule with no patterns at all can never match anything itself, so it shouldn't take
    // precedence over a Group Rule either — otherwise a patternless individual rule would
    // silently and permanently block every group governing this extension.
    if (rule?.active && (ruleEnabledPatterns.length > 0 || ruleDisabledPatterns.length > 0)) {
      enabledPatterns = ruleEnabledPatterns;
      disabledPatterns = ruleDisabledPatterns;
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

    promises.push(
      (async () => {
        const defaultState = await getDefaultExtensionState(extId);
        // If the default was never cached (e.g. the extension was installed after ManageX's
        // last init pass), assume enabled rather than leaving it stuck in whatever state a
        // rule last left it in.
        const defaultEnabled = defaultState ? defaultState.enabled : true;

        let newState: boolean;

        if (shouldDisable) {
          newState = false;
        } else if (shouldEnable) {
          newState = true;
        } else {
          newState = defaultEnabled;
        }

        if (newState !== defaultEnabled) {
          affectedCount++;
          markProgrammaticToggle(extId);
        }

        await chrome.management.setEnabled(extId, newState);
      })(),
    );
  }

  await Promise.all(promises);

  // Set badge with affected count
  chrome.action.setBadgeText({ text: affectedCount > 0 ? String(affectedCount) : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#008085' });
  chrome.action.setBadgeTextColor({ color: '#ffffff' });
};

export function setupRulesManager() {
  manageExtensions();

  chrome.tabs.onUpdated.addListener(manageExtensions);
  chrome.tabs.onActivated.addListener(manageExtensions);
  chrome.storage.onChanged.addListener(manageExtensions);
}
