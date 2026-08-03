import { vi } from 'vitest';
import { renderHook, waitFor } from '@test-utils';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { createMockStore, type PreloadedState } from '../../test/mockStore';
import { useActiveRulesForTab } from './useActiveRulesForTab';

const withStore =
  (initialState?: PreloadedState) =>
  ({ children }: { children: ReactNode }) => <Provider store={createMockStore(initialState)}>{children}</Provider>;

describe('useActiveRulesForTab', () => {
  beforeEach(() => {
    vi.mocked(chrome.tabs.query).mockResolvedValue([{ url: 'https://example.com' }] as chrome.tabs.Tab[]);
  });

  it('resolves isLoading from true to false once the tab URL is fetched', async () => {
    const { result } = renderHook(() => useActiveRulesForTab(), { wrapper: withStore() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toEqual([]);
  });

  it('returns no matches when there are no active rules', async () => {
    const { result } = renderHook(() => useActiveRulesForTab(), { wrapper: withStore() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toEqual([]);
  });

  it('returns an extension match when an active individual rule matches the tab URL via disabledUrls', async () => {
    const { result } = renderHook(() => useActiveRulesForTab(), {
      wrapper: withStore({
        extensionRules: {
          entities: [{ id: 'ext1', name: 'AdBlocker', enabledUrls: '', disabledUrls: 'example.com', active: true }],
        },
      }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toEqual([
      { id: 'ext1', type: 'extension', name: 'AdBlocker', action: 'disable', extensionIds: ['ext1'] },
    ]);
  });

  it('returns a group match with multiple extensionIds when an active group rule matches the tab URL', async () => {
    const { result } = renderHook(() => useActiveRulesForTab(), {
      wrapper: withStore({
        groupRules: {
          entities: [
            {
              id: 'grp1',
              name: 'My Group',
              extensions: ['ext1', 'ext2'],
              enabledUrls: 'example.com',
              disabledUrls: '',
              active: true,
            },
          ],
        },
      }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toEqual([
      { id: 'grp1', type: 'group', name: 'My Group', action: 'enable', extensionIds: ['ext1', 'ext2'] },
    ]);
  });

  it('ignores rules that are not active or do not match the tab URL', async () => {
    const { result } = renderHook(() => useActiveRulesForTab(), {
      wrapper: withStore({
        extensionRules: {
          entities: [
            { id: 'ext1', name: 'Inactive Rule', enabledUrls: 'example.com', disabledUrls: '', active: false },
            { id: 'ext2', name: 'Non-matching Rule', enabledUrls: 'foo.com', disabledUrls: '', active: true },
          ],
        },
      }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.matches).toEqual([]);
  });
});
