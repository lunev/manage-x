import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleGroupUrlRule } from '@/features/group-rules/group-rules-slice';
import useExtensions from '@/hooks/useExtensions';
import { matchAction, useCurrentTabUrl } from '@/hooks/useGoverningRule';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusIcon } from '@radix-ui/react-icons';
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
  const dispatch = useAppDispatch();
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();
  const tabUrl = useCurrentTabUrl();
  const isGoverningTab =
    rule.active && tabUrl != null && matchAction(tabUrl, rule.enabledUrls, rule.disabledUrls) !== null;
  const groupExtensions = rule.extensions
    .map((id) => extensions.find((ext) => ext.id === id))
    .filter((ext): ext is chrome.management.ExtensionInfo => !!ext);

  const handleClick = () => {
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => dispatch(toggleGroupUrlRule({ id: rule.id })), CLICK_DELAY_MS);
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimer.current);
    navigate(`/group-rules/${rule.id}/edit/`);
  };

  return (
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
  const rules = useAppSelector((state) => state.groupRules.entities);
  const { extensions } = useExtensions();

  return (
    <>
      {rules?.length === 0 && <p className="text-xs text-muted-foreground mb-2">No rules yet — create one below</p>}
      <div className="fade-in grid grid-cols-8 gap-2 p-1">
        {rules.map((rule: GroupRule) => (
          <GroupRuleTile key={rule.id} rule={rule} extensions={extensions} />
        ))}
        <AddGroupRuleTile />
      </div>
    </>
  );
};

export default GroupRulesList;
