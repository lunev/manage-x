import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { getCurrentTabParams } from '@/lib/utils';
import { getRuleAction } from '@/lib/ruleMatching';

export type ActiveRuleMatch = {
  id: string;
  type: 'extension' | 'group';
  name: string;
  action: 'enable' | 'disable';
  extensionIds: string[]; // [rule.id] for individual extension rules, rule.extensions for group rules
};

export function useActiveRulesForTab(): { matches: ActiveRuleMatch[]; isLoading: boolean } {
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const extensionRules = useAppSelector((state) => state.extensionRules.entities);
  const groupRules = useAppSelector((state) => state.groupRules.entities);

  useEffect(() => {
    getCurrentTabParams().then((tab) => {
      setTabUrl(tab?.url ?? null);
      setIsLoading(false);
    });
  }, []);

  const matches: ActiveRuleMatch[] = [];

  if (tabUrl) {
    // Deliberately doesn't resolve individual-rule-shadows-group precedence for display purposes
    // (tracked separately as Feature #4, rule conflict/shadow warnings) — a rule shown here as
    // "affecting" an extension might in rare cases actually be overridden by that extension's own
    // individual rule per the real precedence in rulesManager.ts.
    for (const rule of extensionRules) {
      if (!rule.active) continue;
      const action = getRuleAction(tabUrl, rule.enabledUrls, rule.disabledUrls);
      if (action) {
        matches.push({ id: rule.id, type: 'extension', name: rule.name, action, extensionIds: [rule.id] });
      }
    }

    for (const rule of groupRules) {
      if (!rule.active) continue;
      const action = getRuleAction(tabUrl, rule.enabledUrls, rule.disabledUrls);
      if (action) {
        matches.push({ id: rule.id, type: 'group', name: rule.name, action, extensionIds: rule.extensions });
      }
    }
  }

  return { matches, isLoading };
}
