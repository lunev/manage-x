import { ExportedData, ExtensionRule, GroupRule } from '@/types';

const isString = (value: unknown): value is string => typeof value === 'string';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidExtensionRule = (rule: unknown): rule is ExtensionRule => {
  if (!isRecord(rule)) return false;
  return (
    isString(rule.id) &&
    isString(rule.name) &&
    isString(rule.enabledUrls) &&
    isString(rule.disabledUrls) &&
    isBoolean(rule.active)
  );
};

const isValidGroupRule = (rule: unknown): rule is GroupRule => {
  if (!isRecord(rule)) return false;
  return (
    isString(rule.id) &&
    isString(rule.name) &&
    isStringArray(rule.extensions) &&
    isString(rule.enabledUrls) &&
    isString(rule.disabledUrls) &&
    isBoolean(rule.active)
  );
};

// Rebuilds a clean object from only the known fields, so unexpected extra properties
// (e.g. from a hand-edited or corrupted file) never make it into the Redux store.
const toExtensionRule = (rule: ExtensionRule): ExtensionRule => ({
  id: rule.id,
  name: rule.name,
  enabledUrls: rule.enabledUrls,
  disabledUrls: rule.disabledUrls,
  active: rule.active,
});

const toGroupRule = (rule: GroupRule): GroupRule => ({
  id: rule.id,
  name: rule.name,
  extensions: rule.extensions,
  enabledUrls: rule.enabledUrls,
  disabledUrls: rule.disabledUrls,
  active: rule.active,
});

/**
 * Parses and validates an imported ManageX rules JSON file. Throws a descriptive Error if the
 * file isn't valid JSON, isn't the expected shape, or contains a rule with a missing or
 * incorrectly-typed field (e.g. `active` as a number instead of a boolean).
 */
export const parseImportedRulesFile = (text: string): ExportedData => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (!isRecord(data)) {
    throw new Error('Invalid file: expected a JSON object with "extensionRules" and "groupRules".');
  }

  const { extensionRules, groupRules } = data;

  if (!Array.isArray(extensionRules) || !extensionRules.every(isValidExtensionRule)) {
    throw new Error('Invalid file: "extensionRules" must be a list of rules with id, name, enabledUrls, disabledUrls, and active (boolean) fields.');
  }

  if (!Array.isArray(groupRules) || !groupRules.every(isValidGroupRule)) {
    throw new Error('Invalid file: "groupRules" must be a list of rules with id, name, extensions (string list), enabledUrls, disabledUrls, and active (boolean) fields.');
  }

  return {
    extensionRules: extensionRules.map(toExtensionRule),
    groupRules: groupRules.map(toGroupRule),
  };
};
