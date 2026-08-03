import matchUrl from 'match-url-wildcard';

export type RuleAction = 'enable' | 'disable' | null;

export const parseUrlPatterns = (raw: string): string[] =>
  raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

// disable wins over enable — mirrors the precedence already used in
// app/src/service-worker/utils/rulesManager.ts's manageExtensions()
export const getRuleAction = (tabUrl: string, enabledUrls: string, disabledUrls: string): RuleAction => {
  if (parseUrlPatterns(disabledUrls).some((p) => matchUrl(tabUrl, p))) return 'disable';
  if (parseUrlPatterns(enabledUrls).some((p) => matchUrl(tabUrl, p))) return 'enable';
  return null;
};
