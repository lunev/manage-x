import { useCallback, useEffect, useState } from 'react';
import { ExtensionLocal, ExtensionPersisted } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setActiveGroup } from '@/features/groups/groups-slice';
import Search from './Search';
import GroupTabs from './GroupTabs';
import ExtensionGroup from './ExtensionGroup';
import {
  initExtensions,
  toggleExtension,
} from '@/features/extensions/extensions-slice';

const Dashboard: React.FC = () => {
  const [extensions, setExtensions] = useState<ExtensionLocal[] | null>(null);
  const [currentTabUrl, setCurrentTabUrl] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.groups.entities);
  const groupsPreferences = useAppSelector((state) => state.preferences.groups);
  const activeGroup = groups.find((group) => group.active);

  const fetchExtensions = useCallback(() => {
    chrome.management.getAll((fetchedExtensions) => {
      if (!fetchedExtensions?.length) return;

      const localExtensions: ExtensionLocal[] = [];
      const persistedExtensions: ExtensionPersisted[] = [];

      for (const extension of fetchedExtensions) {
        const { id, name, icons, enabled } = extension;

        // Skip if it's the "Manage X" id
        if (id === chrome.runtime.id) continue;

        localExtensions.push({ id, name, icons, enabled });
        persistedExtensions.push({
          id,
          name,
          enabled,
          enabledUrls: [],
          disabledUrls: [],
        });
      }

      dispatch(initExtensions({ extensions: persistedExtensions }));
      setExtensions(localExtensions);
    });
  }, [dispatch]);

  const fetchTabUrl = () => {
    chrome.tabs.query(
      { active: true, lastFocusedWindow: true },
      async (tabs) => {
        setCurrentTabUrl(tabs[0]?.url || '');
      },
    );
  };

  const handleToggle = (id: string, enabled: boolean) => {
    chrome.management.setEnabled(id, !enabled, fetchExtensions);
    dispatch(toggleExtension({ extensionId: id }));
  };

  const filteredExtensions = () => {
    if (!extensions) return [];

    let filtered = extensions.filter((e: ExtensionLocal) =>
      e.name.toLowerCase().includes(query.toLowerCase()),
    );

    if (activeGroup) {
      filtered = filtered.filter((e: ExtensionLocal) =>
        activeGroup.extensions.includes(e.id),
      );
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  };

  const enabledExtensions = filteredExtensions()?.filter((e) => e.enabled);
  const disabledExtensions = filteredExtensions()?.filter((e) => !e.enabled);

  const handleToggleGroup = (state: boolean) => {
    filteredExtensions()?.forEach((ext) => {
      chrome.management.setEnabled(ext.id, state);
    });
    fetchExtensions();
  };

  useEffect(() => {
    fetchTabUrl();
    fetchExtensions();
  }, [fetchExtensions]);

  useEffect(() => {
    if (!groupsPreferences.visible) {
      dispatch(setActiveGroup(null));
    }
  }, [dispatch, groupsPreferences.visible]);

  return (
    <div data-testid="dashboard">
      <Search onSearch={(searchQuery) => setQuery(searchQuery)} />
      <GroupTabs />

      {enabledExtensions?.length > 0 && (
        <ExtensionGroup
          title="Enabled"
          extensions={enabledExtensions}
          tabUrl={currentTabUrl}
          onToggleGroup={() => handleToggleGroup(false)}
          onToggleItem={handleToggle}
        />
      )}

      {disabledExtensions?.length > 0 && (
        <ExtensionGroup
          title="Disabled"
          extensions={disabledExtensions}
          tabUrl={currentTabUrl}
          onToggleGroup={() => handleToggleGroup(true)}
          onToggleItem={handleToggle}
        />
      )}

      {enabledExtensions?.length === 0 && disabledExtensions?.length === 0 && (
        <p>There are no extensions in this group.</p>
      )}
    </div>
  );
};

export default Dashboard;
