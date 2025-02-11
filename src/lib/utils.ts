import { STORAGE_KEY_ROOT } from '@/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const matchUrl = (pattern: string, url: string) => {
  const urlObj = new URL(url);

  if (pattern === urlObj.hostname) {
    return true;
  }

  const wildcardPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  if (wildcardPattern.test(urlObj.hostname)) {
    return true;
  }

  const regexPattern = new RegExp(pattern);
  if (regexPattern.test(url)) {
    return true;
  }

  return false;
};

export const getSelfId = () => {
  return new Promise((resolve, reject) => {
    chrome.management.getSelf((extensionInfo) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(extensionInfo.id);
      }
    });
  });
};

export const storagePersisted = {
  get: async (key: string) => {
    const data = await chrome.storage.sync.get([STORAGE_KEY_ROOT]);
    const rootData = data[STORAGE_KEY_ROOT];
    if (rootData) {
      try {
        const storage = JSON.parse(rootData);
        return JSON.parse(storage[key]);
      } catch (parseError) {
        console.log('Error parsing stored data:', parseError);
      }
    } else {
      console.log('No data found for the key:', key);
    }
  },
  listen: (callback: (changes: unknown) => void) => {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes) {
        callback(changes);
      }
    });
  },
};
