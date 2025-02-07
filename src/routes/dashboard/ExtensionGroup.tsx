import { Extension } from '@/types';
import { SwitchIcon } from '@radix-ui/react-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ExtensionItem from './ExtensionItem';

const ExtensionGroup: React.FC<{
  title: string;
  extensions: Extension[];
  onToggleGroup: () => void;
  onToggleItem: (id: string, enabled: boolean) => void;
}> = ({ title, extensions, onToggleGroup, onToggleItem }) => {
  return (
    <>
      <div className="flex mb-3 last-of-type:mb-0 flex-col gap-2">
        <div className="flex gap-2 justify-between">
          <h2 className="opacity-40 text-xs">{title}</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SwitchIcon
                  className={`opacity-30 cursor-pointer ${title === 'Disabled' ? 'rotate-180' : ''}`}
                  onClick={onToggleGroup}
                />
              </TooltipTrigger>
              <TooltipContent>
                {title === 'Disabled' ? 'Enable' : 'Disable'}
                {` `}
                all extensions in this group
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {extensions.map((extension) => (
          <ExtensionItem
            key={extension.id}
            extension={extension}
            onToggle={() => onToggleItem(extension.id, extension.enabled)}
          />
        ))}
      </div>
    </>
  );
};

export default ExtensionGroup;
