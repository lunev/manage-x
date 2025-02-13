import { Extension } from '@/features/extensions/extensions-slice';
import { matchUrl, storagePersisted } from '@/lib/utils';

const checkTab = async () => {
  let activeUrlRules = 0;
  const extensions = await storagePersisted.get('extensions');
  if (!extensions || !extensions.entities) return;

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    if (!tabs.length || !tabs[0].url) return;
    const tabUrl = tabs[0].url;

    const updatePromises = extensions.entities.map(
      (extension: Extension) =>
        new Promise<void>((resolve, reject) => {
          const shouldBeDisabled = extension.disabledUrls?.some((item) =>
            matchUrl(item.url, tabUrl),
          );
          const shouldBeEnabled = extension.enabledUrls?.some((item) =>
            matchUrl(item.url, tabUrl),
          );

          if (shouldBeDisabled || shouldBeEnabled) {
            activeUrlRules++;
          }

          const newState = shouldBeDisabled
            ? false
            : shouldBeEnabled
              ? true
              : extension.enabled;

          chrome.management.setEnabled(extension.id, newState, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        }),
    );

    await Promise.all(updatePromises);

    updateBadge(activeUrlRules);
  });
};

const updateBadge = (count: number) => {
  chrome.action.setBadgeText({ text: count > 0 ? `${count}` : '' });
  chrome.action.setBadgeBackgroundColor({ color: [225, 0, 0, 100] });
};

chrome.tabs.onUpdated.addListener(checkTab);
chrome.tabs.onActivated.addListener(checkTab);
chrome.storage.onChanged.addListener(checkTab);
