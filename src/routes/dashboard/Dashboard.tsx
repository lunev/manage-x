import { useEffect, useMemo, useState } from 'react';
import { Extension } from '@/types';
import { Input } from '@/components/ui/input';
import ExtensionItem from '@/components/layout/extension/ExtensionItem';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  Cross2Icon,
  DotsVerticalIcon,
  MagnifyingGlassIcon,
  SwitchIcon,
} from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArchiveIcon, PlusCircleIcon } from 'lucide-react';
import { setActiveGroup } from '@/features/groups/groups-slice';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard: React.FC = () => {
  const [extensions, setExtensions] = useState<Extension[] | null>(null);
  const [currentExt, setCurrentExt] = useState<Extension | null>(null);
  const [query, setQuery] = useState('');
  const groups = useAppSelector((state) => state.groups.entities);
  const { showGroups, showSearch } = useAppSelector(
    (state) => state.preferences,
  );
  const activeGroup = useMemo(
    () => groups.find((group) => group.active),
    [groups],
  );

  const dispatch = useAppDispatch();

  const fetchExtensions = () => {
    chrome.management.getAll(setExtensions);
    chrome.management.getSelf(setCurrentExt);
  };

  const handleToggle = (id: string, enabled: boolean) => {
    chrome.management.setEnabled(id, !enabled, fetchExtensions);
  };

  const handleToggleGroup = (state: boolean) => {
    filteredExtensions.forEach((ext) => {
      chrome.management.setEnabled(ext.id, state);
    });
    fetchExtensions();
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchExtensions();
  }, []);

  useEffect(() => {
    if (!showGroups.active) {
      dispatch(setActiveGroup(null));
    }
  }, [dispatch, showGroups.active]);

  return (
    <div data-testid="dashboard">
      {showSearch.active && (
        <div className="mb-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute translate-x-2 translate-y-3 opacity-50" />
            <Input
              className={`w-full mb-2 pl-7 text-sm ${query ? 'pr-7' : ''}`}
              placeholder="Search by name or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Cross2Icon
              className={`absolute top-3 right-3 cursor-pointer transition-all duration-300 ${
                query ? 'opacity-50' : 'opacity-0'
              }`}
              onClick={() => setQuery('')}
            />
          </div>
        </div>
      )}

      {showGroups.active && (
        <div className="mb-3 flex gap-2 items-center">
          <Tabs defaultValue={activeGroup?.name || 'All'} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger
                className="flex-1 text-xs"
                value="All"
                onClick={() => dispatch(setActiveGroup(null))}
              >
                All
              </TabsTrigger>
              {groups.map((group) => (
                <TabsTrigger
                  key={group.id}
                  className="flex-1 text-xs"
                  value={group.name}
                  onClick={() => dispatch(setActiveGroup(group))}
                >
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <DotsVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4">
              <DropdownMenuLabel>Groups</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/groups/')}>
                <ArchiveIcon /> Manage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/groups?add')}>
                <PlusCircleIcon /> Add
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {enabledExtensions.length > 0 && (
        <div className="mb-3 last-of-type:mb-0 flex flex-col gap-2">
          <div className="flex gap-2 justify-between">
            <h2 className="opacity-40 text-xs">Enabled</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SwitchIcon
                    className="opacity-30 cursor-pointer"
                    onClick={() => handleToggleGroup(false)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Disable all extensions in this group
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {enabledExtensions.map((ext) => (
            <ExtensionItem
              key={ext.id}
              ext={ext}
              onToggle={() => handleToggle(ext.id, ext.enabled)}
            />
          ))}
        </div>
      )}
      {disabledExtensions.length > 0 && (
        <div className="flex last-of-type:mb-0 flex-col gap-2">
          <div className="flex gap-2 justify-between">
            <h2 className="opacity-40 text-xs">Disabled</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SwitchIcon
                    className="rotate-180 opacity-30 cursor-pointer"
                    onClick={() => handleToggleGroup(true)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Enable all extensions in this group
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {disabledExtensions.map((ext) => (
            <ExtensionItem
              key={ext.id}
              ext={ext}
              onToggle={() => handleToggle(ext.id, ext.enabled)}
            />
          ))}
        </div>
      )}

      {enabledExtensions.length === 0 && disabledExtensions.length === 0 && (
        <p>There are no extensions in this group.</p>
      )}
    </div>
  );
};

export default Dashboard;
