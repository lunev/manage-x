import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Extension } from '@/types';
import {
  DotsVerticalIcon,
  InfoCircledIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { moveExtensionToGroup } from '@/features/groups/groups-slice';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CheckIcon, MoveIcon } from 'lucide-react';

const ExtensionItem: React.FC<{ ext: Extension; onToggle: () => void }> = ({
  ext,
  onToggle,
}) => {
  const navigate = useNavigate();
  const groups = useAppSelector((state) => state.groups.entities);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleMoveToGroup = (groupId: string, extensionId: string) => {
    const group = groups.find((group) => group.id === groupId);

    if (group) {
      const { extensions, name } = group;
      if (extensions.includes(extensionId)) {
        return;
      }

      dispatch(
        moveExtensionToGroup({
          groupId,
          extensionId,
        }),
      );

      toast({
        description: (
          <span
            dangerouslySetInnerHTML={{
              __html: `<strong>${ext.name}</strong> has been moved to <strong>${name}</strong>`,
            }}
          />
        ),
        className: cn('top-2 right-2 flex fixed max-w-[300px]'),
        duration: 3000,
      });
    }
  };

  return (
    <div key={ext.id} className="flex gap-2 items-center">
      {ext.icons && ext.icons?.length > 0 && (
        <Avatar
          className={`${!ext.enabled ? 'grayscale' : ''} w-4 h-4 text-xs text-white`}
        >
          <AvatarImage src={ext.icons.at(-1)?.url} alt={ext.name} />
          <AvatarFallback className="bg-green-500">
            {ext.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className="max-w-full flex-1 pr-2 text-ellipsis text-nowrap overflow-hidden"
        title={ext.shortName}
      >
        {ext.name}
      </div>
      <Switch checked={ext.enabled} onCheckedChange={onToggle} />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DotsVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuLabel
            className="max-w-40 text-ellipsis overflow-hidden text-nowrap"
            title={ext.name}
          >
            {ext.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <MoveIcon />
              Move to group
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {groups &&
                  groups.length > 0 &&
                  groups.map((group) => (
                    <DropdownMenuItem
                      key={group.id}
                      onClick={() => handleMoveToGroup(group.id, ext.id)}
                      className="flex gap-2 items-center"
                    >
                      <span className="flex-1">{group.name}</span>
                      <span className="w-4">
                        {group.extensions.includes(ext.id) && (
                          <CheckIcon width="16" />
                        )}
                      </span>
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/groups?add')}>
                  New Group
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => navigate(`/details/${ext.id}`)}>
            <InfoCircledIcon /> Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              chrome.management.uninstall(ext.id, {}, () => {
                if (chrome.runtime.lastError) {
                  return;
                }
              });
            }}
          >
            <TrashIcon /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExtensionItem;
