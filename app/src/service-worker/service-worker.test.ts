import { describe, it, expect, vi } from 'vitest';

// A rule disables an extension while on chrome://extensions/, then the user switches to a
// tab that matches no rule (https://github.com/). The extension must go back to its default
// (enabled) state, and the rule-driven disable must not get misread as a manual toggle and
// overwrite that recorded default (see programmaticToggleTracker.ts). This exercises the real
// interplay between rulesManager's manageExtensions() and service-worker.ts's
// syncExtensionState()/handleToggleExtensionState(), not just manageExtensions() in isolation.

const PERSIST_ROOT_KEY = 'persist:localStorage';
const DEFAULT_STATE_KEY = 'defaultExtState';

describe('service worker: rule-driven disable on chrome://extensions/ then navigate away', () => {
  it('re-enables the extension once the tab no longer matches the disabled pattern', async () => {
    let store: Record<string, unknown> = {
      [PERSIST_ROOT_KEY]: JSON.stringify({
        extensionRules: JSON.stringify({
          entities: [
            { id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'chrome://extensions/*', active: true },
          ],
        }),
        groupRules: JSON.stringify({ entities: [] }),
      }),
      [DEFAULT_STATE_KEY]: [{ id: 'ext1', name: 'AdBlocker', enabled: true }],
    };

    vi.mocked(chrome.storage.local.get).mockImplementation(((keys: unknown) => {
      const key = (Array.isArray(keys) ? keys[0] : keys) as string;
      return Promise.resolve({ [key]: store[key] });
    }) as typeof chrome.storage.local.get);

    vi.mocked(chrome.storage.local.set).mockImplementation(((items: Record<string, unknown>) => {
      store = { ...store, ...items };
      return Promise.resolve();
    }) as typeof chrome.storage.local.set);

    const onEnabledListeners: Array<(ext: chrome.management.ExtensionInfo) => void> = [];
    const onDisabledListeners: Array<(ext: chrome.management.ExtensionInfo) => void> = [];
    vi.mocked(chrome.management.onEnabled.addListener).mockImplementation(((fn: (ext: chrome.management.ExtensionInfo) => void) =>
      onEnabledListeners.push(fn)) as typeof chrome.management.onEnabled.addListener);
    vi.mocked(chrome.management.onDisabled.addListener).mockImplementation(((fn: (ext: chrome.management.ExtensionInfo) => void) =>
      onDisabledListeners.push(fn)) as typeof chrome.management.onDisabled.addListener);
    vi.mocked(chrome.management.onEnabled.removeListener).mockImplementation(((fn: (ext: chrome.management.ExtensionInfo) => void) => {
      const idx = onEnabledListeners.indexOf(fn);
      if (idx >= 0) onEnabledListeners.splice(idx, 1);
    }) as typeof chrome.management.onEnabled.removeListener);
    vi.mocked(chrome.management.onDisabled.removeListener).mockImplementation(((fn: (ext: chrome.management.ExtensionInfo) => void) => {
      const idx = onDisabledListeners.indexOf(fn);
      if (idx >= 0) onDisabledListeners.splice(idx, 1);
    }) as typeof chrome.management.onDisabled.removeListener);

    const managementState: Record<string, boolean> = { ext1: true };
    vi.mocked(chrome.management.setEnabled).mockImplementation(((id: string, enabled: boolean) => {
      managementState[id] = enabled;
      // Mirrors real Chrome: setEnabled firing management.onEnabled/onDisabled for listeners
      // currently registered at the moment the state actually changes.
      const listeners = enabled ? onEnabledListeners : onDisabledListeners;
      listeners.slice().forEach((fn) => fn({ id, enabled } as unknown as chrome.management.ExtensionInfo));
      return Promise.resolve();
    }) as typeof chrome.management.setEnabled);

    let currentTabUrl = 'https://example.com';
    vi.mocked(chrome.tabs.query).mockImplementation(
      () => Promise.resolve([{ url: currentTabUrl }] as chrome.tabs.Tab[]) as ReturnType<typeof chrome.tabs.query>,
    );

    const activatedListeners: Array<() => void | Promise<void>> = [];
    vi.mocked(chrome.tabs.onActivated.addListener).mockImplementation(((fn: () => void | Promise<void>) =>
      activatedListeners.push(fn)) as typeof chrome.tabs.onActivated.addListener);

    const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

    await import('./service-worker');
    await flush(); // let the module's initial run (tab url still example.com) settle

    // Step 1: navigate to chrome://extensions/ — the rule should disable ext1.
    currentTabUrl = 'chrome://extensions/';
    await Promise.all(activatedListeners.map((fn) => fn()));
    await flush();

    expect(managementState.ext1).toBe(false);
    // The disable was rule-driven (programmatic), not a manual toggle — the recorded
    // default must NOT have been overwritten to disabled by handleToggleExtensionState.
    expect((store[DEFAULT_STATE_KEY] as Array<{ id: string; enabled: boolean }>).find((e) => e.id === 'ext1')?.enabled).toBe(
      true,
    );

    // Step 2: switch to a tab that matches no rule — ext1 should go back to its default (enabled).
    currentTabUrl = 'https://github.com/';
    await Promise.all(activatedListeners.map((fn) => fn()));
    await flush();

    expect(managementState.ext1).toBe(true);
  });
});
