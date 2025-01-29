import { vi } from 'vitest';

global.chrome = {
  storage: {
    sync: {
      set: vi.fn(),
      get: vi.fn(),
      remove: vi.fn(),
      listen: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    create: vi
      .fn()
      .mockImplementation((props) => Promise.resolve({ ...props })),
    update: vi
      .fn()
      .mockImplementation((props) => Promise.resolve({ ...props })),
  },
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    openOptionsPage: vi.fn(),
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
