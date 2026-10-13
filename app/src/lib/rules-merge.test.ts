import { describe, it, expect } from 'vitest';
import { mergeExtensionRules, mergeGroupRules } from './rules-merge';

const extRule = { id: 'ext1', name: 'AdBlocker', enabledUrls: 'a.com', disabledUrls: '', active: true };
const groupRule = {
  id: 'grp1',
  name: 'Work',
  extensions: ['ext1'],
  enabledUrls: 'a.com',
  disabledUrls: '',
  active: true,
};

describe('mergeExtensionRules', () => {
  it('adds imported rules that do not exist yet, keeping the current ones', () => {
    const imported = { ...extRule, id: 'ext2', name: 'Other' };

    expect(mergeExtensionRules([extRule], [imported])).toEqual([extRule, imported]);
  });

  it('merges a rule present in both: URL union, current name, imported active state', () => {
    const imported = { ...extRule, name: 'Renamed', enabledUrls: 'a.com\nb.com', disabledUrls: 'c.com', active: false };

    expect(mergeExtensionRules([extRule], [imported])).toEqual([
      { ...extRule, enabledUrls: 'a.com\nb.com', disabledUrls: 'c.com', active: false },
    ]);
  });
});

describe('mergeGroupRules', () => {
  it('merges a group present in both: extension and URL union, current name, imported active state', () => {
    const imported = {
      ...groupRule,
      name: 'Renamed',
      extensions: ['ext1', 'ext2'],
      enabledUrls: 'b.com',
      active: false,
    };

    expect(mergeGroupRules([groupRule], [imported])).toEqual([
      { ...groupRule, extensions: ['ext1', 'ext2'], enabledUrls: 'a.com\nb.com', active: false },
    ]);
  });
});
