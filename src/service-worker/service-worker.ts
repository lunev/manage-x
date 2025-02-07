import { STORAGE_KEY_ROOT } from '@/constants';

chrome.storage.sync.get(STORAGE_KEY_ROOT, (data) => {
  if (chrome.runtime.lastError) {
    return;
  }
  if (data[STORAGE_KEY_ROOT]) {
    const parsedStorage = JSON.parse(data[STORAGE_KEY_ROOT]);
    const { preferences } = parsedStorage;
    chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: JSON.parse(preferences).sidePanel.active,
    });
  }
});

chrome.storage.onChanged.addListener((changes) => {
  const parsedStorage = changes[STORAGE_KEY_ROOT].newValue;
  if (parsedStorage) {
    const { preferences } = JSON.parse(parsedStorage);
    chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: JSON.parse(preferences).sidePanel.active,
    });
  }
});
