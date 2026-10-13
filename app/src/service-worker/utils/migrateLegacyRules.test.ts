import { describe, it, expect, vi, beforeEach } from 'vitest';
import { migrateLegacyRules } from './migrateLegacyRules';

// In-memory stand-ins for chrome.storage.local / chrome.storage.sync, so a test can seed
// what's stored and assert on what the migration actually wrote.
let localData: Record<string, unknown>;
let syncData: Record<string, unknown>;

const pick = (data: Record<string, unknown>, keys: string | string[] | null) =>
  keys === null
    ? { ...data }
    : Object.fromEntries(
        [keys]
          .flat()
          .filter((key) => key in data)
          .map((key) => [key, data[key]]),
      );

// The pre-sync redux-persist format: a JSON blob whose slices are JSON strings themselves.
const legacyBlob = (extensionRules: unknown[], groupRules: unknown[]) =>
  JSON.stringify({
    extensionRules: JSON.stringify({ entities: extensionRules }),
    groupRules: JSON.stringify({ entities: groupRules }),
  });

const extRule = { id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: true };
const groupA = { id: 'grpA', name: 'Work', extensions: ['ext1'], enabledUrls: '', disabledUrls: '', active: true };
const groupB = { id: 'grpB', name: 'Home', extensions: ['ext2'], enabledUrls: '', disabledUrls: '', active: false };

describe('migrateLegacyRules', () => {
  beforeEach(() => {
    localData = {};
    syncData = {};

    vi.mocked(chrome.storage.local.get).mockImplementation(((keys: string | string[] | null) =>
      Promise.resolve(pick(localData, keys))) as typeof chrome.storage.local.get);
    vi.mocked(chrome.storage.local.set).mockImplementation(((items: Record<string, unknown>) => {
      Object.assign(localData, items);
      return Promise.resolve();
    }) as typeof chrome.storage.local.set);

    vi.mocked(chrome.storage.sync.get).mockImplementation(((keys: string | string[] | null) =>
      Promise.resolve(pick(syncData, keys))) as typeof chrome.storage.sync.get);
    vi.mocked(chrome.storage.sync.set).mockImplementation(((items: Record<string, unknown>) => {
      Object.assign(syncData, items);
      return Promise.resolve();
    }) as typeof chrome.storage.sync.set);
  });

  it('copies legacy extension and group rules into sync, one key per rule', async () => {
    localData['persist:localStorage'] = legacyBlob([extRule], [groupA]);

    await migrateLegacyRules();

    expect(syncData['er:ext1']).toEqual(extRule);
    expect(syncData['gr:grpA']).toEqual({ ...groupA, createdAt: 0 });
  });

  it('dates legacy groups by their array position, so their order survives', async () => {
    localData['persist:localStorage'] = legacyBlob([], [groupA, groupB]);

    await migrateLegacyRules();

    expect(syncData['gr:grpA']).toMatchObject({ createdAt: 0 });
    expect(syncData['gr:grpB']).toMatchObject({ createdAt: 1 });
  });

  it("doesn't overwrite a rule another device already synced", async () => {
    const syncedRule = { ...extRule, disabledUrls: 'edited-on-other-device.com' };
    syncData['er:ext1'] = syncedRule;
    localData['persist:localStorage'] = legacyBlob([extRule], []);

    await migrateLegacyRules();

    expect(syncData['er:ext1']).toEqual(syncedRule);
  });

  it('leaves the legacy blob in place as a backup', async () => {
    const blob = legacyBlob([extRule], [groupA]);
    localData['persist:localStorage'] = blob;

    await migrateLegacyRules();

    expect(localData['persist:localStorage']).toBe(blob);
  });

  it('runs only once per device', async () => {
    localData['persist:localStorage'] = legacyBlob([extRule], []);

    await migrateLegacyRules();
    expect(localData.legacyRulesMigrated).toBe(true);

    // A rule deleted after migrating must not be resurrected from the legacy blob.
    delete syncData['er:ext1'];
    await migrateLegacyRules();

    expect(syncData['er:ext1']).toBeUndefined();
  });

  it('marks a fresh install (no legacy rules) as migrated without writing any rules', async () => {
    await migrateLegacyRules();

    expect(syncData).toEqual({});
    expect(localData.legacyRulesMigrated).toBe(true);
  });
});
