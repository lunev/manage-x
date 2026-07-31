import { STORAGE_KEY_ROOT, STORAGE_KEYS } from '@/constants';
import { ExtensionDefaultState } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const storagePersisted = {
  get: async (key: string) => {
    const data = await chrome.storage.local.get([STORAGE_KEY_ROOT]);
    const rootData = data[STORAGE_KEY_ROOT];
    if (rootData) {
      try {
        const storage = JSON.parse(rootData);
        return storage[key] ? JSON.parse(storage[key]) : undefined;
      } catch (parseError) {
        console.log('Error parsing stored data:', parseError);
      }
    } else {
      console.log('No data found for the key:', key);
    }
  },
};

const updateDefaultExtensionState = async (updatedState: ExtensionDefaultState[]) => {
  await chrome.storage.local.set({
    [STORAGE_KEYS.defaultExtensionsState]: updatedState,
  });
};

export const getCurrentTabParams = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

export const fetchDefaultExtensionsState = async () => {
  const { [STORAGE_KEYS.defaultExtensionsState]: defaultExtStateArr } = await chrome.storage.local.get(
    STORAGE_KEYS.defaultExtensionsState,
  );
  return defaultExtStateArr;
};

export const initDefaultExtensionsState = async () => {
  // Gets all installed extensions
  const extensions = await chrome.management.getAll();

  // Extensions already tracked keep their recorded default as-is: re-snapshotting their
  // *current* enabled state here would wrongly treat a rule-imposed state as the new
  // baseline (e.g. on a manual reload of this extension while a rule has something disabled).
  const existingExtStateArr: ExtensionDefaultState[] = (await fetchDefaultExtensionsState()) ?? [];
  const existingIds = new Set(existingExtStateArr.map((ext) => ext.id));

  // Only extensions not tracked yet (this extension excluded) get a fresh baseline entry.
  const newEntries: ExtensionDefaultState[] = extensions
    .filter((ext) => ext.id !== chrome.runtime.id && !existingIds.has(ext.id))
    .map((ext) => ({
      id: ext.id,
      name: ext.name,
      enabled: ext.enabled,
    }));

  if (newEntries.length > 0) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.defaultExtensionsState]: [...existingExtStateArr, ...newEntries],
    });
  }
};

export const getDefaultExtensionState = async (id: string) => {
  try {
    // Retrieves the saved default extension states from storage
    const defaultExtStateArr = await fetchDefaultExtensionsState();
    const extension = defaultExtStateArr.find((ext: chrome.management.ExtensionInfo) => ext.id === id);

    return extension;
  } catch (error) {
    console.error('Unable to get the extension state', error);
  }
};

export const toggleDefaultExtensionState = async (id: string) => {
  try {
    // Retrieves the saved default extension states from storage
    const defaultExtStateArr = await fetchDefaultExtensionsState();

    // Toggles the 'enabled' state for the specified extension ID
    const updatedExtState = defaultExtStateArr.map((ext: chrome.management.ExtensionInfo) => {
      if (ext.id === id) {
        return {
          ...ext,
          enabled: !ext.enabled,
        };
      }
      return ext;
    });

    // Saves the updated extensions state back to chrome.storage
    await updateDefaultExtensionState(updatedExtState);
  } catch (error) {
    console.error('Unable to change the extension state.', error);
  }
};

export const addDefaultExtensionState = async (installedExtension: chrome.management.ExtensionInfo) => {
  try {
    // Retrieves the saved default extension states from storage
    const defaultExtStateArr = await fetchDefaultExtensionsState();

    const existedInstalledExtension = defaultExtStateArr.find(
      (ext: chrome.management.ExtensionInfo) => ext.id === installedExtension.id,
    );

    // Add installed extensions state to chrome.storage
    if (!existedInstalledExtension) {
      const updatedExtState = [
        ...defaultExtStateArr,
        {
          id: installedExtension.id,
          name: installedExtension.name,
          enabled: installedExtension.enabled,
        },
      ];

      // Saves the updated extensions state back to chrome.storage
      await updateDefaultExtensionState(updatedExtState);
    }
  } catch (error) {
    console.error('Unable to add the extension to the state.', error);
  }
};

export const removeDefaultExtensionState = async (id: string) => {
  try {
    // Retrieves the saved default extension states from storage
    const defaultExtStateArr = await fetchDefaultExtensionsState();
    const existedExtension = defaultExtStateArr.find((ext: chrome.management.ExtensionInfo) => ext.id === id);

    // Saves the updated extensions state back to chrome.storage
    if (existedExtension) {
      const updatedExtState = defaultExtStateArr.filter((ext: chrome.management.ExtensionInfo) => ext.id !== id);
      await updateDefaultExtensionState(updatedExtState);
    }
  } catch (error) {
    console.error('Unable to remove the extension from the state.', error);
  }
};

export const setDefaultExtensionState = async (id: string, enabled: boolean) => {
  try {
    // Retrieves the saved default extension states from storage
    const defaultExtStateArr = await fetchDefaultExtensionsState();

    // Toggles the 'enabled' state for the specified extension ID
    const updatedExtState = defaultExtStateArr.map((ext: chrome.management.ExtensionInfo) => {
      if (ext.id === id) {
        return {
          ...ext,
          enabled,
        };
      }
      return ext;
    });

    // Saves the updated extensions state back to chrome.storage
    await updateDefaultExtensionState(updatedExtState);
  } catch (error) {
    console.error('Unable to set the extension state.', error);
  }
};

export const setPendingUpdateVersion = async (version: string) => {
  await chrome.storage.local.set({ [STORAGE_KEYS.pendingUpdateVersion]: version });
};

export const getPendingUpdateVersion = async (): Promise<string | undefined> => {
  const { [STORAGE_KEYS.pendingUpdateVersion]: version } = await chrome.storage.local.get(
    STORAGE_KEYS.pendingUpdateVersion,
  );
  return version;
};

export const clearPendingUpdateVersion = async () => {
  await chrome.storage.local.remove(STORAGE_KEYS.pendingUpdateVersion);
};

// Helper to merge URLs
export const mergeUrlStrings = (oldStr: string, newStr: string): string => {
  const oldUrls = oldStr
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const newUrls = newStr
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const mergedSet = new Set([...oldUrls, ...newUrls]);

  return Array.from(mergedSet).join('\n');
};

// Helper to merge arrays of strings
export const mergeStringArrays = (a: string[], b: string[]): string[] => {
  const mergedSet = new Set([...a, ...b]);
  return Array.from(mergedSet);
};
