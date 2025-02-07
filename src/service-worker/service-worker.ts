chrome.storage.sync.get('persist:syncStorage', (data) => {
  if (chrome.runtime.lastError) {
    return;
  }

  if (data['persist:syncStorage']) {
    const parsedStorage = JSON.parse(data['persist:syncStorage']);
    const { preferences } = parsedStorage;

    chrome.sidePanel
      .setPanelBehavior({
        openPanelOnActionClick: JSON.parse(preferences).sidePanel.active,
      })
      .catch((error) => console.error(error));
  }
});

chrome.storage.onChanged.addListener((changes) => {
  const parsedStorage = changes['persist:syncStorage'].newValue;

  if (parsedStorage) {
    const { preferences } = JSON.parse(parsedStorage);

    chrome.sidePanel
      .setPanelBehavior({
        openPanelOnActionClick: JSON.parse(preferences).sidePanel.active,
      })
      .catch((error) => console.error(error));
  }
});
