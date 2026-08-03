import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useExtensions from '@/hooks/useExtensions';
import { useGoverningRule } from '@/hooks/useGoverningRule';
import { useAppSelector } from '@/app/hooks';
import { toggleDefaultExtensionState } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

// Distinguishing a single click from the first half of a double click needs a short delay:
// the browser can't tell them apart until this much time has passed with no second click.
const CLICK_DELAY_MS = 250;

const ExtensionTile: React.FC<{
  ext: chrome.management.ExtensionInfo;
  toggle: (id: string, newState: boolean) => void;
}> = ({ ext, toggle }) => {
  const navigate = useNavigate();
  const governingRule = useGoverningRule(ext.id);
  const existingRule = useAppSelector((state) => state.extensionRules.entities.find((rule) => rule.id === ext.id));
  const ruleLink = existingRule ? `/extension-rules/${ext.id}/edit/` : `/extension-rules/new/?ext=${ext.id}`;
  const clickTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleClick = () => {
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => navigate(ruleLink), CLICK_DELAY_MS);
  };

  const handleDoubleClick = () => {
    clearTimeout(clickTimer.current);
    if (governingRule) {
      toast({
        title: `Can't toggle ${ext.name}`,
        description: `The ${governingRule.type === 'extension' ? 'Extension Rule' : 'Extension Group'} "${governingRule.name}" is keeping it ${governingRule.action} on this page. Turn off or edit that rule to toggle it manually.`,
      });
      return;
    }
    toggle(ext.id, !ext.enabled);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          aria-label={`Open extension rule for ${ext.name}, currently ${ext.enabled ? 'enabled' : 'disabled'}`}
          size="icon"
          className="rounded-full"
        >
          <Avatar
            className={`${!ext.enabled ? 'grayscale opacity-60' : 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm'} size-6 text-[10px] text-white relative transition-all duration-150`}
          >
            <AvatarImage src={ext.icons?.at(-1)?.url} alt={ext.name} />
            <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
              {ext.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </TooltipTrigger>
      {governingRule && (
        <TooltipContent side="top" align="center" className="max-w-56 text-left">
          <p>
            The {governingRule.type === 'extension' ? 'Extension Rule' : 'Extension Group'}{' '}
            <span className="font-medium">&ldquo;{governingRule.name}&rdquo;</span> is keeping this extension{' '}
            {governingRule.action} on this page.
          </p>
          <p className="mt-1">Turn off or edit that rule to toggle it manually.</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const ExtensionSkeletonTile: React.FC = () => (
  <div className="h-12 w-12 rounded-full bg-muted/70 animate-pulse" aria-hidden="true" />
);

const ExtensionGrid: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { extensions, isLoading, toggleExtension } = useExtensions();

  const handleToggle = (id: string, state: boolean) => {
    toggleExtension(id, state);
    toggleDefaultExtensionState(id);
  };

  if (isLoading) {
    return (
      <div
        className="fade-in grid grid-cols-9 gap-2 p-1"
        role="status"
        aria-busy="true"
        aria-label="Loading extensions"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <ExtensionSkeletonTile key={i} />
        ))}
      </div>
    );
  }

  if (extensions.length === 0) {
    return <p className="text-xs text-muted-foreground">No extensions installed</p>;
  }

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredExtensions = trimmedQuery
    ? extensions.filter((ext) => ext.name.toLowerCase().includes(trimmedQuery))
    : extensions;

  if (filteredExtensions.length === 0) {
    return <p className="text-xs text-muted-foreground">No extensions match &ldquo;{searchQuery.trim()}&rdquo;</p>;
  }

  return (
    <div className="fade-in grid grid-cols-9 gap-2 p-1">
      {filteredExtensions.map((ext) => (
        <ExtensionTile key={ext.id} ext={ext} toggle={handleToggle} />
      ))}
    </div>
  );
};

export default ExtensionGrid;
