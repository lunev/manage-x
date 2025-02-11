import { useCallback, useEffect, useMemo, useState } from 'react';
import { Extension } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setActiveGroup } from '@/features/groups/groups-slice';
import Search from './Search';
import GroupTabs from './GroupTabs';
import ExtensionGroup from './ExtensionGroup';

const Dashboard: React.FC = () => {
  const [extensions, setExtensions] = useState<Extension[] | null>(null);
  const [currentExt, setCurrentExt] = useState<Extension | null>(null);
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.groups.entities);
  const { groups: groupsPreferences } = useAppSelector(
    (state) => state.preferences,
  );
  const activeGroup = groups.find((group) => group.active);

  const fetchCurrentExtension = useCallback(
    () => chrome.management.getSelf(setCurrentExt),
    [],
  );
  const fetchExtensions = () => chrome.management.getAll(setExtensions);

  const handleToggle = (id: string, enabled: boolean) => {
    chrome.management.setEnabled(id, !enabled, fetchExtensions);
  };

  const filteredExtensions = useMemo(() => {
    if (!extensions) return [];

    let filtered = extensions.filter(
      (ext) =>
        ext.id !== currentExt?.id &&
        (ext.name.toLowerCase().includes(query.toLowerCase()) ||
          ext.description.toLowerCase().includes(query.toLowerCase())),
    );

    if (activeGroup) {
      filtered = filtered.filter((ext) =>
        activeGroup.extensions.includes(ext.id),
      );
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [extensions, currentExt, query, activeGroup]);

  const enabledExtensions = filteredExtensions?.filter((ext) => ext.enabled);
  const disabledExtensions = filteredExtensions?.filter((ext) => !ext.enabled);

  const handleToggleGroup = (state: boolean) => {
    filteredExtensions?.forEach((ext) => {
      chrome.management.setEnabled(ext.id, state);
    });
    fetchExtensions();
  };

  useEffect(() => {
    fetchExtensions();
    fetchCurrentExtension();
  }, []);

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
          onToggleGroup={() => handleToggleGroup(false)}
          onToggleItem={handleToggle}
        />
      )}

      {disabledExtensions?.length > 0 && (
        <ExtensionGroup
          title="Disabled"
          extensions={disabledExtensions}
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
