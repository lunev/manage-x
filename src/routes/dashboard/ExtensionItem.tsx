import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExtensionLocal } from '@/types';
import {
  DotsVerticalIcon,
  InfoCircledIcon,
  Link1Icon,
  TrashIcon,
  LinkBreak1Icon,
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
import {
  moveExtensionToGroup,
  removeExtensionFromGroup,
} from '@/features/groups/groups-slice';
import { useToast } from '@/hooks/use-toast';
import { cn, matchUrl } from '@/lib/utils';
import { CheckIcon, MoveIcon } from 'lucide-react';
import { enablePreferences } from '@/features/preferences/preferences-slice';
import {
  addUrlRule,
  resetAllUrlRules,
  UrlType,
} from '@/features/extensions/extensions-slice';

const ExtensionItem: React.FC<{
  extension: ExtensionLocal;
  tabUrl: string | null;
  onToggle: () => void;
}> = ({ extension, tabUrl, onToggle }) => {
  const navigate = useNavigate();
  const groups = useAppSelector((state) => state.groups.entities);
  const extensions = useAppSelector((state) => state.extensions.entities);
  const activeGroup = groups.find((group) => group.active);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { id, name, icons, enabled } = extension;
  const currentExtension = extensions.find((ext) => ext.id === extension.id);

  const hasMatchingUrlRules = () => {
    if (!tabUrl || !currentExtension) return false;
    return (
      currentExtension.disabledUrls?.some((item) =>
        matchUrl(item.url, tabUrl),
      ) ||
      currentExtension.enabledUrls?.some((item) => matchUrl(item.url, tabUrl))
    );
  };

  const handleMoveToGroup = (groupId: string, extensionId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.extensions.includes(extensionId)) return;
    dispatch(moveExtensionToGroup({ groupId, extensionId }));
    toast({
      description: (
        <span
          dangerouslySetInnerHTML={{
            __html: `<strong>${extension.name}</strong> has been moved to <strong>${group.name}</strong>`,
          }}
        />
      ),
      className: cn('top-2 right-2 flex fixed max-w-[300px]'),
      duration: 3000,
    });
  };

  const handleRemoveFromGroup = (groupId: string, extensionId: string) => {
    dispatch(removeExtensionFromGroup({ groupId, extensionId }));

    toast({
      description: (
        <span
          dangerouslySetInnerHTML={{
            __html: `<strong>${extension.name}</strong> has been removed from this group`,
          }}
        />
      ),
      className: cn('top-2 right-2 flex fixed max-w-[300px]'),
      duration: 3000,
    });
  };

  const handleUrlRule = () => {
    dispatch(enablePreferences('urlRules'));
    navigate(`/details/${id}?add-rule`);
  };

  const isUrlRuleInList = (type: UrlType) => {
    if (tabUrl) {
      const { origin } = new URL(tabUrl);
      return currentExtension?.[`${type}Urls`].some((e) =>
        e.url.includes(origin),
      );
    }
  };

  const handleAddUrlRule = (type: UrlType) => {
    if (tabUrl) {
      const { origin } = new URL(tabUrl);

      if (origin && !isUrlRuleInList(type)) {
        dispatch(addUrlRule({ extensionId: extension.id, url: origin, type }));
        toast({
          description: (
            <span
              dangerouslySetInnerHTML={{
                __html: `New URL Rule <strong>${origin}</strong> has been added to the <strong>${type} URL Rules</strong> for the <strong>${extension.name}</strong>`,
              }}
            />
          ),
          className: cn('top-2 right-2 flex fixed max-w-[300px]'),
          duration: 3000,
        });
      }
    }
  };

  return (
    <div key={id} className="flex gap-2 items-center">
      {icons && icons?.length > 0 && (
        <Avatar
          className={`${!enabled ? 'grayscale' : ''} w-4 h-4 text-xs text-white`}
        >
          <AvatarImage src={icons.at(-1)?.url} alt={name} />
          <AvatarFallback className="bg-green-500">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="max-w-full flex-1 flex gap-1 pr-2 text-ellipsis text-nowrap overflow-hidden">
        <span
          className="cursor-pointer"
          onClick={() => navigate(`/details/${id}`)}
        >
          {name}
        </span>
        {hasMatchingUrlRules() && (
          <span
            className="text-red-600 -translate-y-1"
            title="Extension has active URL rules"
            style={{ fontSize: '10px' }}
          >
            Rules Applied
          </span>
        )}
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DotsVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuLabel
            className="max-w-40 text-ellipsis overflow-hidden text-nowrap"
            title={name}
          >
            {name}
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
                      onClick={() => handleMoveToGroup(group.id, id)}
                      className="flex gap-2 items-center"
                    >
                      <span className="flex-1">{group.name}</span>
                      <span className="w-4">
                        {group.extensions.includes(id) && (
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
          {activeGroup && (
            <DropdownMenuItem
              onClick={() => {
                const groupId = groups.find((group) =>
                  group.extensions.includes(id),
                )?.id;
                if (groupId) {
                  handleRemoveFromGroup(groupId, id);
                }
              }}
            >
              <LinkBreak1Icon /> Remove from this group
            </DropdownMenuItem>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Link1Icon />
              URL Rules
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => navigate(`/details/${id}`)}>
                  Manage URL Rules
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAddUrlRule('enabled')}
                  disabled={isUrlRuleInList('enabled')}
                >
                  Enable on this domain
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAddUrlRule('disabled')}
                  disabled={isUrlRuleInList('disabled')}
                >
                  Disable on this domain
                </DropdownMenuItem>
                {hasMatchingUrlRules() && (
                  <DropdownMenuItem
                    onClick={() =>
                      dispatch(resetAllUrlRules({ extensionId: id }))
                    }
                  >
                    Reset All Url Rules
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleUrlRule}>
                  Add New URL Rule
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => navigate(`/details/${id}`)}>
            <InfoCircledIcon /> Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              chrome.management.uninstall(id, {}, () => {
                if (chrome.runtime.lastError) {
                  return;
                }
              });
            }}
          >
            <TrashIcon /> Uninstall
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExtensionItem;
