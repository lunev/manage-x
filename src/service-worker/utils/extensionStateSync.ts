import { removeDefaultExtensionState, toggleDefaultExtensionState } from '@/lib/utils';

// Toggles the saved state of an extension when it's enabled or disabled manually
const handleToggleExtensionState = (extension: chrome.management.ExtensionInfo) => {
  toggleDefaultExtensionState(extension.id);
  console.log('handleToggleExtensionState AAAAA');
};

// Checks if the current active tab is the Chrome extensions page,
// and adds/removes listeners accordingly to track state changes of extensions
const listenTabChange = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isExtensionsPage = tab?.url === 'chrome://extensions/';

  const enabled = chrome.management.onEnabled.hasListener(handleToggleExtensionState);
  const disabled = chrome.management.onDisabled.hasListener(handleToggleExtensionState);

  if (isExtensionsPage) {
    // Add listeners only if they're not already attached
    if (!enabled) chrome.management.onEnabled.addListener(handleToggleExtensionState);
    if (!disabled) chrome.management.onDisabled.addListener(handleToggleExtensionState);
  } else {
    // Remove listeners if not on the extensions page
    if (enabled) chrome.management.onEnabled.removeListener(handleToggleExtensionState);
    if (disabled) chrome.management.onDisabled.removeListener(handleToggleExtensionState);
  }
};

// Registers all listeners related to extension state sync and tab activity
export const registerExtensionListeners = () => {
  // Initial check to set up listeners based on current active tab
  listenTabChange();

  // Re-check when active tab changes
  chrome.tabs.onActivated.addListener(listenTabChange);

  // Re-check when tab content finishes loading
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
    if (changeInfo.status === 'complete') listenTabChange();
  });

  // Remove the extension's saved state when it's uninstalled
  chrome.management.onUninstalled.addListener(removeDefaultExtensionState);
};
