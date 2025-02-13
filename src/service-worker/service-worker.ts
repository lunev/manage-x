import { Extension } from '@/features/extensions/extensions-slice';
import { matchUrl, storagePersisted } from '@/lib/utils';

const checkTab = async () => {
  const extensions = await storagePersisted.get('extensions');
  if (!extensions || !extensions.entities) return;

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    if (!tabs.length || !tabs[0].url) return;
    const tabUrl = tabs[0].url;

    const updatePromises = extensions.entities.map(
      async (extension: Extension) => {
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
            : extension.enabled;
        return chrome.management.setEnabled(extension.id, newState);
      },
    );

    await Promise.all(updatePromises);
  });
};

chrome.tabs.onUpdated.addListener(checkTab);
chrome.tabs.onActivated.addListener(checkTab);
chrome.storage.onChanged.addListener(checkTab);
