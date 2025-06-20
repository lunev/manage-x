import useExtensions from '@/hooks/useExtensions';
import { useExtensionHasRules } from '@/hooks/useExtensionHasRules';
import { toggleDefaultExtensionState } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const ExtensionItem: React.FC<{
  ext: chrome.management.ExtensionInfo;
  toggle: (id: string, newState: boolean) => void;
}> = ({ ext, toggle }) => {
  const hasRules = useExtensionHasRules(ext.id);

  return (
    <div className="flex items-center gap-2">
      <Avatar className={`${!ext.enabled ? 'grayscale' : ''} w-4 h-4 text-xs text-white relative`}>
        <AvatarImage src={ext.icons?.at(-1)?.url} alt={ext.name} />
        <AvatarFallback className="bg-green-500">{ext.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 line-clamp-1">{ext.name}</div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Switch checked={ext.enabled} onCheckedChange={() => toggle(ext.id, !ext.enabled)} disabled={hasRules} />
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
  const { extensions, toggleExtension } = useExtensions();
  const enabledExtensions = extensions.filter((ext) => ext.enabled);
  const disabledExtensions = extensions.filter((ext) => !ext.enabled);

  const handleToggle = (id: string, state: boolean) => {
    toggleExtension(id, state);
    toggleDefaultExtensionState(id);
  };

  return (
    <div className="fade-in flex flex-col gap-1">
      <ExtensionSection title="Enabled" extensions={enabledExtensions} toggle={handleToggle} />
      <ExtensionSection title="Disabled" extensions={disabledExtensions} toggle={handleToggle} className="mt-2" />
    </div>
  );
};

export default ExtensionList;
