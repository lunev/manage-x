import { useEffect, useState } from 'react';
import { ExtensionRule, GroupRule } from '@/types';
import { extensionRulesService, groupRulesService } from '@/lib/rules-service';

/** Extension and Group Rules from chrome.storage.sync, kept live as they change. */
export const useRules = () => {
  const [extensionRules, setExtensionRules] = useState<ExtensionRule[]>([]);
  const [groupRules, setGroupRules] = useState<GroupRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [extRules, grpRules] = await Promise.all([extensionRulesService.getAll(), groupRulesService.getAll()]);
      setExtensionRules(extRules);
      setGroupRules(grpRules);
      setIsLoading(false);
    };
    load();

    // Re-read whenever sync changes: our own writes, the other page, or another device.
    const handleChange = (_changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === 'sync') load();
    };
    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }, []);

  return { extensionRules, groupRules, isLoading };
};
