import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleExtensionUrlRule } from '@/features/extension-rules/extension-rules-slice';
import useExtensions from '@/hooks/useExtensions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ExtensionRule } from '@/types';
import { cn, getDefaultExtensionState } from '@/lib/utils';

const ExtensionRulesList: React.FC = () => {
  const rules = useAppSelector((state) => state.extensionRules.entities);
  const { extensions } = useExtensions();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleToggleRule = async (rule: ExtensionRule) => {
    if (rule.active) {
      const defaultState = await getDefaultExtensionState(rule.id);
      await chrome.management.setEnabled(rule.id, defaultState.enabled);
    }

    dispatch(toggleExtensionUrlRule({ id: rule.id }));
  };

  return (
    <div className="mt-3 mb-5">
      <h2 className="muted-heading my-1 flex gap-1 items-center">
        <span>Extension Rules</span>
        <Tooltip>
          <TooltipTrigger aria-label="Help">
            <QuestionMarkCircledIcon className="opacity-60" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[240px] text-xs">
            <p>
              Extension Rules let you define when a specific extension should be enabled or disabled based on the page
              URL.
            </p>
          </TooltipContent>
        </Tooltip>
      </h2>
      {rules?.length > 0 && (
        <div className="mb-2 flex flex-col gap-1">
          {rules.map((rule: ExtensionRule) => {
            const extension = extensions.find((ext) => ext.id === rule.id);
            return (
              <div
                key={rule.id}
                className="flex items-center gap-2 rounded-md px-1 -mx-1 py-0.5 -my-0.5 hover:bg-muted/60 transition-colors"
              >
                <Avatar className={cn('w-5 h-5 text-xs text-white relative', { grayscale: !rule.active })}>
                  <AvatarImage src={extension?.icons?.at(-1)?.url} alt={extension?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {extension?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Link to={`/extension-rules/${rule.id}/edit/`} className="flex-1 line-clamp-1">
                  {rule.name}
                </Link>
                <Switch
                  checked={rule.active}
                  onCheckedChange={() => handleToggleRule(rule)}
                  aria-label={`Toggle ${rule.name}`}
                />
              </div>
            );
          })}
        </div>
      )}
      {rules.length < extensions.length && (
        <Button size="xs" variant="success" onClick={() => navigate('/extension-rules/new/')}>
          Add
        </Button>
      )}
    </div>
  );
};

export default ExtensionRulesList;
