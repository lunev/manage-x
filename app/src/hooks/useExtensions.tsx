import { useEffect, useState } from 'react';

export const useExtensions = () => {
  const [extensions, setExtensions] = useState<chrome.management.ExtensionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExtensions = () => {
    chrome.management.getAll((result: chrome.management.ExtensionInfo[]) => {
      const sortedExtensions = result
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
        .filter((ext) => ext.id !== chrome.runtime.id);
      setExtensions(sortedExtensions);
      setIsLoading(false);
    });
  };

  const toggleExtension = (id: string, enabled: boolean) => {
    chrome.management.setEnabled(id, enabled, () => {
      fetchExtensions();
    });
  };

  useEffect(() => {
    fetchExtensions();

    // Extensions can be enabled/disabled outside of this popup instance (the rules
    // engine reacting to a tab switch in the background, or the user toggling directly
    // on chrome://extensions/) while this popup stays mounted. Re-sync on those events
    // instead of only fetching once on mount.
    chrome.management.onEnabled.addListener(fetchExtensions);
    chrome.management.onDisabled.addListener(fetchExtensions);

    return () => {
      chrome.management.onEnabled.removeListener(fetchExtensions);
      chrome.management.onDisabled.removeListener(fetchExtensions);
    };
  }, []);

  return {
    extensions,
    isLoading,
    toggleExtension,
  };
};

export default useExtensions;
