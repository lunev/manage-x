import { vi } from 'vitest';

export type MockExtension = Partial<Omit<chrome.management.ExtensionInfo, 'icons'>> & {
  id: string;
  name: string;
  enabled: boolean;
  icons?: { url: string }[];
};

export const mockManagementGetAll = (extensions: MockExtension[]) => {
  vi.mocked(chrome.management.getAll).mockImplementation(((cb: (result: chrome.management.ExtensionInfo[]) => void) =>
    cb(extensions as chrome.management.ExtensionInfo[])) as typeof chrome.management.getAll);
};

export const mockStorageLocalGet = (value: Record<string, unknown>) => {
  vi.mocked(chrome.storage.local.get).mockImplementation((() => Promise.resolve(value)) as typeof chrome.storage.local.get);
};
