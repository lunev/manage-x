import { vi } from 'vitest';
import { act, renderHook, waitFor, mockManagementGetAll } from '@test-utils';
import { useExtensions } from './useExtensions';

describe('useExtensions', () => {
  it('re-fetches when chrome.management.onEnabled/onDisabled fire, without requiring a remount', async () => {
    mockManagementGetAll([{ id: 'ext1', name: 'AdBlocker', enabled: true }]);

    const { result, unmount } = renderHook(() => useExtensions());

    await waitFor(() => expect(result.current.extensions).toHaveLength(1));
    expect(result.current.extensions[0].enabled).toBe(true);

    // Simulate the background rules engine (or the user, via chrome://extensions/) changing
    // the extension's state independently of this popup instance.
    mockManagementGetAll([{ id: 'ext1', name: 'AdBlocker', enabled: false }]);
    const onDisabledHandler = vi.mocked(chrome.management.onDisabled.addListener).mock.calls[0][0];
    act(() => {
      onDisabledHandler({ id: 'ext1' } as chrome.management.ExtensionInfo);
    });

    await waitFor(() => expect(result.current.extensions[0].enabled).toBe(false));

    unmount();
    expect(chrome.management.onEnabled.removeListener).toHaveBeenCalled();
    expect(chrome.management.onDisabled.removeListener).toHaveBeenCalled();
  });
});
