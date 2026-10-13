import { ExtensionRule, GroupRule } from '@/types';
import { mergeStringArrays, mergeUrlStrings } from '@/lib/utils';

// Merges imported rules into the current ones. A rule only in one list is kept as-is; a rule
// in both keeps its current name (if any), gets the union of both URL lists, and takes the
// imported active state.

export const mergeExtensionRules = (current: ExtensionRule[], imported: ExtensionRule[]): ExtensionRule[] => {
  const merged = new Map(current.map((rule) => [rule.id, rule]));

  for (const newRule of imported) {
    const existingRule = merged.get(newRule.id);

    merged.set(
      newRule.id,
      existingRule
        ? {
            ...existingRule,
            name: existingRule.name || newRule.name,
            enabledUrls: mergeUrlStrings(existingRule.enabledUrls, newRule.enabledUrls),
            disabledUrls: mergeUrlStrings(existingRule.disabledUrls, newRule.disabledUrls),
            active: newRule.active,
          }
        : newRule,
    );
  }

  return Array.from(merged.values());
};

export const mergeGroupRules = (current: GroupRule[], imported: GroupRule[]): GroupRule[] => {
  const merged = new Map(current.map((rule) => [rule.id, rule]));

  for (const newRule of imported) {
    const existingRule = merged.get(newRule.id);

    merged.set(
      newRule.id,
      existingRule
        ? {
            ...existingRule,
            name: existingRule.name || newRule.name,
            extensions: mergeStringArrays(existingRule.extensions, newRule.extensions),
            enabledUrls: mergeUrlStrings(existingRule.enabledUrls, newRule.enabledUrls),
            disabledUrls: mergeUrlStrings(existingRule.disabledUrls, newRule.disabledUrls),
            active: newRule.active,
          }
        : newRule,
    );
  }

  return Array.from(merged.values());
};
