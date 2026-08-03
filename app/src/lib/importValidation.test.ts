import { describe, it, expect } from 'vitest';
import { parseImportedRulesFile } from './importValidation';

const validFile = {
  extensionRules: [{ id: 'ext1', name: 'Ext One', enabledUrls: 'example.com', disabledUrls: '', active: true }],
  groupRules: [
    {
      id: 'grp1',
      name: 'Group A',
      extensions: ['ext1', 'ext2'],
      enabledUrls: '',
      disabledUrls: 'chrome://extensions/',
      active: true,
    },
  ],
};

describe('parseImportedRulesFile', () => {
  it('accepts a well-formed export file', () => {
    const result = parseImportedRulesFile(JSON.stringify(validFile));
    expect(result).toEqual(validFile);
  });

  it('rejects text that is not valid JSON', () => {
    expect(() => parseImportedRulesFile('not json')).toThrow('File is not valid JSON.');
  });

  it('rejects JSON that is not an object', () => {
    expect(() => parseImportedRulesFile('[]')).toThrow(/expected a JSON object/);
    expect(() => parseImportedRulesFile('"a string"')).toThrow(/expected a JSON object/);
  });

  it('rejects a file missing the extensionRules/groupRules arrays', () => {
    expect(() => parseImportedRulesFile(JSON.stringify({ groupRules: [] }))).toThrow(/extensionRules/);
    expect(() => parseImportedRulesFile(JSON.stringify({ extensionRules: [] }))).toThrow(/groupRules/);
  });

  // Regression test: a hand-edited/corrupted file with active as a number (22) instead of a
  // boolean previously passed validation silently — the whole point of validating imports.
  it('rejects a group rule whose "active" field is not a boolean', () => {
    const badFile = {
      extensionRules: [],
      groupRules: [
        {
          id: 'grp1',
          name: 'AdBlock',
          extensions: ['ext1', 'ext2'],
          enabledUrls: '',
          disabledUrls: 'chrome://extensions/',
          active: 22,
          priority: 1,
        },
      ],
    };

    expect(() => parseImportedRulesFile(JSON.stringify(badFile))).toThrow(/groupRules/);
  });

  it('rejects an extension rule missing a required field', () => {
    const badFile = {
      extensionRules: [{ id: 'ext1', enabledUrls: '', disabledUrls: '', active: true }],
      groupRules: [],
    };

    expect(() => parseImportedRulesFile(JSON.stringify(badFile))).toThrow(/extensionRules/);
  });

  it('rejects a group rule whose "extensions" field is not a list of strings', () => {
    const badFile = {
      extensionRules: [],
      groupRules: [
        { id: 'grp1', name: 'Group A', extensions: [1, 2], enabledUrls: '', disabledUrls: '', active: true },
      ],
    };

    expect(() => parseImportedRulesFile(JSON.stringify(badFile))).toThrow(/groupRules/);
  });

  it('strips unexpected extra fields instead of carrying them into the store', () => {
    const fileWithExtraField = {
      extensionRules: [],
      groupRules: [
        {
          id: 'grp1',
          name: 'Group A',
          extensions: ['ext1'],
          enabledUrls: '',
          disabledUrls: 'chrome://extensions/',
          active: true,
          priority: 1,
        },
      ],
    };

    const result = parseImportedRulesFile(JSON.stringify(fileWithExtraField));
    expect(result.groupRules[0]).not.toHaveProperty('priority');
  });
});
