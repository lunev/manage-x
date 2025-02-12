import { matchUrl, storagePersisted } from '@/lib/utils';

const checkAndDisable = async (tabUrl: string) => {
  const extensions = await storagePersisted.get('extensions');
  if (!extensions || !extensions.entities) return;

  for (const extension of extensions.entities) {
    if (extension.disabledUrls.length > 0) {
      const shouldBeDisabled = extension.disabledUrls.some(
        (item: { url: string }) => matchUrl(item.url, tabUrl),
      );
      chrome.management.setEnabled(
        extension.id,
        shouldBeDisabled ? false : extension.enabled,
      );
    }
  }
};

chrome.tabs.onUpdated.addListener(async (_tabId, _info, tab) => {
  if (tab.url) {
    checkAndDisable(tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    checkAndDisable(tab.url);
  }
});
