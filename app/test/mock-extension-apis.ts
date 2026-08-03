import { vi } from 'vitest';

global.chrome = {
  storage: {
    sync: {
      set: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      listen: vi.fn(),
    },
    local: {
      set: vi.fn().mockImplementation((_items, cb?: () => void) => {
        if (cb) {
          cb();
          return;
        }
        return Promise.resolve();
      }),
      get: vi.fn().mockImplementation((_keys, cb?: (result: Record<string, unknown>) => void) => {
        if (cb) {
          cb({});
          return;
        }
        return Promise.resolve({});
      }),
      remove: vi.fn().mockImplementation((_keys, cb?: () => void) => {
        if (cb) {
          cb();
          return;
        }
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([{ url: 'https://example.com' }]),
    create: vi
      .fn()
      .mockImplementation((props) => Promise.resolve({ ...props })),
    update: vi
      .fn()
      .mockImplementation((props) => Promise.resolve({ ...props })),
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onActivated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onCreated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    id: 'test-extension-id',
    onInstalled: {
      addListener: vi.fn(),
    },
    openOptionsPage: vi.fn(),
    lastError: undefined,
    getManifest: vi.fn().mockReturnValue({ version: '0.0.0' }),
  },
  management: {
    getAll: vi.fn().mockImplementation((cb?: (result: unknown[]) => void) => {
      if (cb) {
        cb([]);
        return;
      }
      return Promise.resolve([]);
    }),
    setEnabled: vi.fn().mockImplementation((_id, _enabled, cb?: () => void) => {
      if (cb) {
        cb();
        return;
      }
      return Promise.resolve();
    }),
    onEnabled: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onDisabled: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    onUninstalled: {
      addListener: vi.fn(),
    },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeTextColor: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  tts: {
    speak: vi.fn(),
    stop: vi.fn(),
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: {
      addListener: vi.fn(),
    },
  },
} as unknown as typeof chrome;
