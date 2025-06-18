import {
  addDefaultExtensionState,
  getCurrentTabParams,
  initDefaultExtensionsState,
  removeDefaultExtensionState,
  setDefaultExtensionState,
} from '@/lib/utils';
import { setupRulesManager } from './utils/rulesManager';

/**
 * On extension install or update:
 * Save the current state (enabled/disabled) of all installed extensions.
 * This allows restoring them to their original state later.
 */
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    await initDefaultExtensionsState();
  }
});

/**
 * When a new extension is installed by the user or system:
 * Add its state to the stored default extension states.
 */
chrome.management.onInstalled.addListener(async (installedExtension) => {
  await addDefaultExtensionState(installedExtension);
});

/**
 * When an extension is uninstalled:
 * Remove its state record from the default extension states.
 */
chrome.management.onUninstalled.addListener(async (uninstalledExtension) => {
  await removeDefaultExtensionState(uninstalledExtension);
});

/**
 * Initialize the rules manager that automatically enables/disables
 * extensions based on matched URLs or group rules.
 */
setupRulesManager();

/**
 * Stores the user's manual enable/disable actions from chrome://extensions
 * by updating the saved default state of that extension.
 */
const handleToggleExtensionState = async (extension: chrome.management.ExtensionInfo) => {
  await setDefaultExtensionState(extension.id, extension.enabled);
};

/**
 * Checks if the active tab is the system `chrome://extensions/` page.
 * If so, listen for manual toggles (enable/disable) and persist them.
 * Otherwise, remove those listeners to avoid duplication.
 */
const syncExtensionState = async () => {
  const currentTab = await getCurrentTabParams();
  const isSystemExtensionsPage = currentTab?.url?.includes('chrome://extensions/');

  if (isSystemExtensionsPage) {
    chrome.management.onEnabled.addListener(handleToggleExtensionState);
    chrome.management.onDisabled.addListener(handleToggleExtensionState);
  } else {
    chrome.management.onEnabled.removeListener(handleToggleExtensionState);
    chrome.management.onDisabled.removeListener(handleToggleExtensionState);
  }
};

// Keep extension state synced on navigation and tab changes
chrome.tabs.onUpdated.addListener(syncExtensionState);
chrome.tabs.onActivated.addListener(syncExtensionState);
chrome.tabs.onCreated.addListener(syncExtensionState);

// Initial run
syncExtensionState();
