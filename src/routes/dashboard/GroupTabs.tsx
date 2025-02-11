import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setActiveGroup } from '@/features/groups/groups-slice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ArchiveIcon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { PlusCircleIcon } from 'lucide-react';

const GroupTabs: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const groups = useAppSelector((state) => state.groups.entities);
  const { groups: groupsPreferences } = useAppSelector(
    (state) => state.preferences,
  );
  const activeGroup = useMemo(
    () => groups.find((group) => group.active),
    [groups],
  );

  return (
    <>
      {groupsPreferences.visible && (
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
    </>
  );
};

export default GroupTabs;
