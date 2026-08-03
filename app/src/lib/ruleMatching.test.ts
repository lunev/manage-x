import { describe, it, expect } from 'vitest';
import { getRuleAction, parseUrlPatterns } from './ruleMatching';

describe('parseUrlPatterns', () => {
  it('splits on newlines, trims whitespace, and drops blank lines', () => {
    expect(parseUrlPatterns('  example.com  \n\n  foo.com\n')).toEqual(['example.com', 'foo.com']);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseUrlPatterns('')).toEqual([]);
  });
});

describe('getRuleAction', () => {
  it('returns "enable" when only the enabled patterns match', () => {
    expect(getRuleAction('https://example.com', 'example.com', '')).toBe('enable');
  });

  it('returns "disable" when only the disabled patterns match', () => {
    expect(getRuleAction('https://example.com', '', 'example.com')).toBe('disable');
  });

  it('returns "disable" when both enabled and disabled patterns match — disable wins', () => {
    expect(getRuleAction('https://example.com', 'example.com', 'example.com')).toBe('disable');
  });

  it('returns null when neither pattern list matches', () => {
    expect(getRuleAction('https://example.com', 'foo.com', 'bar.com')).toBeNull();
  });

  it('ignores whitespace and blank lines within multi-line pattern lists', () => {
    expect(getRuleAction('https://example.com', '  \n  example.com  \n\n', '')).toBe('enable');
  });

  it('matches against any pattern in a multi-line, multi-pattern list', () => {
    expect(getRuleAction('https://foo.com', 'bar.com\nfoo.com\nbaz.com', '')).toBe('enable');
    expect(getRuleAction('https://foo.com', '', 'bar.com\nfoo.com\nbaz.com')).toBe('disable');
  });
});
