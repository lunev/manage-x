import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import matchUrl from 'match-url-wildcard';
import { getCurrentTabParams } from '@/lib/utils';

export function useExtensionHasRules(extId: string) {
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [hasRules, setHasRules] = useState(false);

  const extensionRules = useAppSelector((state) => state.extensionRules.entities);
  const groupRules = useAppSelector((state) => state.groupRules.entities);

  const extensionRule = extensionRules.find((rule) => rule.id === extId && rule.active);

  useEffect(() => {
    getCurrentTabParams().then((tab) => {
      setTabUrl(tab?.url ?? null);
    });
  }, []);

  useEffect(() => {
    if (!tabUrl) {
      setHasRules(false);
      return;
    }

    let enabledPatterns: string[] = [];
    let disabledPatterns: string[] = [];

    if (extensionRule) {
      enabledPatterns = extensionRule.enabledUrls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      disabledPatterns = extensionRule.disabledUrls
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      const activeGroups = groupRules.filter((group) => group.active && group.extensions.includes(extId));
      for (const group of activeGroups) {
        enabledPatterns.push(
          ...group.enabledUrls
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        );
        disabledPatterns.push(
          ...group.disabledUrls
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }
    }

    const matched =
      disabledPatterns.some((pattern) => matchUrl(tabUrl, pattern)) ||
      enabledPatterns.some((pattern) => matchUrl(tabUrl, pattern));

    setHasRules(matched);
  }, [tabUrl, extensionRule, groupRules, extId]);

  return hasRules;
}
