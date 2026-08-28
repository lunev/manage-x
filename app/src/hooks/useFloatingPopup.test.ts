import { renderHook, waitFor, act } from '@testing-library/react';
import { mockStorageLocalGet } from '../../test/mockChrome';
import { useFloatingPopup } from './useFloatingPopup';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('useFloatingPopup', () => {
  it('shows on first-ever run (no prior storage) without writing storage', async () => {
    mockStorageLocalGet({});
    const { result } = renderHook(() => useFloatingPopup({ storageKey: 'k', intervalDays: 30 }));
    await waitFor(() => expect(result.current.visible).toBe(true));
    expect(chrome.storage.local.set).not.toHaveBeenCalled();
  });

  it('stays hidden before the interval has elapsed since it was last dismissed', async () => {
    mockStorageLocalGet({ k: Date.now() - 5 * DAY_MS });
    const { result } = renderHook(() => useFloatingPopup({ storageKey: 'k', intervalDays: 30 }));
    await act(async () => {});
    expect(result.current.visible).toBe(false);
  });

  it('shows again once the interval has elapsed since it was last dismissed', async () => {
    mockStorageLocalGet({ k: Date.now() - 31 * DAY_MS });
    const { result } = renderHook(() => useFloatingPopup({ storageKey: 'k', intervalDays: 30 }));
    await waitFor(() => expect(result.current.visible).toBe(true));
  });

  it('dismiss() hides it and records the dismissal timestamp', async () => {
    mockStorageLocalGet({});
    const { result } = renderHook(() => useFloatingPopup({ storageKey: 'k', intervalDays: 30 }));
    await waitFor(() => expect(result.current.visible).toBe(true));
    act(() => result.current.dismiss());
    expect(result.current.visible).toBe(false);
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ k: expect.any(Number) });
  });
});
