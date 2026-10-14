import { Link } from 'react-router-dom';
import { Pencil1Icon } from '@radix-ui/react-icons';
import useExtensions from '@/hooks/useExtensions';
import { useGoverningRule } from '@/hooks/useGoverningRule';
import { useRules } from '@/hooks/useRules';
import { toggleDefaultExtensionState } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import RuleBadge from './RuleBadge';

type ExtensionTileProps = {
  ext: chrome.management.ExtensionInfo;
  toggle: (id: string, newState: boolean) => void;
};

const ExtensionTile = ({ ext, toggle }: ExtensionTileProps) => {
  const governingRule = useGoverningRule(ext.id);
  const { extensionRules } = useRules();
  const existingRule = extensionRules.find((rule) => rule.id === ext.id);
  const ruleLink = existingRule ? `/extension-rules/${ext.id}/edit/` : `/extension-rules/new/?ext=${ext.id}`;
  // Deep-links to the tab (Enabled/Disabled URLs) that's actually keeping the extension in
  // its current state, so editing the rule doesn't require hunting for which list it's in.
  const governingRuleLink = governingRule
    ? governingRule.type === 'extension'
      ? `/extension-rules/${governingRule.id}/edit/?tab=${governingRule.action}`
      : `/group-rules/${governingRule.id}/edit/?tab=${governingRule.action}`
    : null;
  const handleClick = () => {
    if (governingRule) {
      const editHint = governingRule.type === 'group' ? 'Turn off or edit' : 'Edit';
      toast({
        title: `Can't toggle ${ext.name}`,
        description: `The ${governingRule.type === 'extension' ? 'Extension Rule' : 'Extension Group'} "${governingRule.name}" is keeping it ${governingRule.action} on this page. ${editHint} that rule to toggle it manually.`,
      });
      return;
    }
    toggle(ext.id, !ext.enabled);
  };

  return (
    // `group` reveals the edit pencil while the tile is hovered or anything in it has focus.
    <div className="group relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClick}
            aria-label={`Toggle ${ext.name}, currently ${ext.enabled ? 'enabled' : 'disabled'}${governingRule ? `, controlled by rule "${governingRule.name}"` : ''}`}
            size="icon"
            className="rounded-full"
          >
            <span className="relative inline-flex">
              <Avatar
                className={`${!ext.enabled ? 'grayscale opacity-60' : 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm'} size-6 text-xxs text-white transition-all duration-150`}
              >
                <AvatarImage src={ext.icons?.at(-1)?.url} alt={ext.name} />
                <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
                  {ext.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {governingRule && (
                <RuleBadge colorClassName={governingRule.type === 'group' ? 'bg-[#e6001e]' : 'bg-primary'} />
              )}
            </span>
          </Button>
        </TooltipTrigger>
        {governingRule && governingRuleLink && (
          <TooltipContent side="top" align="center" className="max-w-56 text-left">
            <p>
              The {governingRule.type === 'extension' ? 'Extension Rule' : 'Extension Group'}{' '}
              <span className="font-medium">&ldquo;{governingRule.name}&rdquo;</span> is keeping this extension{' '}
              <span className="font-semibold">{governingRule.action}</span> on this page.
            </p>
            <p className="mt-1 first-letter:uppercase">
              {governingRule.type === 'group' && 'turn off or '}
              <Link to={governingRuleLink} className="font-medium underline underline-offset-2 hover:opacity-80">
                edit that rule
              </Link>{' '}
              to toggle it manually.
            </p>
          </TooltipContent>
        )}
      </Tooltip>
      {/* A sibling of the tile button, not inside it: interactive elements can't nest. */}
      <Link
        to={ruleLink}
        aria-label={`${existingRule ? 'Edit' : 'Add'} rule for ${ext.name}`}
        className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-foreground"
      >
        <Pencil1Icon className="size-2.5" />
      </Link>
    </div>
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
