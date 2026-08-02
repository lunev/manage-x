import { describe, it, expect, vi, beforeEach } from 'vitest';
import { manageExtensions } from './rulesManager';

const PERSIST_ROOT_KEY = 'persist:localStorage';
const DEFAULT_STATE_KEY = 'defaultExtState';

const mockStoredRules = (extensionRuleEntities: unknown[], groupRuleEntities: unknown[] = []) => {
  vi.mocked(chrome.storage.local.get).mockImplementation(((keys: unknown) => {
    const key = Array.isArray(keys) ? keys[0] : keys;
    if (key === PERSIST_ROOT_KEY) {
      return Promise.resolve({
        [PERSIST_ROOT_KEY]: JSON.stringify({
          extensionRules: JSON.stringify({ entities: extensionRuleEntities }),
          groupRules: JSON.stringify({ entities: groupRuleEntities }),
        }),
      });
    }
    if (key === DEFAULT_STATE_KEY) {
      return Promise.resolve({});
    }
    return Promise.resolve({});
  }) as typeof chrome.storage.local.get);
};

describe('manageExtensions', () => {
  beforeEach(() => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com' }] as chrome.tabs.Tab[]);
  });

  // Regression scenario: an extension's default enabled/disabled state was never cached
  // (e.g. it was installed after ManageX's last init pass). When no rule matches the current
  // URL, the engine must assume "enabled" as the fallback instead of leaving the extension
  // stuck in whatever state a previous rule left it in.
  it('assumes enabled when no rule matches and the default state was never cached', async () => {
    mockStoredRules([{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true }]);

    await manageExtensions();

    expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', true);
  });

  it('still disables the extension when the current URL matches a disabled pattern', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'chrome://extensions/' }] as chrome.tabs.Tab[]);
    mockStoredRules([{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true }]);

    await manageExtensions();

    expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false);
  });
});
