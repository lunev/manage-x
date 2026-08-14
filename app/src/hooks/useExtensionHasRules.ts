import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import matchUrl from 'match-url-wildcard';
import { getCurrentTabParams } from '@/lib/utils';

export function useExtensionHasRules(extId: string) {
  const [tabUrl, setTabUrl] = useState<string | null>(null);

  const extensionRules = useAppSelector((state) => state.extensionRules.entities);
  const groupRules = useAppSelector((state) => state.groupRules.entities);

  // A rule with no URLs saved at all can never match anything itself, so it shouldn't take
  // precedence over a Group Rule either — see the identical fix/comment in useGoverningRule.ts.
  const extensionRule = extensionRules.find(
    (rule) => rule.id === extId && rule.active && (rule.enabledUrls.trim() !== '' || rule.disabledUrls.trim() !== ''),
  );

  useEffect(() => {
    getCurrentTabParams().then((tab) => {
      setTabUrl(tab?.url ?? null);
    });
  }, []);

  if (!tabUrl) {
    return false;
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

  return (
    disabledPatterns.some((pattern) => matchUrl(tabUrl, pattern)) ||
    enabledPatterns.some((pattern) => matchUrl(tabUrl, pattern))
  );
}
