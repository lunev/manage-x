import { describe, it, expect } from 'vitest';
import { getUrlHost, mergeUrlStrings } from './utils';

describe('getUrlHost', () => {
  it('returns the bare hostname for a standard https URL', () => {
    expect(getUrlHost('https://example.com/some/path')).toBe('example.com');
  });

  it('includes the port when it is non-default', () => {
    expect(getUrlHost('http://localhost:3000/')).toBe('localhost:3000');
  });

  it('omits the port when it is the default for the protocol', () => {
    expect(getUrlHost('https://example.com:443/')).toBe('example.com');
  });

  it('returns null for an unparseable URL', () => {
    expect(getUrlHost('not a url')).toBeNull();
  });
});

describe('mergeUrlStrings', () => {
  it('adds a new domain to an existing list without duplicating it', () => {
    expect(mergeUrlStrings('example.com', 'example.com')).toBe('example.com');
    expect(mergeUrlStrings('example.com', 'other.com')).toBe('example.com\nother.com');
  });
});
