import { describe, it, expect, vi, beforeEach } from 'vitest';
import { manageExtensions } from './rulesManager';

const PERSIST_ROOT_KEY = 'persist:localStorage';
const DEFAULT_STATE_KEY = 'defaultExtState';

const mockStoredRules = (
  extensionRuleEntities: unknown[],
  groupRuleEntities: unknown[] = [],
  defaultExtStateEntities: unknown[] = [],
) => {
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
      return Promise.resolve({ [DEFAULT_STATE_KEY]: defaultExtStateEntities });
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
    mockStoredRules([
      { id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true },
    ]);

    await manageExtensions();

    expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', true);
  });

  it('still disables the extension when the current URL matches a disabled pattern', async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'chrome://extensions/' }] as chrome.tabs.Tab[]);
    mockStoredRules([
      { id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'chrome://extensions/', active: true },
    ]);

    await manageExtensions();

    expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false);
  });

  describe('badge counter', () => {
    it('shows the count of extensions a rule actually forces away from their default state', async () => {
      mockStoredRules(
        [{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: true }],
        [],
        [{ id: 'ext1', name: 'AdBlocker', enabled: true }],
      );

      await manageExtensions();

      expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    });

    it('clears the badge when the rule-forced state already matches the cached default (nothing actually overridden)', async () => {
      mockStoredRules(
        [{ id: 'ext1', name: 'AdBlocker', enabledUrls: 'example.com', disabledUrls: '', active: true }],
        [],
        [{ id: 'ext1', name: 'AdBlocker', enabled: true }],
      );

      await manageExtensions();

      expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', true);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    });

    it('sums the count across multiple affected extensions', async () => {
      mockStoredRules(
        [
          { id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: true },
          { id: 'ext2', name: 'Tracker', enabledUrls: '', disabledUrls: 'example.com', active: true },
        ],
        [],
        [
          { id: 'ext1', name: 'AdBlocker', enabled: true },
          { id: 'ext2', name: 'Tracker', enabled: true },
        ],
      );

      await manageExtensions();

      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '2' });
    });

    it('drops out of the count once its rule is toggled inactive', async () => {
      const defaultState = [{ id: 'ext1', name: 'AdBlocker', enabled: true }];
      mockStoredRules(
        [{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: true }],
        [],
        defaultState,
      );
      await manageExtensions();
      expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '1' });

      mockStoredRules(
        [{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: false }],
        [],
        defaultState,
      );
      await manageExtensions();
      expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' });
    });

    it('drops out of the count once its rule is deleted entirely', async () => {
      const defaultState = [{ id: 'ext1', name: 'AdBlocker', enabled: true }];
      mockStoredRules(
        [{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: true }],
        [],
        defaultState,
      );
      await manageExtensions();
      expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '1' });

      // Rule removed entirely (not just deactivated) — no entities reference ext1 at all.
      mockStoredRules([], [], defaultState);
      await manageExtensions();

      // ext1 no longer appears in extIds at all, so setEnabled shouldn't even be called
      // for it on this pass, and it can't contribute to the count.
      expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' });
    });

    it('counts an extension forced enabled/disabled by an active Group Rule the same as an Extension Rule', async () => {
      mockStoredRules(
        [],
        [
          {
            id: 'grp1',
            name: 'Streaming Sites',
            extensions: ['ext1'],
            enabledUrls: '',
            disabledUrls: 'example.com',
            active: true,
          },
        ],
        [{ id: 'ext1', name: 'AdBlocker', enabled: true }],
      );

      await manageExtensions();

      expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    });

    it('drops out of the count once its Group Rule is toggled inactive', async () => {
      const defaultState = [{ id: 'ext1', name: 'AdBlocker', enabled: true }];
      const group = {
        id: 'grp1',
        name: 'Streaming Sites',
        extensions: ['ext1'],
        enabledUrls: '',
        disabledUrls: 'example.com',
        active: true,
      };
      mockStoredRules([], [group], defaultState);
      await manageExtensions();
      expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '1' });

      mockStoredRules([], [{ ...group, active: false }], defaultState);
      await manageExtensions();
      expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' });
    });

    it('ignores an active Extension Rule that does not match the current URL even if an active Group Rule would', async () => {
      // Regression case for the precedence rule shared with useGoverningRule: an active
      // Extension Rule for an extension always wins over any Group Rule containing it, even
      // when the Extension Rule's own patterns don't match the current page — so the extension
      // should fall back to its default state here, not the Group Rule's forced state.
      mockStoredRules(
        [{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'other-site.com', active: true }],
        [
          {
            id: 'grp1',
            name: 'Streaming Sites',
            extensions: ['ext1'],
            enabledUrls: '',
            disabledUrls: 'example.com',
            active: true,
          },
        ],
        [{ id: 'ext1', name: 'AdBlocker', enabled: true }],
      );

      await manageExtensions();

      expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', true);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' });
    });

    // Regression test: an active Extension Rule with no URLs at all (allowed to be saved as
    // of v2.0.28) used to still take precedence over a Group Rule via the same rule?.active
    // check as a rule with real patterns — permanently and silently blocking the group with
    // no way to fix it, since an empty rule also has no UI path to be deleted or edited back
    // to inactive. An empty rule should have no effect and the Group Rule should still apply.
    it('lets an active Group Rule apply when the Extension Rule for that extension has no URLs saved', async () => {
      mockStoredRules(
        [{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: '', active: true }],
        [
          {
            id: 'grp1',
            name: 'Streaming Sites',
            extensions: ['ext1'],
            enabledUrls: '',
            disabledUrls: 'example.com',
            active: true,
          },
        ],
        [{ id: 'ext1', name: 'AdBlocker', enabled: true }],
      );

      await manageExtensions();

      expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false);
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    });

    // Documents a real bug rather than desired behavior: rules can reference an extension
    // that's since been uninstalled (chrome.management.setEnabled then rejects for that id).
    // None of the per-extension promises in manageExtensions have a .catch(), so Promise.all
    // rejects, manageExtensions itself throws, and the badge-setting code never runs — even
    // for every *other* extension whose own setEnabled call succeeded. The badge is left
    // showing whatever stale count it had before, with no indication anything went wrong.
    it('BUG: one stale rule referencing an uninstalled extension blocks the badge from updating at all', async () => {
      mockStoredRules(
        [
          { id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: true },
          { id: 'ext2', name: 'Uninstalled', enabledUrls: '', disabledUrls: 'example.com', active: true },
        ],
        [],
        [
          { id: 'ext1', name: 'AdBlocker', enabled: true },
          { id: 'ext2', name: 'Uninstalled', enabled: true },
        ],
      );
      vi.mocked(chrome.management.setEnabled).mockImplementation(((id: string) => {
        if (id === 'ext2') return Promise.reject(new Error('No such extension: ext2'));
        return Promise.resolve();
      }) as typeof chrome.management.setEnabled);

      await expect(manageExtensions()).rejects.toThrow();

      // ext1's setEnabled call did succeed...
      expect(chrome.management.setEnabled).toHaveBeenCalledWith('ext1', false);
      // ...but the badge never gets set at all, for either extension.
      expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
    });
  });
});
