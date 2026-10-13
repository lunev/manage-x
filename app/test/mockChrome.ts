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

/**
 * Stateful chrome.storage.sync: get/set/remove work on an in-memory object, and set/remove
 * notify chrome.storage.onChanged listeners like the real API — so a component that writes a
 * rule and re-reads it via useRules() updates in tests too.
 */
export const mockSyncStorage = (initial: Record<string, unknown> = {}) => {
  const data: Record<string, unknown> = { ...initial };
  const listeners = new Set<(changes: object, areaName: string) => void>();
  const notify = () => listeners.forEach((listener) => listener({}, 'sync'));

  vi.mocked(chrome.storage.onChanged.addListener).mockImplementation(((
    listener: (changes: object, areaName: string) => void,
  ) => listeners.add(listener)) as typeof chrome.storage.onChanged.addListener);
  vi.mocked(chrome.storage.onChanged.removeListener).mockImplementation(((
    listener: (changes: object, areaName: string) => void,
  ) => listeners.delete(listener)) as typeof chrome.storage.onChanged.removeListener);

  vi.mocked(chrome.storage.sync.get).mockImplementation((() =>
    Promise.resolve({ ...data })) as typeof chrome.storage.sync.get);
  vi.mocked(chrome.storage.sync.set).mockImplementation(((items: Record<string, unknown>) => {
    Object.assign(data, items);
    notify();
    return Promise.resolve();
  }) as typeof chrome.storage.sync.set);
  vi.mocked(chrome.storage.sync.remove).mockImplementation(((key: string) => {
    delete data[key];
    notify();
    return Promise.resolve();
  }) as typeof chrome.storage.sync.remove);

  return data;
};

export const mockStorageLocalGet = (value: Record<string, unknown>) => {
  vi.mocked(chrome.storage.local.get).mockImplementation((() =>
    Promise.resolve(value)) as typeof chrome.storage.local.get);
};
