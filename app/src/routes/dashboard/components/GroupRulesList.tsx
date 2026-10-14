import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupRulesService } from '@/lib/rules-service';
import { useRules } from '@/hooks/useRules';
import useExtensions from '@/hooks/useExtensions';
import { matchAction, useCurrentTabUrl } from '@/hooks/useGoverningRule';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DotsVerticalIcon, Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupRule } from '@/types';
import ExtensionIconMosaic from '@/components/ui/extension-icon-mosaic';
import RuleBadge from './RuleBadge';

// Same click/double-click split as the Extensions grid: a single click can't fire the toggle
// immediately, since the browser needs this much time with no second click to tell it apart
// from the start of a double click (which opens the group's rule editor instead).
const CLICK_DELAY_MS = 250;

const GroupRuleTile: React.FC<{ rule: GroupRule; extensions: chrome.management.ExtensionInfo[] }> = ({
  rule,
  extensions,
}) => {
  const navigate = useNavigate();
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();
  const tabUrl = useCurrentTabUrl();
  const isGoverningTab =
    rule.active && tabUrl != null && matchAction(tabUrl, rule.enabledUrls, rule.disabledUrls) !== null;
  const groupExtensions = rule.extensions
    .map((id) => extensions.find((ext) => ext.id === id))
    .filter((ext): ext is chrome.management.ExtensionInfo => !!ext);

  const handleClick = () => {
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => groupRulesService.save({ ...rule, active: !rule.active }), CLICK_DELAY_MS);
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimer.current);
    navigate(`/group-rules/${rule.id}/edit/`);
  };

  return (
    // `group` reveals the actions menu trigger while the tile is hovered or focused.
    <div className="group relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            aria-label={`Open group rule for ${rule.name}, currently ${rule.active ? 'active' : 'inactive'}${isGoverningTab ? ', controlling extensions on this page' : ''}`}
            size="icon"
            className="rounded-full"
          >
            <span className="relative inline-flex">
              <Avatar
                className={`${!rule.active ? 'grayscale opacity-60' : 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm'} size-6 text-[10px] text-white transition-all duration-150`}
              >
                {groupExtensions.length > 0 ? (
                  <ExtensionIconMosaic icons={groupExtensions} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
                    {rule.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              {isGoverningTab && <RuleBadge colorClassName="bg-[#e6001e]" />}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="max-w-56 text-left">
          <p className="font-medium">
            {rule.name} ({rule.extensions.length})
          </p>
        </TooltipContent>
      </Tooltip>
      {/* A sibling of the tile button, not inside it: interactive elements can't nest. Stays
          visible while its menu is open (data-state=open), not just while hovered. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for ${rule.name}`}
            className="absolute -right-1.5 top-2.5 flex size-4 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100 hover:text-foreground hover:ring-1 hover:ring-border"
          >
            <DotsVerticalIcon className="size-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="max-w-48 truncate">{rule.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate(`/group-rules/${rule.id}/edit/`)}>
            <Pencil1Icon className="size-3!" /> Edit group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const AddGroupRuleTile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/group-rules/new/')}
          aria-label="Add group rule"
          size="icon"
          className="rounded-full"
        >
          <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground">
            <PlusIcon className="h-3.5 w-3.5" />
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" align="center">
        Add group rule
      </TooltipContent>
    </Tooltip>
  );
};

const GroupRulesList: React.FC = () => {
  const { groupRules: rules, isLoading } = useRules();
  const { extensions } = useExtensions();
  // Oldest first; groups created before `createdAt` existed sort first, keeping their stored order.
  const sortedRules = [...rules].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

  return (
    <>
      {!isLoading && rules.length === 0 && (
        <p className="text-xs text-muted-foreground mb-2">No rules yet — create one below</p>
      )}
      <div className="fade-in grid grid-cols-7 gap-2 p-1">
        {sortedRules.map((rule: GroupRule) => (
          <GroupRuleTile key={rule.id} rule={rule} extensions={extensions} />
        ))}
        <AddGroupRuleTile />
      </div>
    </>
  );
};

export default GroupRulesList;
