import useExtensions from '@/hooks/useExtensions';
import { useExtensionHasRules } from '@/hooks/useExtensionHasRules';
import { toggleDefaultExtensionState } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type ExtensionItemProps = {
  ext: chrome.management.ExtensionInfo;
  toggle: (id: string, newState: boolean) => void;
};

const ExtensionItem = ({ ext, toggle }: ExtensionItemProps) => {
  const hasRules = useExtensionHasRules(ext.id);

  return (
    <div className="flex items-center gap-2 rounded-md px-1 -mx-1 py-0.5 -my-0.5 hover:bg-muted/60 transition-colors">
      <Avatar className={`${!ext.enabled ? 'grayscale' : ''} w-5 h-5 text-xs text-white relative`}>
        <AvatarImage src={ext.icons?.at(-1)?.url} alt={ext.name} />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {ext.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 line-clamp-1">{ext.name}</div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Switch
              checked={ext.enabled}
              onCheckedChange={() => toggle(ext.id, !ext.enabled)}
              disabled={hasRules}
              aria-label={`Toggle ${ext.name}`}
            />
          </div>
        </TooltipTrigger>
        {hasRules && (
          <TooltipContent side="top" align="center" className="max-w-xs">
            Controlled by rules
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
};

const ExtensionSkeletonRow: React.FC = () => (
  <div className="flex items-center gap-2 px-1 py-0.5" aria-hidden="true">
    <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
    <div className="flex-1 h-3 rounded bg-muted animate-pulse" />
    <div className="w-9 h-5 rounded-full bg-muted animate-pulse" />
  </div>
);

const ExtensionSection: React.FC<{
  title: string;
  extensions: chrome.management.ExtensionInfo[];
  className?: string;
  toggle: (id: string, newState: boolean) => void;
}> = ({ title, extensions, className = '', toggle }) => {
  if (!extensions) return null;

  return (
    <div className={className}>
      {extensions.length > 0 && <h3 className="muted-heading my-1">{title}</h3>}
      <div className="flex flex-col gap-1">
        {extensions.map((ext) => (
          <ExtensionItem key={ext.id} ext={ext} toggle={toggle} />
        ))}
      </div>
    </div>
  );
};

const ExtensionList: React.FC = () => {
  const { extensions, isLoading, toggleExtension } = useExtensions();
  const enabledExtensions = extensions.filter((ext) => ext.enabled);
  const disabledExtensions = extensions.filter((ext) => !ext.enabled);

  const handleToggle = (id: string, state: boolean) => {
    toggleExtension(id, state);
    toggleDefaultExtensionState(id);
  };

  if (isLoading) {
    return (
      <div className="fade-in flex flex-col gap-1" role="status" aria-busy="true" aria-label="Loading extensions">
        <ExtensionSkeletonRow />
        <ExtensionSkeletonRow />
        <ExtensionSkeletonRow />
      </div>
    );
  }

  if (extensions.length === 0) {
    return <p className="text-xs text-muted-foreground">No extensions installed</p>;
  }

  return (
    <div className="fade-in flex flex-col gap-1">
      <ExtensionSection title="Enabled" extensions={enabledExtensions} toggle={handleToggle} />
      <ExtensionSection title="Disabled" extensions={disabledExtensions} toggle={handleToggle} className="mt-2" />
    </div>
  );
};

export default ExtensionList;
