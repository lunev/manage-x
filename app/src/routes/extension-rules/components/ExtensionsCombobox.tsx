import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExtensionRule } from '@/types';

interface Extension {
  id: string;
  name: string;
  enabled: boolean;
  icons?: { url: string }[];
}

interface ComboboxType {
  editedExtensionId?: string;
  extensions: Extension[];
  extensionRules: ExtensionRule[];
  onSelect: (id: string) => void;
}

const ExtensionLogo: React.FC<Extension> = ({ id, name, icons }) => {
  return (
    <Avatar id={id} className="w-5 h-5 text-xs text-white">
      <AvatarImage src={icons?.at(-1)?.url} alt={name} />
      <AvatarFallback className="bg-primary text-primary-foreground">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};

const ExtensionsCombobox: React.FC<ComboboxType> = ({ editedExtensionId, extensions, extensionRules, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(editedExtensionId || '');
  const selectedExtension = extensions.find((ext) => ext.id === value);
  const existedRulesIds = extensionRules.map((rule) => rule.id);

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    onSelect(currentValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full flex items-center gap-2 text-xs"
          disabled={!!editedExtensionId}
        >
          {selectedExtension && (
            <ExtensionLogo
              id={selectedExtension.id}
              name={selectedExtension.name}
              enabled={selectedExtension.enabled}
              icons={selectedExtension.icons}
            />
          )}
          <span className="w-[280px] flex-1 truncate text-left">
            {value ? extensions.find((ext) => ext.id === value)?.name : 'Select extension...'}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[370px] p-0 left-[20px] right-[20px]">
        <Command>
          <CommandInput placeholder="Search extension..." className="h-9" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No extension found.</CommandEmpty>
            <CommandGroup>
              {extensions
                .filter((ext) => !existedRulesIds.includes(ext.id))
                .map((ext) => (
                  <CommandItem className="text-xs" key={ext.id} value={ext.name} onSelect={() => handleSelect(ext.id)}>
                    <ExtensionLogo id={ext.id} name={ext.name} enabled={ext.enabled} icons={ext.icons} />
                    <div className="line-clamp-1">{ext.name}</div>
                    <Check className={cn('ml-auto', value === ext.id ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ExtensionsCombobox;
