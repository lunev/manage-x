import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleGroupUrlRule } from '@/features/group-rules/group-rules-slice';
import useExtensions from '@/hooks/useExtensions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusIcon } from '@radix-ui/react-icons';
import { GroupRule } from '@/types';

// Same click/double-click split as the Extensions grid: a single click can't fire the "open"
// navigation immediately, since the browser needs this much time with no second click to tell
// it apart from the start of a double click.
const CLICK_DELAY_MS = 250;

// A group's avatar is filled with the icons of the extensions it contains, rather than a
// generic initial letter — up to 4 in a mosaic (a single extension fills the whole circle; a
// 5th+ extension collapses into a "+N" cell instead of shrinking icons further).
const GroupAvatarFill: React.FC<{ icons: chrome.management.ExtensionInfo[] }> = ({ icons }) => {
  if (icons.length === 0) return null;

  if (icons.length === 1) {
    const url = icons[0].icons?.at(-1)?.url;
    return url ? (
      <img src={url} alt="" className="h-full w-full object-cover" />
    ) : (
      <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
        {icons[0].name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    );
  }

  const overflow = icons.length > 4 ? icons.length - 3 : 0;
  const displayIcons = overflow > 0 ? icons.slice(0, 3) : icons.slice(0, 4);

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-px">
      {displayIcons.map((ext) => (
        <img key={ext.id} src={ext.icons?.at(-1)?.url} alt="" className="h-full w-full object-cover" />
      ))}
      {overflow > 0 && (
        <span className="flex items-center justify-center bg-muted text-[7px] font-medium text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
};

const GroupRuleTile: React.FC<{ rule: GroupRule; extensions: chrome.management.ExtensionInfo[] }> = ({
  rule,
  extensions,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();
  const groupExtensions = rule.extensions
    .map((id) => extensions.find((ext) => ext.id === id))
    .filter((ext): ext is chrome.management.ExtensionInfo => !!ext);

  const handleClick = () => {
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => navigate(`/group-rules/${rule.id}/edit/`), CLICK_DELAY_MS);
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimer.current);
    dispatch(toggleGroupUrlRule({ id: rule.id }));
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          aria-label={`Open group rule for ${rule.name}, currently ${rule.active ? 'active' : 'inactive'}`}
          size="icon"
          className="rounded-full"
        >
          <Avatar
            className={`${!rule.active ? 'grayscale opacity-60' : 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm'} size-6 text-[10px] text-white relative transition-all duration-150`}
          >
            {groupExtensions.length > 0 ? (
              <GroupAvatarFill icons={groupExtensions} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
                {rule.name.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
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
