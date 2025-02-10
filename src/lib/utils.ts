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
