import { ExtensionPersisted } from '@/types';
import { matchUrl, storagePersisted } from '@/lib/utils';

const checkTab = async () => {
  const extensions = await storagePersisted.get('extensions');
  if (!extensions || !extensions.entities) return;

  let currentTabUrlRules = 0;

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    if (!tabs.length || !tabs[0].url) return;
    const tabUrl = tabs[0].url;

    extensions.entities.forEach((extension: ExtensionPersisted) => {
      const defaultEnabledStatus = extension.enabled;

      const shouldBeDisabled = extension.disabledUrls?.some((item) =>
        matchUrl(item.url, tabUrl),
      );
      const shouldBeEnabled = extension.enabledUrls?.some((item) =>
        matchUrl(item.url, tabUrl),
      );

      if (shouldBeDisabled || shouldBeEnabled) {
        currentTabUrlRules++;
      }

      const newState = shouldBeDisabled
        ? false
        : shouldBeEnabled
          ? true
          : defaultEnabledStatus;

      chrome.management.setEnabled(extension.id, newState);
    });

    updateBadge(currentTabUrlRules);
  });
};

const updateBadge = (count: number) => {
  chrome.action.setBadgeText({ text: count > 0 ? `${count}` : '' });
  chrome.action.setBadgeBackgroundColor({ color: [225, 0, 0, 100] });
};

chrome.tabs.onUpdated.addListener(checkTab);
chrome.tabs.onActivated.addListener(checkTab);
chrome.storage.onChanged.addListener(checkTab);
