import { STORAGE_KEYS } from '@/constants';

describe('service-worker', () => {
  it('should handle update', async () => {
    const onInstalledCallback = vi.fn();
    vi.spyOn(chrome.runtime.onInstalled, 'addListener').mockImplementation(
      onInstalledCallback,
    );
    await import('./service-worker');

    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(
      expect.any(Function),
    );

    const details = { reason: 'update' };
    const registeredListener = onInstalledCallback.mock.calls[0][0];
    registeredListener(details);

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      [STORAGE_KEYS.UPDATES_AVAILABLE]: true,
    });
  });
});
