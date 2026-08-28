import { useEffect, useState } from 'react';

type UseFloatingPopupOptions = {
  storageKey: string;
  intervalDays: number;
};

export function useFloatingPopup({ storageKey, intervalDays }: UseFloatingPopupOptions) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    chrome.storage.local.get(storageKey).then((result) => {
      if (cancelled) return;
      const lastDismissedAt = result[storageKey] as number | undefined;
      const intervalMs = intervalDays * 24 * 60 * 60 * 1000;
      const isDue = !lastDismissedAt || Date.now() - lastDismissedAt >= intervalMs;
      if (isDue) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey, intervalDays]);

  const dismiss = () => {
    chrome.storage.local.set({ [storageKey]: Date.now() });
    setVisible(false);
  };

  return { visible, dismiss };
}
