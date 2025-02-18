import { ExtensionPersisted } from '@/types';
import { matchUrl, storagePersisted } from '@/lib/utils';

const checkTab = async () => {
  const extensions = await storagePersisted.get('extensions');
  if (!extensions?.entities) return;

  let currentTabUrlRules = 0;

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    if (!tabs.length || !tabs[0].url) return;
    const tabUrl = tabs[0].url;

    const extensionPromises = extensions.entities.map(
      (extension: ExtensionPersisted) => {
        return new Promise<void>((resolve) => {
          const defaultEnabledStatus = extension.enabled;

          const shouldBeDisabled = extension.disabledUrls?.some((item) =>
            matchUrl(item.url, tabUrl),
          );
          const shouldBeEnabled = extension.enabledUrls?.some((item) =>
            matchUrl(item.url, tabUrl),
          );

          const newState = shouldBeDisabled
            ? false
            : shouldBeEnabled
              ? true
              : defaultEnabledStatus;

          chrome.management.get(extension.id, () => {
            if (!chrome.runtime.lastError) {
              chrome.management.setEnabled(extension.id, newState);
              if (shouldBeDisabled || shouldBeEnabled) {
                currentTabUrlRules++;
              }
            }
            resolve();
          });
        });
      },
    );

    await Promise.all(extensionPromises);

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
chrome.management.onUninstalled.addListener(checkTab);
