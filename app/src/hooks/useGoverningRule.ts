import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import matchUrl from 'match-url-wildcard';
import { getCurrentTabParams } from '@/lib/utils';

export type GoverningRule = {
  type: 'extension' | 'group';
  id: string;
  name: string;
  action: 'enabled' | 'disabled';
} | null;

export function matchAction(tabUrl: string, enabledUrls: string, disabledUrls: string): 'enabled' | 'disabled' | null {
  const enabledPatterns = enabledUrls
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const disabledPatterns = disabledUrls
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  if (disabledPatterns.some((pattern) => matchUrl(tabUrl, pattern))) return 'disabled';
  if (enabledPatterns.some((pattern) => matchUrl(tabUrl, pattern))) return 'enabled';
  return null;
}

export function useCurrentTabUrl(): string | null {
  const [tabUrl, setTabUrl] = useState<string | null>(null);

  useEffect(() => {
    getCurrentTabParams().then((tab) => {
      setTabUrl(tab?.url ?? null);
    });
  }, []);

  return tabUrl;
}

// Same URL-matching precedence as useExtensionHasRules (an active Extension Rule for this
// extension wins over any active Group Rule containing it), but reports which rule is
// actually responsible instead of a plain boolean, so the UI can explain why an extension
// is locked instead of just that it is.
export function useGoverningRule(extId: string): GoverningRule {
  const tabUrl = useCurrentTabUrl();

  const extensionRules = useAppSelector((state) => state.extensionRules.entities);
  const groupRules = useAppSelector((state) => state.groupRules.entities);

  if (!tabUrl) {
    return null;
  }

  // A rule with no URLs saved at all can never match anything itself, so it shouldn't take
  // precedence over a Group Rule either — otherwise a patternless individual rule would
  // report as "governing" while the background (which applies the same precedence) actually
  // lets the group control the extension, leaving the UI's lock badge/toast out of sync.
  const extensionRule = extensionRules.find(
    (rule) => rule.id === extId && rule.active && (rule.enabledUrls.trim() !== '' || rule.disabledUrls.trim() !== ''),
  );

  if (extensionRule) {
    const action = matchAction(tabUrl, extensionRule.enabledUrls, extensionRule.disabledUrls);
    if (action) {
      return { type: 'extension', id: extensionRule.id, name: extensionRule.name, action };
    }
    return null;
  }

  const activeGroups = groupRules.filter((group) => group.active && group.extensions.includes(extId));
  for (const group of activeGroups) {
    const action = matchAction(tabUrl, group.enabledUrls, group.disabledUrls);
    if (action) {
      return { type: 'group', id: group.id, name: group.name, action };
    }
  }

  return null;
}
