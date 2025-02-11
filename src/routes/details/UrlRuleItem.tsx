import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircledIcon,
  DotsVerticalIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  removeUrlRule,
  updateUrlRule,
  UrlRule,
  UrlType,
} from '@/features/extensions/extensions-slice';
import { useAppDispatch } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const UrlRuleItem: React.FC<{
  rule: UrlRule;
  extensionId: string;
  type: UrlType;
}> = ({ rule, extensionId, type }) => {
  const [inputValue, setInputValue] = useState(rule.url);
  const dispatch = useAppDispatch();

  const handleChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSaveUrl = () => {
    dispatch(
      updateUrlRule({
        extensionId,
        urlId: rule.id,
        type,
        newUrl: inputValue,
      }),
    );
    toast({
      description: <span>Url Rule has been saved.</span>,
      className: cn('top-2 right-2 flex fixed max-w-[200px]'),
      duration: 3000,
    });
  };

  const handleRemoveUrl = () => {
    dispatch(
      removeUrlRule({
        extensionId,
        urlId: rule.id,
        type,
      }),
    );
    toast({
      description: <span>Url Rule has been removed.</span>,
      className: cn('top-2 right-2 flex fixed max-w-[200px]'),
      duration: 3000,
    });
  };

  useEffect(() => {
    setInputValue(rule.url);
  }, [rule.url, rule.id, extensionId]);

  return (
    <div className="flex gap-2 mb-2">
      <div className="relative flex-1">
        <Input
          placeholder="Enable on URL (e.g., *.google.com)"
          className="text-sm"
          value={inputValue}
          required
          onChange={handleChangeUrl}
          onBlur={handleSaveUrl}
        />
        {inputValue !== '' && inputValue !== rule.url && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0"
            onClick={handleSaveUrl}
            aria-label="Save"
            title="Save"
          >
            <CheckCircledIcon />
          </Button>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <DotsVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4">
          <DropdownMenuItem onClick={handleRemoveUrl}>
            <TrashIcon /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UrlRuleItem;
