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
  }, []);

  return {
    extensions,
    isLoading,
    toggleExtension,
  };
};

export default useExtensions;
